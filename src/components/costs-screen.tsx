// src/components/costs-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PlusCircle, Edit, Trash2, Filter } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllCosts, saveCost, deleteCost } from '@/lib/db';
import type { Cost } from '@/types';
import { AddCostModal } from './add-cost-modal';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CostsScreen() {
  const [allCosts, setAllCosts] = useState<Cost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [costToEdit, setCostToEdit] = useState<Cost | null>(null);
  const [costToDelete, setCostToDelete] = useState<Cost | null>(null);

  const fetchCosts = async () => {
    const data = await getAllCosts();
    setAllCosts(data.sort((a, b) => b.date.localeCompare(a.date)));
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const handleSave = async (costData: Omit<Cost, 'id'>, id?: string) => {
    const costToSave: Cost = id
      ? { id, ...costData }
      : { id: new Date().toISOString(), ...costData };
    await saveCost(costToSave);
    fetchCosts();
  };

  const handleDelete = async () => {
    if (!costToDelete) return;
    await deleteCost(costToDelete.id);
    setCostToDelete(null);
    fetchCosts();
  };

  const handleOpenModal = (cost?: Cost) => {
    setCostToEdit(cost || null);
    setIsModalOpen(true);
  };
  
  const totalFixed = allCosts.filter(c => c.category === 'fixed').reduce((sum, c) => sum + c.value, 0);
  const totalVariable = allCosts.filter(c => c.category === 'variable').reduce((sum, c) => sum + c.value, 0);

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Custos</CardTitle>
              <CardDescription>Registre seus custos fixos e variáveis.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Custo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <Card className="p-4"><CardTitle className="text-lg">Custos Fixos</CardTitle><p className="text-xl font-bold">R$ {totalFixed.toFixed(2)}</p></Card>
              <Card className="p-4"><CardTitle className="text-lg">Custos Variáveis</CardTitle><p className="text-xl font-bold">R$ {totalVariable.toFixed(2)}</p></Card>
            </div>
            
            {allCosts.length > 0 ? allCosts.map(cost => (
              <Card key={cost.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{cost.description}</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(cost.date), 'dd/MM/yyyy')} - <span className={`font-semibold ${cost.category === 'fixed' ? 'text-blue-500' : 'text-amber-500'}`}>{cost.category === 'fixed' ? 'Fixo' : 'Variável'}</span></p>
                  <p className="font-bold text-lg text-destructive">R$ {cost.value.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenModal(cost)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => setCostToDelete(cost)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhum custo registrado.</p>}
          </CardContent>
        </Card>
      </div>

      <AddCostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        costToEdit={costToEdit}
      />

      <AlertDialog open={!!costToDelete} onOpenChange={() => setCostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O custo "{costToDelete?.description}" será excluído permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
