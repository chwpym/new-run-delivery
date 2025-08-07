// src/components/add-fixed-payment-modal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from './ui/date-picker';
import type { FixedPayment, Company } from '@/types';
import { format } from 'date-fns';

interface AddFixedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FixedPayment, 'id'>, id?: string) => void;
  itemToEdit?: FixedPayment | null;
  companies: Company[];
}

export function AddFixedPaymentModal({ isOpen, onClose, onSave, itemToEdit, companies }: AddFixedPaymentModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [companyId, setCompanyId] = useState<string>('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setDate(new Date(itemToEdit.date));
        setCompanyId(itemToEdit.companyId);
        setValue(String(itemToEdit.value));
        setDescription(itemToEdit.description);
      } else {
        setDate(new Date());
        setCompanyId(companies[0]?.id || '');
        setValue('');
        setDescription('Pagamento Fixo Mensal'); // Valor padrão
      }
    }
  }, [itemToEdit, isOpen, companies]);

  const handleSubmit = () => {
    if (!date || !companyId || !value || !description) {
      alert("Todos os campos são obrigatórios.");
      return;
    }
    onSave(
      {
        date: format(date, 'yyyy-MM-dd'),
        companyId,
        value: parseFloat(value),
        description,
      },
      itemToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Editar Recebimento' : 'Adicionar Recebimento Fixo'}</DialogTitle>
          <DialogDescription>Registre um pagamento fixo recebido de uma empresa.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Recebimento</Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Adiantamento quinzenal"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor Recebido (R$)</Label>
            <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
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
