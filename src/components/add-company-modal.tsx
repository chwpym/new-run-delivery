"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Company, PaymentType } from '@/types/company';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Omit<Company, 'id' | 'baseLocation'>, id?: string) => void;
  companyToEdit?: Company | null;
}

export function AddCompanyModal({ isOpen, onClose, onSave, companyToEdit }: AddCompanyModalProps) {
  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('daily');
  const [dailyRate, setDailyRate] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  useEffect(() => {
    if (isOpen && companyToEdit) {
      // Modo de Edição: Preenche os campos com os dados existentes
      setName(companyToEdit.name);
      setPaymentType(companyToEdit.paymentType || 'daily'); // Garante um valor padrão
      setDailyRate(String(companyToEdit.dailyRate || '')); // Converte para string, ou usa '' se for nulo/undefined
      setDeliveryFee(String(companyToEdit.deliveryFee || '')); // Converte para string, ou usa '' se for nulo/undefined
    } else if (isOpen) {
      // Modo de Adição: Limpa todos os campos
      setName('');
      setPaymentType('daily');
      setDailyRate('');
      setDeliveryFee('');
    }
  }, [companyToEdit, isOpen]);


  const handleSubmit = () => {
    if (!name || !deliveryFee) {
      alert("Nome e Valor por Entrega são obrigatórios.");
      return;
    }
    onSave(
      {
        name,
        paymentType,
        dailyRate: paymentType === 'daily' ? parseFloat(dailyRate) || undefined : undefined,
        deliveryFee: parseFloat(deliveryFee),
      },
      companyToEdit?.id
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{companyToEdit ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {companyToEdit ? 'Faça as alterações nos dados da empresa.' : 'Preencha os dados da nova empresa para adicioná-la.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Nome da Empresa (já existe) */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <RadioGroup value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Diária + Entregas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Apenas Pagamento Fixo (Lançado Manualmente)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Campos Condicionais */}
          {paymentType === 'daily' && (
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Valor da Diária (R$)</Label>
              <Input id="dailyRate" type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} placeholder="Ex: 50.00" />
            </div>
          )}

          {/* Valor por Entrega */}
          <div className="space-y-2">
            <Label htmlFor="deliveryFee">Valor Padrão por Entrega (R$)</Label>
            <Input id="deliveryFee" type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="Ex: 5.50" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{companyToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
