// src/components/add-refuel-modal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
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
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [liters, setLiters] = useState('');
  const [km, setKm] = useState('');

  // Calcula o valor total automaticamente
  const totalValue = useMemo(() => {
    const p = parseFloat(pricePerLiter) || 0;
    const l = parseFloat(liters) || 0;
    return p * l;
  }, [pricePerLiter, liters]);

  useEffect(() => {
    if (isOpen) {
      if (refuelToEdit) {
        // Modo Edição: Calcula o preço por litro a partir dos dados salvos
        const savedPrice = refuelToEdit.value && refuelToEdit.liters ? refuelToEdit.value / refuelToEdit.liters : 0;
        setDate(new Date(refuelToEdit.date));
        setVehicleId(refuelToEdit.vehicleId);
        setPricePerLiter(String(savedPrice.toFixed(3) || ''));
        setLiters(String(refuelToEdit.liters));
        setKm(String(refuelToEdit.km));
      } else {
        // Modo Adição: Limpa os campos
        setDate(new Date());
        setVehicleId(vehicles[0]?.id || '');
        setPricePerLiter('');
        setLiters('');
        setKm('');
      }
    }
  }, [refuelToEdit, isOpen, vehicles]);

  const handleSubmit = () => {
    if (!date || !vehicleId || !pricePerLiter || !liters || !km) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    onSave(
      {
        date: format(date, 'yyyy-MM-dd'),
        vehicleId,
        value: totalValue, // Salva o valor total calculado
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-end">
             <div className="space-y-2">
              <Label htmlFor="pricePerLiter">Preço por Litro (R$)</Label>
              <Input id="pricePerLiter" type="number" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} placeholder="Ex: 5.899"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="liters">Litros (L)</Label>
              <Input id="liters" type="number" value={liters} onChange={(e) => setLiters(e.target.value)} placeholder="Ex: 25.5"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">KM do Veículo</Label>
              <Input id="km" type="number" value={km} onChange={(e) => setKm(e.target.value)} />
            </div>
          </div>
           <div className="p-4 border rounded-md bg-muted">
                <h4 className="text-md font-medium text-center">Valor Total Calculado</h4>
                <p className='font-bold text-2xl text-primary text-center mt-2'>R$ {totalValue.toFixed(2)}</p>
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
