// src/components/maintenance-limits-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Wrench } from 'lucide-react';
import type { Vehicle } from '@/types';

interface MaintenanceLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSave: (limits: NonNullable<Vehicle['maintenanceLimits']>) => void;
}

const DEFAULT_LIMITS = {
  "Óleo": { kmLimit: 1000, monthLimit: 6 },
  "Filtro de Ar": { kmLimit: 5000, monthLimit: 6 },
  "Pastilha de Freio": { kmLimit: 8000, monthLimit: 12 },
  "Relação (Corrente)": { kmLimit: 5000, monthLimit: 12 },
  "Pneu Dianteiro": { kmLimit: 15000, monthLimit: 24 },
  "Pneu Traseiro": { kmLimit: 12000, monthLimit: 24 },
  "Vela de Ignição": { kmLimit: 10000, monthLimit: 12 }
};

interface LimitItem {
  name: string;
  kmLimit: number;
  monthLimit: number;
}

export function MaintenanceLimitsModal({ isOpen, onClose, vehicle, onSave }: MaintenanceLimitsModalProps) {
  const [items, setItems] = useState<LimitItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemKm, setNewItemKm] = useState('5000');
  const [newItemMonths, setNewItemMonths] = useState('12');

  useEffect(() => {
    if (isOpen && vehicle) {
      const existingLimits = vehicle.maintenanceLimits || DEFAULT_LIMITS;
      const loadedItems = Object.entries(existingLimits).map(([name, val]) => ({
        name,
        kmLimit: val.kmLimit,
        monthLimit: val.monthLimit
      }));
      setItems(loadedItems);
      setNewItemName('');
    }
  }, [vehicle, isOpen]);

  const handleUpdateItem = (index: number, field: 'kmLimit' | 'monthLimit', value: number) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const name = newItemName.trim();
    if (items.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      alert("Já existe um item com esse nome.");
      return;
    }
    setItems(prev => [
      ...prev,
      {
        name,
        kmLimit: parseInt(newItemKm) || 1000,
        monthLimit: parseInt(newItemMonths) || 6
      }
    ]);
    setNewItemName('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const limitsObject: NonNullable<Vehicle['maintenanceLimits']> = {};
    items.forEach(item => {
      limitsObject[item.name] = {
        kmLimit: item.kmLimit,
        monthLimit: item.monthLimit
      };
    });
    onSave(limitsObject);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Limites de Manutenção: {vehicle?.name}
          </DialogTitle>
          <DialogDescription>
            Configure o tempo de uso máximo (em quilometragem ou meses) para cada peça/serviço do veículo. O sistema avisará quando expirar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Adicionar Novo Item */}
          <div className="p-4 rounded-xl border bg-muted/30 border-muted-foreground/10">
            <h4 className="text-sm font-semibold mb-3">Adicionar Peça Personalizada</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="part-name" className="text-xs">Nome da Peça</Label>
                <Input
                  id="part-name"
                  placeholder="Ex: Óleo, Pneu"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="part-km" className="text-xs">Limite (KM)</Label>
                <Input
                  id="part-km"
                  type="number"
                  placeholder="1000"
                  value={newItemKm}
                  onChange={(e) => setNewItemKm(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="part-months" className="text-xs">Limite (Meses)</Label>
                <Input
                  id="part-months"
                  type="number"
                  placeholder="6"
                  value={newItemMonths}
                  onChange={(e) => setNewItemMonths(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleAddItem} className="w-full flex gap-1 items-center justify-center">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Peças Ativas e Limites</h4>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum item configurado.</p>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-card/80">
                    <span className="font-bold text-sm min-w-[150px]">{item.name}</span>
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs shrink-0 text-muted-foreground">KM Máximo:</Label>
                        <Input
                          type="number"
                          className="w-24 h-9"
                          value={item.kmLimit}
                          onChange={(e) => handleUpdateItem(idx, 'kmLimit', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs shrink-0 text-muted-foreground">Meses:</Label>
                        <Input
                          type="number"
                          className="w-20 h-9"
                          value={item.monthLimit}
                          onChange={(e) => handleUpdateItem(idx, 'monthLimit', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9 shrink-0 ml-auto sm:ml-0"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSave}>Salvar Limites</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
