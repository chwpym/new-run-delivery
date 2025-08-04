"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, PlusCircle } from "lucide-react";
import { AddVehicleModal } from './add-vehicle-modal'; // Criaremos este arquivo a seguir

// Definindo o tipo para um Veículo
export type Vehicle = {
  id: string;
  name: string;
  plate?: string;
  averageConsumption: number; // km/L
};

export function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    // Dados de exemplo
    { id: '1', name: 'Biz', plate: 'DHI0F06', averageConsumption: 35.57 },
    { id: '2', name: 'Veículo Principal', averageConsumption: 10 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddVehicle = (newVehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      id: new Date().toISOString(), // ID simples para o exemplo
      ...newVehicleData,
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Veículos</CardTitle>
              <CardDescription>Cadastre e gerencie os veículos utilizados.</CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Veículo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicles.length > 0 ? (
              vehicles.map(vehicle => (
                <Card key={vehicle.id} className="p-4">
                  <p className="font-bold text-lg">{vehicle.name}</p>
                  {vehicle.plate && <p className="text-sm text-muted-foreground">Placa: {vehicle.plate}</p>}
                  <p className="text-sm text-muted-foreground">Consumo Médio: {vehicle.averageConsumption} km/L</p>
                  {/* Botões de Editar/Excluir virão depois */}
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
        onClose={() => setIsModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />
    </>
  );
}
