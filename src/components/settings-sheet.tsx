"use client";

import type { Dispatch, SetStateAction } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon } from "lucide-react";
import type { Settings } from '@/app/page';

type SettingsSheetProps = {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
};

export function SettingsSheet({ settings, setSettings }: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir configurações">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>Configurações</SheetTitle>
          <SheetDescription>
            Ajuste as configurações de rastreamento e contagem automática.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="space-y-6 py-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-count" className="text-base">Contagem Automática</Label>
              <p className="text-sm text-muted-foreground">
                Detectar entregas automaticamente por geolocalização.
              </p>
            </div>
            <Switch
              id="auto-count"
              checked={settings.autoCount}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, autoCount: checked }))}
              aria-label="Ativar contagem automática"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop-duration">Duração da Parada (segundos)</Label>
            <Input
              id="stop-duration"
              type="number"
              value={settings.stopDuration}
              onChange={(e) => setSettings(s => ({ ...s, stopDuration: parseInt(e.target.value) || 0 }))}
              placeholder="Ex: 60"
              disabled={!settings.autoCount}
            />
            <p className="text-xs text-muted-foreground">
              Tempo mínimo parado para registrar uma entrega.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-radius">Raio da Base (metros)</Label>
            <Input
              id="base-radius"
              type="number"
              value={settings.baseRadius}
              onChange={(e) => setSettings(s => ({ ...s, baseRadius: parseInt(e.target.value) || 0 }))}
              placeholder="Ex: 200"
              disabled={!settings.autoCount}
            />
            <p className="text-xs text-muted-foreground">
              Distância mínima da base para contar uma entrega.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
