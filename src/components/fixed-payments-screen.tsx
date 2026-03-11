// src/components/fixed-payments-screen.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllFixedPayments, saveFixedPayment, deleteFixedPayment, getAllCompanies } from '@/lib/db';
import type { FixedPayment, Company } from '@/types';
import { AddFixedPaymentModal } from './add-fixed-payment-modal';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DateRangeFilter } from './ui/date-range-filter';

export function FixedPaymentsScreen() {
  const [payments, setPayments] = useState<FixedPayment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FixedPayment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FixedPayment | null>(null);
  
  const now = new Date();
  const [filterStart, setFilterStart] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [filterEnd, setFilterEnd] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const fetchData = async () => {
    const paymentsData = await getAllFixedPayments();
    const companiesData = await getAllCompanies();
    setPayments(paymentsData.sort((a, b) => b.date.localeCompare(a.date)));
    setCompanies(companiesData.filter(c => c.paymentType === 'fixed'));
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPayments = useMemo(() => 
    payments.filter(p => p.date >= filterStart && p.date <= filterEnd),
    [payments, filterStart, filterEnd]
  );

  const handleSave = async (data: Omit<FixedPayment, 'id'>, id?: string) => {
    const toSave: FixedPayment = id ? { id, ...data } : { id: new Date().toISOString(), ...data };
    await saveFixedPayment(toSave);
    fetchData();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await deleteFixedPayment(itemToDelete.id);
    setItemToDelete(null);
    fetchData();
  };

  const handleOpenModal = (item?: FixedPayment) => {
    setItemToEdit(item || null);
    setIsModalOpen(true);
  };

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';
  const totalReceived = filteredPayments.reduce((sum, p) => sum + p.value, 0);
  const totalDiscounts = filteredPayments.reduce((sum, p) => sum + (p.discounts || 0), 0);
  const netReceived = totalReceived - totalDiscounts;

  return (
    <>
      <div className="p-4 space-y-4">
        <DateRangeFilter onFilterChange={(s, e) => { setFilterStart(s); setFilterEnd(e); }} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recebimentos Fixos</CardTitle>
              <CardDescription>Registre os pagamentos fixos recebidos.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} disabled={companies.length === 0} className="min-h-[44px]">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="p-4 text-center">
              <CardTitle className="text-lg">Total Líquido</CardTitle>
              <p className="text-2xl font-bold text-primary">R$ {netReceived.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Bruto: R$ {totalReceived.toFixed(2)} | Descontos: R$ {totalDiscounts.toFixed(2)}</p>
            </Card>

            {companies.length === 0 && <p className="text-center text-destructive py-4">Cadastre uma empresa com pagamento &quot;Fixo&quot; primeiro.</p>}
            
            {filteredPayments.length > 0 ? filteredPayments.map(item => (
              <Card key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{getCompanyName(item.companyId)} - {format(parseISO(item.date), 'dd/MM/yyyy')}</p>
                  <p className="font-bold text-lg text-primary">R$ {(item.value - (item.discounts || 0)).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Bruto: R$ {item.value.toFixed(2)} {item.discounts ? ` | Desc: R$ ${item.discounts.toFixed(2)}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => handleOpenModal(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhum recebimento no período.</p>}
          </CardContent>
        </Card>
      </div>

      <AddFixedPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} itemToEdit={itemToEdit} companies={companies} />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O recebimento &quot;{itemToDelete?.description}&quot; no valor de R$ {itemToDelete?.value.toFixed(2)} será excluído.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
