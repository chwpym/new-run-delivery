"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsSheet } from "@/components/settings-sheet";
import { Truck, Plus, Minus, Play, Square, MapPin, PauseCircle, AlertTriangle } from "lucide-react";

type Status = "Paused" | "Tracking Active" | "GPS Error";
export type Settings = {
  autoCount: boolean;
  stopDuration: number;
  baseRadius: number;
};

export default function DeliveryTracker() {
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    autoCount: true,
    stopDuration: 60,
    baseRadius: 200,
  });

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
  const handleToggleTracking = () => setIsTracking(t => !t);

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
