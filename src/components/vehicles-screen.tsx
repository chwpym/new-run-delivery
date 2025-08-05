"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AddVehicleModal } from './add-vehicle-modal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Vehicle } from '@/types/vehicle';

export function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    // Dados de exemplo
    { id: '1', name: 'Biz', plate: 'DHI0F06', averageConsumption: 35.57 },
    { id: '2', name: 'Veículo Principal', averageConsumption: 10 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'>, id?: string) => {
    if (id) { // Editando
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicleData } : v));
    } else { // Adicionando
      const newVehicle: Vehicle = { id: new Date().toISOString(), ...vehicleData };
      setVehicles(prev => [...prev, newVehicle]);
    }
  };

  const handleDeleteVehicle = () => {
    if (!vehicleToDelete) return;
    setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
    setVehicleToDelete(null); // Fecha o diálogo
  };

  const handleOpenAddModal = () => {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Veículos</CardTitle>
              <CardDescription>Cadastre e gerencie os veículos utilizados.</CardDescription>
            </div>
            <Button onClick={handleOpenAddModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Veículo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicles.length > 0 ? (
              vehicles.map(vehicle => (
                <Card key={vehicle.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{vehicle.name}</p>
                    {vehicle.plate && <p className="text-sm text-muted-foreground">Placa: {vehicle.plate}</p>}
                    <p className="text-sm text-muted-foreground">Consumo Médio: {vehicle.averageConsumption} km/L</p>
                  </div>
                   <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenEditModal(vehicle)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setVehicleToDelete(vehicle)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum veículo cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setVehicleToEdit(null); }}
        onSave={handleSaveVehicle}
        vehicleToEdit={vehicleToEdit}
      />
      <AlertDialog open={!!vehicleToDelete} onOpenChange={() => setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O veículo "{vehicleToDelete?.name}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle}>
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
