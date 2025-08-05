"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle, Edit, Trash2, SlidersHorizontal, Coffee, Briefcase } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllEntries, saveDailyEntry, deleteDailyEntry, getAllCompanies, getAllVehicles } from '@/lib/db';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
import { AddEntryModal } from './add-entry-modal';
import { DatePicker } from './ui/date-picker';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent } from './ui/collapsible';

interface DailyEntriesScreenProps {
  deliveryCount: number;
}

export function DailyEntriesScreen({ deliveryCount }: DailyEntriesScreenProps) {
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DailyEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntry | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<{
    startDate: Date | null,
    endDate: Date | null,
    companyId: string,
    vehicleId: string,
  }>({
    startDate: null,
    endDate: null,
    companyId: 'all',
    vehicleId: 'all',
  });
  const [filteredEntries, setFilteredEntries] = useState<DailyEntry[]>([]);


  // Função para carregar/recarregar todos os dados
  const fetchData = async () => {
    const [allEntriesData, allCompanies, allVehicles] = await Promise.all([
      getAllEntries(),
      getAllCompanies(),
      getAllVehicles()
    ]);
    setAllEntries(allEntriesData.sort((a, b) => b.date.localeCompare(a.date))); // Ordena decrescente
    setCompanies(allCompanies);
    setVehicles(allVehicles);
  };

  useEffect(() => {
    // Define o filtro padrão para "Mês Atual" na primeira carga
    const now = new Date();
    setFilters(prev => ({
      ...prev,
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
    }));
    fetchData();
  }, []);

  // Efeito para aplicar filtros
  useEffect(() => {
    let tempEntries = [...allEntries];

    if (filters.startDate) {
      const startStr = format(filters.startDate, 'yyyy-MM-dd');
      tempEntries = tempEntries.filter(entry => entry.date >= startStr);
    }
    if (filters.endDate) {
      const endStr = format(filters.endDate, 'yyyy-MM-dd');
      tempEntries = tempEntries.filter(entry => entry.date <= endStr);
    }
    if (filters.companyId !== 'all') {
        tempEntries = tempEntries.filter(entry => entry.companyId === filters.companyId);
    }
    if (filters.vehicleId !== 'all') {
        tempEntries = tempEntries.filter(entry => entry.vehicleId === filters.vehicleId);
    }
    
    setFilteredEntries(tempEntries);
  }, [filters, allEntries]);

  const handleSaveEntry = async (entry: DailyEntry) => {
    await saveDailyEntry(entry);
    fetchData();
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    await deleteDailyEntry(entryToDelete.id);
    setEntryToDelete(null);
    fetchData();
  };

  const handleOpenModal = (entry?: DailyEntry) => {
    setEntryToEdit(entry || null);
    setIsModalOpen(true);
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = new Date(); // Fim é sempre hoje, exceto para mês anterior
  
    switch (period) {
      case 'this_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last_7_days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        endDate = now;
        break;
      case 'last_15_days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        endDate = now;
        break;
      case 'last_month':
        const lastMonthDate = subMonths(now, 1);
        startDate = startOfMonth(lastMonthDate);
        endDate = endOfMonth(lastMonthDate);
        break;
      default:
        startDate = null;
        endDate = null;
    }
  
    setFilters(prev => ({
      ...prev,
      startDate: startDate,
      endDate: endDate,
    }));
  };

  const calculateFuelCost = (entry: DailyEntry): number => {
    if (!entry.vehicleId || !entry.kmDriven) return 0;
    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
    // Supondo um preço de combustível fixo por enquanto.
    // No futuro, isso pode vir de uma configuração.
    const FUEL_PRICE = 5.80; 
    if (!vehicle || vehicle.averageConsumption <= 0) return 0;
    
    const litersUsed = entry.kmDriven / vehicle.averageConsumption;
    return litersUsed * FUEL_PRICE;
  };

  const getCompanyName = (companyId?: string) => companies.find(c => c.id === companyId)?.name || 'N/A';
  const getVehicleName = (vehicleId?: string) => vehicles.find(v => v.id === vehicleId)?.name || 'N/A';

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Registros Diários</CardTitle>
              <CardDescription>Seu histórico de trabalho e ganhos.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Registro
            </Button>
          </CardHeader>
          <CardContent>
            {/* Painel de Filtros */}
            <Card className="p-4 mb-6 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Filtro Rápido (Sempre Visível) */}
                <div className="flex-grow sm:flex-grow-0">
                  <Label>Período</Label>
                  <Select onValueChange={(value) => handlePeriodChange(value)} defaultValue="this_month">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Selecionar período..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">Mês Atual</SelectItem>
                      <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                      <SelectItem value="last_15_days">Últimos 15 dias</SelectItem>
                      <SelectItem value="last_month">Mês Anterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botão para mostrar/esconder filtros avançados */}
                <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtros Avançados
                </Button>
              </div>

              {/* Conteúdo Recolhível dos Filtros Avançados */}
              <Collapsible open={showAdvancedFilters}>
                <CollapsibleContent className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Data Inicial */}
                    <div>
                      <Label>Data Inicial</Label>
                      <DatePicker date={filters.startDate} setDate={(d) => setFilters(prev => ({...prev, startDate: d || null}))} />
                    </div>
                    {/* Data Final */}
                    <div>
                      <Label>Data Final</Label>
                      <DatePicker date={filters.endDate} setDate={(d) => setFilters(prev => ({...prev, endDate: d || null}))} />
                    </div>
                    {/* Empresa */}
                    <div>
                      <Label>Empresa</Label>
                      <Select value={filters.companyId} onValueChange={(id) => setFilters(prev => ({...prev, companyId: id}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as Empresas</SelectItem>
                          {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Veículo */}
                    <div>
                      <Label>Veículo</Label>
                      <Select value={filters.vehicleId} onValueChange={(id) => setFilters(prev => ({...prev, vehicleId: id}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Veículos</SelectItem>
                          {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            
            {/* Lista de Registros */}
            <div className="space-y-4">
              {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                <Card
                  key={entry.id}
                  className={`border-l-4 ${entry.isDayOff ? 'border-blue-500' : 'border-primary'}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      {entry.isDayOff ? <Coffee className="h-5 w-5 text-blue-500" /> : <Briefcase className="h-5 w-5 text-primary" />}
                      <CardTitle className="text-lg">
                        {format(parseISO(entry.date), "dd/MM/yyyy")} - {entry.isDayOff ? 'FOLGA' : getCompanyName(entry.companyId)}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(entry)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => setEntryToDelete(entry)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  {!entry.isDayOff && (
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                      {/* Coluna da Esquerda */}
                      <div className="space-y-1">
                        <p><strong>Veículo:</strong> {getVehicleName(entry.vehicleId)}</p>
                        <p><strong>Entregas:</strong> {entry.deliveriesCount || 0}</p>
                        <p><strong>KM Rodados:</strong> {entry.kmDriven?.toFixed(1) || 0} km</p>
                      </div>
                      {/* Coluna da Direita */}
                      <div className="space-y-1 text-right">
                        <p><strong>Diária:</strong> R$ {entry.dailyRate?.toFixed(2) || '0.00'}</p>
                        <p><strong>Total Entregas:</strong> R$ {entry.totalFromDeliveries?.toFixed(2) || '0.00'}</p>
                        <p><strong>Gorjetas:</strong> R$ {entry.tips?.toFixed(2) || '0.00'}</p>
                      </div>
                      {/* Linha Final de Resumo */}
                      <div className="col-span-2 mt-2 pt-2 border-t text-base font-bold flex justify-between">
                        <span className="text-destructive">Custo Comb.: R$ {calculateFuelCost(entry).toFixed(2)}</span>
                        <span className="text-primary">Total Ganho Dia: R$ {entry.totalEarned?.toFixed(2) || '0.00'}</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )) : <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado para os filtros selecionados.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        entryToEdit={entryToEdit}
        companies={companies}
        vehicles={vehicles}
        deliveryCount={deliveryCount}
      />

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>O registro do dia "{entryToDelete?.date ? format(parseISO(entryToDelete.date), 'dd/MM/yyyy') : ''}" será excluído permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteEntry}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
