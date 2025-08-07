// src/components/live-tracker-screen.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Play, Square, MapPin, PauseCircle, AlertTriangle, BookCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Settings, Status, DailyEntry, Vehicle } from '@/types';
import type { Company } from '@/types/company';
import { playErrorSound, playSuccessSound, vibrateError, vibrateSuccess } from '@/lib/alerts';
import { AddEntryModal } from './add-entry-modal';
import { getEntryById, saveDailyEntry } from '@/lib/db';
import { format } from 'date-fns';


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
  setCount: (fn: (c: number) => number) => void;
  settings: Settings;
  companies: Company[];
  vehicles: Vehicle[];
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

export function LiveTrackerScreen({ count, setCount, settings, companies, vehicles, activeCompanyId, setActiveCompanyId }: LiveTrackerScreenProps) {
  const [status, setStatus] = useState<Status>('Paused');
  const [origin, setOrigin] = useState<Company['baseLocation'] | null>(null);
  const [lastDeliveryLocation, setLastDeliveryLocation] = useState<GeolocationCoordinates | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DailyEntry | null>(null);

  const isTracking = useMemo(() => status === 'Tracking Active', [status]);

  const requestWakeLock = async () => { if ('wakeLock' in navigator) { try { wakeLockRef.current = await navigator.wakeLock.request('screen'); } catch (err: any) { console.error(`${err.name}, ${err.message}`); } } };
  const releaseWakeLock = async () => { if (wakeLockRef.current) { await wakeLockRef.current.release(); wakeLockRef.current = null; } };

  const handleIncrement = () => {
    setCount(c => c + 1);
    playSuccessSound();
    vibrateSuccess();
  }
  const handleDecrement = () => setCount(c => Math.max(0, c - 1));

  const processNewPosition = (position: GeolocationPosition) => {
    if (status !== 'Tracking Active') setStatus('Tracking Active');
    const { coords } = position;
    const speed = coords.speed === null ? 0 : coords.speed * 3.6;
    if (speed > 2) { if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; } return; }
    if (stopTimerRef.current) return;
    stopTimerRef.current = setTimeout(() => {
      if (!settings.autoCount || !origin) { stopTimerRef.current = null; return; }
      const distanceFromOrigin = getDistanceInMeters(coords, origin);
      if (distanceFromOrigin < settings.baseRadius) { stopTimerRef.current = null; return; }
      if (lastDeliveryLocation) {
        const distanceFromLast = getDistanceInMeters(coords, lastDeliveryLocation);
        if (distanceFromLast < 150) { stopTimerRef.current = null; return; }
      }
      handleIncrement();
      setLastDeliveryLocation(coords);
      stopTimerRef.current = null;
    }, settings.stopDuration * 1000);
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
      setStatus('Paused'); setOrigin(null); releaseWakeLock();
      if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
      return;
    }
    if (!navigator.geolocation) { return alert("Geolocalização não é suportada."); }
    if (!activeCompanyId) { return alert("Selecione uma empresa."); }
    const selectedCompany = companies.find(c => c.id === activeCompanyId);
    if (!selectedCompany?.baseLocation) { return alert("Empresa sem base cadastrada."); }
    setOrigin(selectedCompany.baseLocation); 
    setStatus('Tracking Active'); 
    requestWakeLock();
    watchIdRef.current = navigator.geolocation.watchPosition(processNewPosition, (error) => {
      console.error("Erro GPS:", error); 
      setStatus('GPS Error');
      playErrorSound();
      vibrateError();
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  };
  
  const handleEndDay = async () => {
    if (isTracking) handleToggleTracking(); // Para o rastreamento se estiver ativo
    
    const todayId = format(new Date(), 'yyyy-MM-dd');
    let entry = await getEntryById(todayId);
    
    // Se não houver registro, cria um novo objeto. Se houver, usa o existente.
    if (entry) {
        entry.deliveriesCount = count; // Atualiza o contador de entregas
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
    setEntryToEdit(null); // Limpa o estado
    setIsEntryModalOpen(false); // Fecha o modal
    // Pode ser útil resetar o contador após salvar
    setCount(() => 0); 
  };


  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
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
      <div className="flex flex-col items-center justify-start p-4 space-y-6">
        <div className="w-full max-w-xs space-y-6 text-center">
            <Select value={activeCompanyId || ''} onValueChange={setActiveCompanyId} disabled={isTracking}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa..." /></SelectTrigger>
                <SelectContent>{companies.length > 0 ? companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) : <div className="p-2 text-sm text-muted-foreground">Nenhuma empresa.</div>}</SelectContent>
            </Select>
            <Card className="w-full max-w-xs shadow-lg bg-card mx-auto">
                <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Entregas de Hoje</p>
                    <p className="text-8xl font-bold tracking-tighter text-primary">{count}</p>
                </CardContent>
            </Card>
            <div className="flex w-full max-w-xs gap-4">
                <Button variant="outline" size="lg" className="flex-1" onClick={handleDecrement}><Minus className="h-5 w-5 mr-2" /> -1</Button>
                <Button size="lg" className="flex-1" onClick={handleIncrement}><Plus className="h-5 w-5 mr-2" /> +1</Button>
            </div>
            <StatusDisplay />
        </div>

        <div className="w-full max-w-xs space-y-2 pt-4">
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
