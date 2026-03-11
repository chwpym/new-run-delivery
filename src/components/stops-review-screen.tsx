// src/components/stops-review-screen.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Check, X, Map } from "lucide-react";
import type { Stop } from '@/types';
import { getAllStopsByStatus, saveStop } from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StopsReviewScreenProps {
  onConfirmDelivery: () => void;
}

export function StopsReviewScreen({ onConfirmDelivery }: StopsReviewScreenProps) {
  const [pendingStops, setPendingStops] = useState<Stop[]>([]);

  const fetchStops = useCallback(async () => {
    const stops = await getAllStopsByStatus('pending');
    setPendingStops(stops.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  const handleUpdateStatus = async (stop: Stop, status: 'confirmed' | 'ignored') => {
    const updatedStop = { ...stop, status };
    await saveStop(updatedStop);
    if (status === 'confirmed') {
      onConfirmDelivery(); // Notifica o componente pai para atualizar a contagem
    }
    fetchStops(); // Recarrega a lista de paradas pendentes
  };
  
  const openInMaps = (stop: Stop) => {
    const { latitude, longitude } = stop.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Auditoria de Paradas</CardTitle>
              <CardDescription>Confirme ou ignore as paradas detectadas pelo GPS.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingStops.length > 0 ? (
            pendingStops.map(stop => (
              <Card key={stop.id} className="p-4 space-y-3">
                <div className='flex justify-between items-start'>
                  <div>
                    <p className="font-bold">Parada Detectada</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(stop.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => openInMaps(stop)}>
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleUpdateStatus(stop, 'confirmed')}>
                    <Check className="mr-2 h-4 w-4" /> Confirmar Entrega
                  </Button>
                  <Button className="flex-1" variant="destructive" onClick={() => handleUpdateStatus(stop, 'ignored')}>
                    <X className="mr-2 h-4 w-4" /> Ignorar
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2 text-muted-foreground">
              <Check className="h-12 w-12 text-green-500" />
              <p>Nenhuma parada pendente para revisão.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
