// src/components/stops-review-screen.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Check, X, Map } from "lucide-react";
import type { Stop, StopCategory } from '@/types/stop';
import { getAllStopsByStatus, saveStop } from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  const handleUpdateStatus = async (stop: Stop, status: 'confirmed' | 'ignored', category?: StopCategory, address?: string) => {
    const updatedStop: Stop = { ...stop, status, category, address };
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
              <PendingStopCard
                key={stop.id}
                stop={stop}
                onConfirm={(cat, addr) => handleUpdateStatus(stop, 'confirmed', cat, addr)}
                onIgnore={() => handleUpdateStatus(stop, 'ignored')}
                openInMaps={() => openInMaps(stop)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center gap-2 text-muted-foreground border-dashed border-2 p-12 rounded-lg">
              <Check className="h-10 w-10 text-green-500" />
              <p>Nenhuma parada pendente para revisão.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PendingStopCard({ stop, onConfirm, onIgnore, openInMaps }: { 
  stop: Stop, 
  onConfirm: (category: StopCategory, address: string) => void, 
  onIgnore: () => void, 
  openInMaps: () => void 
}) {
  const [address, setAddress] = useState<string>(stop.address || 'Carregando endereço...');
  const [category, setCategory] = useState<StopCategory>('delivery');

  useEffect(() => {
    if (stop.address) return;

    const { latitude, longitude } = stop.location;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      })
      .catch(() => {
        setAddress(`Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      });
  }, [stop]);

  return (
    <Card className="p-4 space-y-3">
      <div className='flex justify-between items-start'>
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-bold truncate text-sm">Parada Detectada</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(stop.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
          </p>
          <p className="text-xs mt-1 text-primary font-medium">{address}</p>
        </div>
        <Button variant="outline" size="icon" onClick={openInMaps} className="flex-shrink-0">
          <Map className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Classificar Parada</Label>
          <Select value={category} onValueChange={(val: StopCategory) => setCategory(val)}>
            <SelectTrigger className="w-full h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">Entrega</SelectItem>
              <SelectItem value="traffic_light">Sinal/Semáforo</SelectItem>
              <SelectItem value="junction">Cruzamento</SelectItem>
              <SelectItem value="gas_station">Posto de Gasolina</SelectItem>
              <SelectItem value="other">Parada Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-2">
          <Button className="flex-1 h-9 text-xs" onClick={() => onConfirm(category, address)}>
            <Check className="mr-1 h-3.5 w-3.5" /> Confirmar
          </Button>
          <Button className="flex-1 h-9 text-xs" variant="destructive" onClick={onIgnore}>
            <X className="mr-1 h-3.5 w-3.5" /> Ignorar
          </Button>
        </div>
      </div>
    </Card>
  );
}
