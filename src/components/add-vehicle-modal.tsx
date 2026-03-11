"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vehicle } from '@/types/vehicle';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id'>, id?: string) => void;
  vehicleToEdit?: Vehicle | null;
}

export function AddVehicleModal({ isOpen, onClose, onSave, vehicleToEdit }: AddVehicleModalProps) {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [consumption, setConsumption] = useState('');

  useEffect(() => {
    if (vehicleToEdit) {
      setName(vehicleToEdit.name);
      setPlate(vehicleToEdit.plate || '');
      setConsumption(String(vehicleToEdit.averageConsumption));
    } else {
      // Limpa os campos se for para adicionar um novo
      setName('');
      setPlate('');
      setConsumption('');
    }
  }, [vehicleToEdit, isOpen]);

  const handleSubmit = () => {
    if (!name || !consumption) {
      alert("Nome e Consumo são obrigatórios.");
      return;
    }
    onSave(
      {
        name,
        plate,
        averageConsumption: parseFloat(consumption),
      },
      vehicleToEdit?.id // Passa o ID se estiver editando
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vehicleToEdit ? 'Editar Veículo' : 'Adicionar Novo Veículo'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Veículo (Ex: Moto, Carro)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plate">Placa (Opcional)</Label>
            <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consumption">Consumo Médio (km/L)</Label>
            <Input id="consumption" type="number" value={consumption} onChange={(e) => setConsumption(e.target.value)} placeholder="Ex: 35.5" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>{vehicleToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
