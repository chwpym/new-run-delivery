// src/components/maintenances-screen.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllMaintenances, saveMaintenance, deleteMaintenance, getAllVehicles } from '@/lib/db';
import type { Maintenance, Vehicle } from '@/types';
import { AddMaintenanceModal } from './add-maintenance-modal';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DateRangeFilter } from './ui/date-range-filter';
import { Input } from './ui/input';

export function MaintenancesScreen() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Maintenance | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Maintenance | null>(null);

  const now = new Date();
  const [filterStart, setFilterStart] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [filterEnd, setFilterEnd] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    const data = await getAllMaintenances();
    const vehicleData = await getAllVehicles();
    setMaintenances(data.sort((a, b) => b.date.localeCompare(a.date)));
    setVehicles(vehicleData);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMaintenances = useMemo(() =>
    maintenances.filter(m => {
      const isDateMatch = m.date >= filterStart && m.date <= filterEnd;
      if (!isDateMatch) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const dateStr = format(parseISO(m.date), "dd/MM/yyyy");
        const vehicle = vehicles.find(v => v.id === m.vehicleId)?.name.toLowerCase() || '';
        const desc = m.description?.toLowerCase() || '';
        return dateStr.includes(query) || vehicle.includes(query) || desc.includes(query);
      }
      return true;
    }),
    [maintenances, filterStart, filterEnd, searchQuery, vehicles]
  );

  const totalValue = useMemo(() => filteredMaintenances.reduce((sum, m) => sum + m.value, 0), [filteredMaintenances]);

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
      <div className="p-4 space-y-4">
        <DateRangeFilter onFilterChange={(s, e) => { setFilterStart(s); setFilterEnd(e); }} />
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manutenções</CardTitle>
              <CardDescription>Acompanhe os serviços de manutenção do seu veículo.</CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar veículo, serviço, data..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => handleOpenModal()} disabled={vehicles.length === 0} className="min-h-[44px] whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredMaintenances.length > 0 && (
              <Card className="p-4 text-center">
                <CardTitle className="text-lg">Total no Período</CardTitle>
                <p className="text-2xl font-bold text-destructive">R$ {totalValue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{filteredMaintenances.length} serviços</p>
              </Card>
            )}
            {vehicles.length === 0 && <p className="text-center text-destructive py-4">Cadastre um veículo primeiro.</p>}
            {filteredMaintenances.length > 0 ? filteredMaintenances.map(item => (
              <Card key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{getVehicleName(item.vehicleId)} - {format(parseISO(item.date), 'dd/MM/yyyy')}</p>
                  <p className="text-sm">KM: {item.km}</p>
                  <p className="font-bold text-lg text-destructive">R$ {item.value.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => handleOpenModal(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhuma manutenção no período.</p>}
          </CardContent>
        </Card>
      </div>

      <AddMaintenanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} itemToEdit={itemToEdit} vehicles={vehicles} />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O registro de manutenção &quot;{itemToDelete?.description}&quot; será excluído.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
