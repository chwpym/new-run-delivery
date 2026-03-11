// src/components/add-cost-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from './ui/date-picker';
import type { Cost, CostCategory } from '@/types';
import { format } from 'date-fns';

interface AddCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (costData: Omit<Cost, 'id'>, id?: string) => void;
  costToEdit?: Cost | null;
}

export function AddCostModal({ isOpen, onClose, onSave, costToEdit }: AddCostModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<CostCategory>('variable');

  useEffect(() => {
    if (isOpen) {
      if (costToEdit) {
        setDate(new Date(costToEdit.date));
        setDescription(costToEdit.description);
        setValue(String(costToEdit.value));
        setCategory(costToEdit.category);
      } else {
        setDate(new Date());
        setDescription('');
        setValue('');
        setCategory('variable');
      }
    }
  }, [costToEdit, isOpen]);

  const handleSubmit = () => {
    if (!date || !description || !value) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    onSave(
      {
        date: format(date, 'yyyy-MM-dd'),
        description,
        value: parseFloat(value),
        category,
      },
      costToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{costToEdit ? 'Editar Custo' : 'Adicionar Novo Custo'}</DialogTitle>
          <DialogDescription>Preencha os detalhes da despesa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CostCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="variable">Variável</SelectItem>
                  <SelectItem value="fixed">Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex: 150.00" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{costToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
