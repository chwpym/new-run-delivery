"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vehicle } from './vehicles-screen';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
}

export function AddVehicleModal({ isOpen, onClose, onAddVehicle }: AddVehicleModalProps) {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [consumption, setConsumption] = useState('');

  const handleSubmit = () => {
    if (!name || !consumption) {
      alert("Nome e Consumo são obrigatórios.");
      return;
    }
    onAddVehicle({
      name,
      plate,
      averageConsumption: parseFloat(consumption),
    });
    onClose(); // Fecha o modal
    // Limpa os campos
    setName('');
    setPlate('');
    setConsumption('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Veículo</DialogTitle>
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
          <Button onClick={handleSubmit}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
