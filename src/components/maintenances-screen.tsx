// src/components/maintenances-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllMaintenances, saveMaintenance, deleteMaintenance, getAllVehicles } from '@/lib/db';
import type { Maintenance, Vehicle } from '@/types';
import { AddMaintenanceModal } from './add-maintenance-modal';
import { format, parseISO } from 'date-fns';

export function MaintenancesScreen() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Maintenance | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Maintenance | null>(null);

  const fetchData = async () => {
    const data = await getAllMaintenances();
    const vehicleData = await getAllVehicles();
    setMaintenances(data.sort((a, b) => b.date.localeCompare(a.date)));
    setVehicles(vehicleData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Omit<Maintenance, 'id'>, id?: string) => {
    const toSave: Maintenance = id ? { id, ...data } : { id: new Date().toISOString(), ...data };
    await saveMaintenance(toSave);
    fetchData();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await deleteMaintenance(itemToDelete.id);
    setItemToDelete(null);
    fetchData();
  };

  const handleOpenModal = (item?: Maintenance) => {
    setItemToEdit(item || null);
    setIsModalOpen(true);
  };

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'N/A';

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manutenções</CardTitle>
              <CardDescription>Acompanhe os serviços de manutenção do seu veículo.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} disabled={vehicles.length === 0}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {vehicles.length === 0 && <p className="text-center text-destructive py-4">Você precisa cadastrar um veículo primeiro.</p>}
            {maintenances.length > 0 ? maintenances.map(item => (
              <Card key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{getVehicleName(item.vehicleId)} - {format(parseISO(item.date), 'dd/MM/yyyy')}</p>
                  <p className="text-sm">KM: {item.km}</p>
                  <p className="font-bold text-lg text-destructive">R$ {item.value.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleOpenModal(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhum serviço de manutenção registrado.</p>}
          </CardContent>
        </Card>
      </div>

      <AddMaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        itemToEdit={itemToEdit}
        vehicles={vehicles}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O registro de manutenção &quot;{itemToDelete?.description}&quot; será excluído.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
