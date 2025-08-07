// src/components/fixed-payments-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllFixedPayments, saveFixedPayment, deleteFixedPayment, getAllCompanies } from '@/lib/db';
import type { FixedPayment, Company } from '@/types';
import { AddFixedPaymentModal } from './add-fixed-payment-modal';
import { format, parseISO } from 'date-fns';

export function FixedPaymentsScreen() {
  const [payments, setPayments] = useState<FixedPayment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FixedPayment | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FixedPayment | null>(null);

  const fetchData = async () => {
    const paymentsData = await getAllFixedPayments();
    const companiesData = await getAllCompanies();
    setPayments(paymentsData.sort((a, b) => b.date.localeCompare(a.date)));
    setCompanies(companiesData);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const totalReceived = payments.reduce((sum, p) => sum + p.value, 0);

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recebimentos Fixos</CardTitle>
              <CardDescription>Registre os pagamentos fixos recebidos.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} disabled={companies.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Recebimento
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="p-4 text-center">
              <CardTitle className="text-lg">Total Recebido (Todos os Períodos)</CardTitle>
              <p className="text-2xl font-bold text-primary">R$ {totalReceived.toFixed(2)}</p>
            </Card>

            {companies.length === 0 && <p className="text-center text-destructive py-4">Você precisa cadastrar uma empresa primeiro.</p>}
            
            {payments.length > 0 ? payments.map(item => (
              <Card key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{getCompanyName(item.companyId)} - {format(parseISO(item.date), 'dd/MM/yyyy')}</p>
                  <p className="font-bold text-lg text-primary">R$ {item.value.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenModal(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhum recebimento registrado.</p>}
          </CardContent>
        </Card>
      </div>

      <AddFixedPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        itemToEdit={itemToEdit}
        companies={companies}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O recebimento &quot;{itemToDelete?.description}&quot; no valor de R$ {itemToDelete?.value.toFixed(2)} será excluído.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
