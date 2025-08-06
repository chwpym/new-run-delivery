// src/components/add-refuel-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from './ui/date-picker';
import type { Refuel, Vehicle } from '@/types';
import { format } from 'date-fns';

interface AddRefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Refuel, 'id'>, id?: string) => void;
  refuelToEdit?: Refuel | null;
  vehicles: Vehicle[];
}

export function AddRefuelModal({ isOpen, onClose, onSave, refuelToEdit, vehicles }: AddRefuelModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [vehicleId, setVehicleId] = useState<string>('');
  const [value, setValue] = useState('');
  const [liters, setLiters] = useState('');
  const [km, setKm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (refuelToEdit) {
        setDate(new Date(refuelToEdit.date));
        setVehicleId(refuelToEdit.vehicleId);
        setValue(String(refuelToEdit.value));
        setLiters(String(refuelToEdit.liters));
        setKm(String(refuelToEdit.km));
      } else {
        setDate(new Date());
        setVehicleId(vehicles[0]?.id || '');
        setValue('');
        setLiters('');
        setKm('');
      }
    }
  }, [refuelToEdit, isOpen, vehicles]);

  const handleSubmit = () => {
    if (!date || !vehicleId || !value || !liters || !km) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    onSave(
      {
        date: format(date, 'yyyy-MM-dd'),
        vehicleId,
        value: parseFloat(value),
        liters: parseFloat(liters),
        km: parseInt(km),
      },
      refuelToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{refuelToEdit ? 'Editar Abastecimento' : 'Adicionar Abastecimento'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do abastecimento.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Veículo</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
              <Label htmlFor="value">Valor Total (R$)</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liters">Litros (L)</Label>
              <Input id="liters" type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">KM do Veículo</Label>
              <Input id="km" type="number" value={km} onChange={(e) => setKm(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{refuelToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
