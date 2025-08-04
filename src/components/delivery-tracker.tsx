"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSheet } from "@/components/settings-sheet";
import { Truck, Plus, Minus, Play, Square, MapPin, PauseCircle, AlertTriangle, RotateCcw } from "lucide-react";
import type { Settings, Status } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";


// Função de cálculo de distância
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
  // --- ESTADOS E REFS ---
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    autoCount: true,
    stopDuration: 60,
    baseRadius: 200,
  });
  const watchIdRef = useRef<number | null>(null);
  const [lastDeliveryLocation, setLastDeliveryLocation] = useState<GeolocationCoordinates | null>(null);
  const [origin, setOrigin] = useState<GeolocationCoordinates | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);


  // --- EFEITOS (localStorage) ---
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

  useEffect(() => {
    if (isMounted) localStorage.setItem('runDeliveryCount', JSON.stringify(count));
  }, [count, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('runDeliverySettings', JSON.stringify(settings));
  }, [settings, isMounted]);

  // --- LÓGICA PRINCIPAL ---
  const status: Status = useMemo(() => {
    if (isTracking) return "Tracking Active";
    return "Paused";
  }, [isTracking]);

  const handleIncrement = () => setCount(c => c + 1);
  const handleDecrement = () => setCount(c => Math.max(0, c - 1));

  const handleResetCount = () => {
    setIsResetDialogOpen(true);
  };
  
  const confirmReset = () => {
    setCount(0);
    setIsResetDialogOpen(false);
  };

  const processNewPosition = (position: GeolocationPosition) => {
    const { coords } = position;
    const speed = coords.speed === null ? 0 : coords.speed * 3.6; // km/h
    if (speed > 2) {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      return;
    }
    if (stopTimerRef.current) return;
    stopTimerRef.current = setTimeout(() => {
      if (!settings.autoCount || !origin) return;
      const distanceFromOrigin = getDistanceInMeters(coords, origin);
      if (distanceFromOrigin < settings.baseRadius) return;
      if (lastDeliveryLocation) {
        const distanceFromLast = getDistanceInMeters(coords, lastDeliveryLocation);
        if (distanceFromLast < 150) return;
      }
      handleIncrement();
      setLastDeliveryLocation(coords);
      stopTimerRef.current = null;
    }, settings.stopDuration * 1000);
  };

  const handleToggleTracking = () => {
    if (isTracking) {
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

    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        setOrigin(initialPosition.coords);
        setIsTracking(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          processNewPosition,
          (error) => {
            console.error("Erro durante o rastreamento:", error);
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      },
      (error) => {
        console.error("Erro de permissão:", error);
        alert(`Erro ao obter localização: ${error.message}`);
      }
    );
  };

  // --- COMPONENTES DE UI E RENDERIZAÇÃO ---
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
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button onClick={handleResetCount} variant="ghost" size="icon" aria-label="Zerar contador">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <SettingsSheet settings={settings} setSettings={setSettings} />
        </div>
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
       <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá zerar permanentemente o seu contador de entregas de hoje.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Sim, zerar contador</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
