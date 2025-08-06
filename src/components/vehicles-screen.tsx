"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AddVehicleModal } from './add-vehicle-modal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Vehicle } from '@/types/vehicle';
import { getAllVehicles, saveVehicle, deleteVehicle } from '@/lib/db';

export function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Função para carregar/recarregar os dados do banco
  const fetchVehicles = async () => {
    const allVehicles = await getAllVehicles();
    setVehicles(allVehicles);
  };

  // Carrega os dados quando o componente é montado pela primeira vez
  useEffect(() => {
    fetchVehicles();
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id'>, id?: string) => {
    const vehicleToSave: Vehicle = id
      ? { ...vehicles.find(v => v.id === id)!, ...vehicleData } // Editando
      : { id: new Date().toISOString(), ...vehicleData }; // Adicionando

    await saveVehicle(vehicleToSave);
    fetchVehicles(); // Recarrega a lista da tela
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    await deleteVehicle(vehicleToDelete.id);
    setVehicleToDelete(null);
    fetchVehicles(); // Recarrega a lista da tela
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
              Esta ação não pode ser desfeita. O veículo &quot;{vehicleToDelete?.name}&quot; será excluído permanentemente.
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
