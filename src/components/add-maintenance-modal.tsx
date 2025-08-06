// src/components/add-maintenance-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from './ui/date-picker';
import type { Maintenance, Vehicle } from '@/types';
import { format } from 'date-fns';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Maintenance, 'id'>, id?: string) => void;
  itemToEdit?: Maintenance | null;
  vehicles: Vehicle[];
}

export function AddMaintenanceModal({ isOpen, onClose, onSave, itemToEdit, vehicles }: AddMaintenanceModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [vehicleId, setVehicleId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [km, setKm] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setDate(new Date(itemToEdit.date));
        setVehicleId(itemToEdit.vehicleId);
        setDescription(itemToEdit.description);
        setValue(String(itemToEdit.value));
        setKm(String(itemToEdit.km));
      } else {
        setDate(new Date());
        setVehicleId(vehicles[0]?.id || '');
        setDescription('');
        setValue('');
        setKm('');
      }
    }
  }, [itemToEdit, isOpen, vehicles]);

  const handleSubmit = () => {
    if (!date || !vehicleId || !value || !description || !km) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    onSave(
      {
        date: format(date, 'yyyy-MM-dd'),
        vehicleId,
        description,
        value: parseFloat(value),
        km: parseInt(km),
      },
      itemToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Editar Manutenção' : 'Adicionar Manutenção'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do serviço realizado.</DialogDescription>
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
          <div className="space-y-2">
              <Label htmlFor="description">Descrição do Serviço</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Troca de óleo e filtro"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="value">Custo Total (R$)</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">KM do Veículo</Label>
              <Input id="km" type="number" value={km} onChange={(e) => setKm(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{itemToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
