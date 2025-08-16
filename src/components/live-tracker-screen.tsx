// src/components/live-tracker-screen.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Play, Square, MapPin, PauseCircle, AlertTriangle, BookCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Settings, Status, DailyEntry, Vehicle, Stop } from '@/types';
import type { Company } from '@/types/company';
import { playErrorSound, playSuccessSound, vibrateError, vibrateSuccess } from '@/lib/alerts';
import { AddEntryModal } from './add-entry-modal';
import { getEntryById, saveDailyEntry, saveStop, clearAllStops } from '@/lib/db';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


function getDistanceInMeters(coord1: {latitude: number, longitude: number}, coord2: {latitude: number, longitude: number}) {
  const R = 6371e3;
  const lat1 = coord1.latitude * Math.PI / 180;
  const lat2 = coord2.latitude * Math.PI / 180;
  const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface LiveTrackerScreenProps {
  count: number;
  setCount: (value: number | ((prev: number) => number)) => void;
  settings: Settings;
  companies: Company[];
  vehicles: Vehicle[];
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

export function LiveTrackerScreen({ count, setCount, settings, companies, vehicles, activeCompanyId, setActiveCompanyId }: LiveTrackerScreenProps) {
  const [status, setStatus] = useState<Status>('Paused');
  const [origin, setOrigin] = useState<Company['baseLocation'] | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DailyEntry | null>(null);
  const { toast } = useToast();

  const isTracking = useMemo(() => status === 'Tracking Active', [status]);
  
  const lastPositionRef = useRef<GeolocationCoordinates | null>(null);
  const stopStartTimeRef = useRef<number | null>(null);
  const lastStopLocationRef = useRef<GeolocationCoordinates | null>(null);


  const requestWakeLock = async () => { if ('wakeLock' in navigator) { try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (err: any) { console.error(`${err.name}, ${err.message}`); } } };
  const releaseWakeLock = async () => { if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; } };

  // Função para lidar com o INCREMENTO manual
  const handleManualIncrement = () => {
    if (!navigator.geolocation) return alert("GPS não suportado para registrar a localização.");
    
    // Pega a localização atual para salvar o ponto da entrega manual
    navigator.geolocation.getCurrentPosition(async (position) => {
      const newStop: Stop = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        status: 'pending', // Salva como pendente para auditoria
      };
      await saveStop(newStop);
      toast({
          title: "Parada Manual Adicionada!",
          description: "Verifique na tela de auditoria para confirmar a entrega.",
      });
      vibrateSuccess(); // Vibra para dar feedback
    }, () => {
      alert("Não foi possível obter a localização para a contagem manual. A entrega não foi registrada.");
    }, { enableHighAccuracy: true });
  };
  
  // Função para lidar com o DECREMENTO manual
  const handleManualDecrement = () => {
     toast({
      variant: "destructive",
      title: "Ação não implementada",
      description: "A remoção de entregas deve ser feita na tela de auditoria ou registros.",
    });
  };

  const processNewPosition = useCallback(async (position: GeolocationPosition) => {
    if (status !== 'Tracking Active') setStatus('Tracking Active');
    
    const { coords } = position;
    const now = Date.now();

    if (!lastPositionRef.current) {
      lastPositionRef.current = coords;
      return;
    }

    const distanceMoved = getDistanceInMeters(lastPositionRef.current, coords);

    if (distanceMoved > 50) { // Se moveu, reseta o timer de parada
      lastPositionRef.current = coords;
      stopStartTimeRef.current = null; 
    } else { // Se não se moveu (ou moveu pouco)
      if (!stopStartTimeRef.current) { // Se o timer não foi iniciado, inicie agora
        stopStartTimeRef.current = now;
      }
      
      const timeStopped = (now - stopStartTimeRef.current) / 1000;

      // Se o tempo parado exceder a duração configurada
      if (timeStopped >= settings.stopDuration) {
        if (!settings.autoCount || !origin) return;

        // Verifica se a parada está fora da base
        const distanceFromOrigin = getDistanceInMeters(coords, origin);
        if (distanceFromOrigin < settings.baseRadius) return;

        // Verifica se a parada é muito perto da última registrada para evitar duplicatas
        if (lastStopLocationRef.current) {
          const distanceFromLastStop = getDistanceInMeters(coords, lastStopLocationRef.current);
          if (distanceFromLastStop < 150) return;
        }
        
        // Cria a nova parada com status PENDENTE para auditoria
        const newStop: Stop = {
          id: new Date().toISOString(),
          timestamp: now,
          location: { latitude: coords.latitude, longitude: coords.longitude },
          status: 'pending',
        };
        await saveStop(newStop);

        toast({
          title: "Parada Automática Detectada!",
          description: "Verifique na tela de auditoria para confirmar a entrega.",
        });
        vibrateSuccess();

        // Atualiza a localização da última parada e reseta o timer
        lastStopLocationRef.current = coords;
        stopStartTimeRef.current = null; 
      }
    }
  }, [status, settings, origin, toast]);


  const handleToggleTracking = async () => {
    if (isTracking) {
      if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
      setStatus('Paused'); 
      setOrigin(null);
      releaseWakeLock();
      lastPositionRef.current = null;
      stopStartTimeRef.current = null;
      return;
    }
    if (!navigator.geolocation) { return alert("Geolocalização não é suportada."); }
    if (!activeCompanyId) { return alert("Selecione uma empresa."); }
    const selectedCompany = companies.find(c => c.id === activeCompanyId);
    if (!selectedCompany?.baseLocation) { return alert("Empresa sem base cadastrada."); }
    
    // Limpa paradas antigas antes de iniciar
    await clearAllStops();
    setCount(0); // Reseta o contador de entregas do dia
    
    setOrigin(selectedCompany.baseLocation); 
    setStatus('Tracking Active'); 
    requestWakeLock();
    lastPositionRef.current = null;
    stopStartTimeRef.current = null;
    lastStopLocationRef.current = null;
    
    watchIdRef.current = navigator.geolocation.watchPosition(processNewPosition, (error) => {
      console.error("Erro GPS:", error); 
      setStatus('GPS Error');
      playErrorSound();
      vibrateError();
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  };
  
  const handleEndDay = async () => {
    if (isTracking) handleToggleTracking();
    
    const todayId = format(new Date(), 'yyyy-MM-dd');
    let entry = await getEntryById(todayId);
    
    if (entry) {
        entry.deliveriesCount = count;
    } else {
        entry = {
            id: todayId,
            date: todayId,
            isDayOff: false,
            companyId: activeCompanyId || undefined,
            deliveriesCount: count,
        }
    }
    setEntryToEdit(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (entryData: DailyEntry) => {
    await saveDailyEntry(entryData);
    setEntryToEdit(null);
    setIsEntryModalOpen(false);
    setCount(0);
    await clearAllStops();
  };


  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      releaseWakeLock();
    }
  }, []);

  const StatusDisplay = () => {
    const statusInfo: Record<Status, { icon: JSX.Element; text: string; color: string; }> = { "Paused": { icon: <PauseCircle className="h-4 w-4" />, text: "Pausado", color: "text-muted-foreground" }, "Tracking Active": { icon: <MapPin className="h-4 w-4" />, text: "Rastreamento Ativo", color: "text-primary" }, "GPS Error": { icon: <AlertTriangle className="h-4 w-4" />, text: "Erro de GPS", color: "text-destructive" } };
    const currentStatus = statusInfo[status];
    return <div className={`flex items-center justify-center gap-2 text-sm font-medium ${currentStatus.color}`}>{currentStatus.icon}<span>{currentStatus.text}</span></div>;
  };

  return (
    <>
      <div className="flex flex-col items-center justify-between p-4 flex-1">
        <div className="w-full max-w-xs space-y-6 text-center">
            <Select value={activeCompanyId || ''} onValueChange={setActiveCompanyId} disabled={isTracking}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa..." /></SelectTrigger>
                <SelectContent>{companies.length > 0 ? companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) : <div className="p-2 text-sm text-muted-foreground">Nenhuma empresa.</div>}</SelectContent>
            </Select>
            <Card className="w-full max-w-xs shadow-lg bg-card mx-auto">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Entregas Confirmadas</p>
                    <p className="text-8xl font-bold tracking-tighter text-primary">{count}</p>
                </CardContent>
            </Card>
            <div className="flex w-full max-w-xs gap-4">
                <Button variant="outline" size="lg" className="flex-1" onClick={handleManualDecrement}><Minus className="h-5 w-5 mr-2" /> -1</Button>
                <Button size="lg" className="flex-1" onClick={handleManualIncrement}><Plus className="h-5 w-5 mr-2" /> +1</Button>
            </div>
            <StatusDisplay />
        </div>

        <div className="w-full max-w-xs space-y-2">
            <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={handleEndDay} variant="secondary">
                <BookCheck className="h-6 w-6 mr-3" /> Encerrar Dia e Registrar
            </Button>
            <Button size="lg" className="w-full h-16 text-lg font-bold" onClick={handleToggleTracking} variant={isTracking ? "destructive" : "default"}>
                {isTracking ? <><Square className="h-6 w-6 mr-3" /> Parar Rota</> : <><Play className="h-6 w-6 mr-3" /> Iniciar Rota</>}
            </Button>
        </div>
      </div>

       <AddEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        entryToEdit={entryToEdit}
        companies={companies}
        vehicles={vehicles}
        deliveryCount={count}
      />
    </>
  );
}
