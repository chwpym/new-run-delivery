// src/components/refuels-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllRefuels, saveRefuel, deleteRefuel, getAllVehicles } from '@/lib/db';
import type { Refuel, Vehicle } from '@/types';
import { AddRefuelModal } from './add-refuel-modal';
import { format, parseISO } from 'date-fns';

export function RefuelsScreen() {
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refuelToEdit, setRefuelToEdit] = useState<Refuel | null>(null);
  const [refuelToDelete, setRefuelToDelete] = useState<Refuel | null>(null);

  const fetchData = async () => {
    const refuelData = await getAllRefuels();
    const vehicleData = await getAllVehicles();
    setRefuels(refuelData.sort((a, b) => b.date.localeCompare(a.date)));
    setVehicles(vehicleData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Omit<Refuel, 'id'>, id?: string) => {
    const toSave: Refuel = id ? { id, ...data } : { id: new Date().toISOString(), ...data };
    await saveRefuel(toSave);
    fetchData();
  };

  const handleDelete = async () => {
    if (!refuelToDelete) return;
    await deleteRefuel(refuelToDelete.id);
    setRefuelToDelete(null);
    fetchData();
  };

  const handleOpenModal = (refuel?: Refuel) => {
    setRefuelToEdit(refuel || null);
    setIsModalOpen(true);
  };

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'N/A';

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Abastecimentos</CardTitle>
              <CardDescription>Registre seus abastecimentos para controle de custos.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} disabled={vehicles.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {vehicles.length === 0 && <p className="text-center text-destructive py-4">Você precisa cadastrar um veículo primeiro.</p>}
            {refuels.length > 0 ? refuels.map(refuel => (
              <Card key={refuel.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{getVehicleName(refuel.vehicleId)}</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(refuel.date), 'dd/MM/yyyy')}</p>
                  <p className="text-sm">KM: {refuel.km} | Litros: {refuel.liters.toFixed(2)}L</p>
                  <p className="font-bold text-lg text-destructive">R$ {refuel.value.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenModal(refuel)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => setRefuelToDelete(refuel)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhum abastecimento registrado.</p>}
          </CardContent>
        </Card>
      </div>

      <AddRefuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        refuelToEdit={refuelToEdit}
        vehicles={vehicles}
      />

      <AlertDialog open={!!refuelToDelete} onOpenChange={() => setRefuelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O registro de abastecimento será excluído permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
