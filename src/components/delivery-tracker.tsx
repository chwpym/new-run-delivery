"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSheet } from "@/components/settings-sheet";
import { Truck, Plus, Minus, Play, Square, MapPin, PauseCircle, AlertTriangle } from "lucide-react";
import type { Settings, Status } from '@/types';

function getDistanceInMeters(coord1: GeolocationCoordinates, coord2: GeolocationCoordinates) {
  const R = 6371e3; // Raio da Terra em metros
  const lat1 = coord1.latitude * Math.PI / 180;
  const lat2 = coord2.latitude * Math.PI / 180;
  const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default function DeliveryTracker() {
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    autoCount: true,
    stopDuration: 60,
    baseRadius: 200,
  });
  const watchIdRef = useRef<number | null>(null);
  const [lastPosition, setLastPosition] = useState<GeolocationCoordinates | null>(null);
  const [lastDeliveryLocation, setLastDeliveryLocation] = useState<GeolocationCoordinates | null>(null);
  const [origin, setOrigin] = useState<GeolocationCoordinates | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('runDeliveryCount');
      if (savedCount) setCount(JSON.parse(savedCount));

      const savedSettings = localStorage.getItem('runDeliverySettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  // Save count to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('runDeliveryCount', JSON.stringify(count));
    }
  }, [count, isMounted]);

  // Save settings to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('runDeliverySettings', JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  const status: Status = useMemo(() => {
    if (isTracking) return "Tracking Active";
    return "Paused";
  }, [isTracking]);

  const handleIncrement = () => setCount(c => c + 1);
  const handleDecrement = () => setCount(c => Math.max(0, c - 1));

  const processNewPosition = (position: GeolocationPosition) => {
    const { coords } = position;
    const speed = coords.speed === null ? 0 : coords.speed * 3.6; // km/h
      // Se estiver se movendo, cancela qualquer timer de parada
      if (speed > 2) {
        if (stopTimerRef.current) {
          clearTimeout(stopTimerRef.current);
          stopTimerRef.current = null;
        }
        return;
      }
    
      // Se já existe um timer de parada rodando, não faz nada
      if (stopTimerRef.current) {
        return;
      }
    
      // Se está parado, inicia um timer
      stopTimerRef.current = setTimeout(() => {
        if (!settings.autoCount || !origin) return;
    
        const distanceFromOrigin = getDistanceInMeters(coords, origin);
        if (distanceFromOrigin < settings.baseRadius) return;
    
        if (lastDeliveryLocation) {
          const distanceFromLast = getDistanceInMeters(coords, lastDeliveryLocation);
          if (distanceFromLast < 150) return; // Evita contagem dupla
        }
    
        handleIncrement(); // Reutiliza a função de incremento manual
        setLastDeliveryLocation(coords);
        stopTimerRef.current = null; // Limpa o timer após a contagem
      }, settings.stopDuration * 1000); // Converte segundos para milissegundos
    };

  const handleToggleTracking = () => {
    if (isTracking && watchIdRef.current !== null) {
      // Se já está rastreando e o usuário clica para parar.
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      return;
    }

    // Se está iniciando o rastreamento
    if (!navigator.geolocation) {
      // setStatus("GPS Error"); // Você pode adicionar isso depois
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        // Sucesso ao obter a posição inicial
        setOrigin(initialPosition.coords);
        setIsTracking(true);

        // Inicia o monitoramento contínuo
        watchIdRef.current = navigator.geolocation.watchPosition(
          (currentPosition) => {
            processNewPosition(currentPosition);
          },
          (error) => {
            console.error("Erro durante o rastreamento:", error);
            // Limpa o watch ID antigo para garantir que não haja duplicatas
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
            // Tenta reiniciar o rastreamento
            setIsTracking(false); // Força o estado para 'parado'
            setTimeout(() => handleToggleTracking(), 2000); // Tenta reiniciar após 2 segundos
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },
      (error) => {
        // Erro ao obter a posição inicial (provavelmente permissão negada)
        console.error("Erro de permissão:", error);
        alert(`Erro ao obter localização: ${error.message}`);
        // setStatus("GPS Error"); // Você pode adicionar isso depois
      }
    );
  };

  const StatusDisplay = () => {
    const statusInfo = {
      "Paused": { icon: <PauseCircle className="h-4 w-4" />, text: "Pausado", color: "text-muted-foreground" },
      "Tracking Active": { icon: <MapPin className="h-4 w-4" />, text: "Rastreamento Ativo", color: "text-primary" },
      "GPS Error": { icon: <AlertTriangle className="h-4 w-4" />, text: "Erro de GPS", color: "text-destructive" },
    };
    const currentStatus = statusInfo[status];
    return (
      <div className={`flex items-center justify-center gap-2 text-sm font-medium ${currentStatus.color}`}>
        {currentStatus.icon}
        <span>{currentStatus.text}</span>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Truck className="h-16 w-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-headline">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">RunDelivery</h1>
        </div>
        <SettingsSheet settings={settings} setSettings={setSettings} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4 text-center">
        <Card className="w-full max-w-xs shadow-lg bg-card">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Entregas de Hoje</p>
            <p className="text-8xl font-bold tracking-tighter text-primary">{count}</p>
          </CardContent>
        </Card>

        <div className="flex w-full max-w-xs gap-4">
          <Button variant="outline" size="lg" className="flex-1" onClick={handleDecrement} aria-label="Remover uma entrega">
            <Minus className="h-5 w-5 mr-2" /> -1 Entrega
          </Button>
          <Button size="lg" className="flex-1" onClick={handleIncrement} aria-label="Adicionar uma entrega">
            <Plus className="h-5 w-5 mr-2" /> +1 Entrega
          </Button>
        </div>

        <StatusDisplay />
      </main>

      <footer className="p-4">
        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-bold"
          onClick={handleToggleTracking}
          variant={isTracking ? "destructive" : "default"}
        >
          {isTracking ? (
            <>
              <Square className="h-6 w-6 mr-3" /> Parar Rota
            </>
          ) : (
            <>
              <Play className="h-6 w-6 mr-3" /> Iniciar Rota
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
