"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle, Edit, Trash2, ArrowLeft, ArrowRight, Filter } from "lucide-react";
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
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0); // Início do dia
        tempEntries = tempEntries.filter(entry => new Date(entry.date) >= startDate);
    }
    if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        tempEntries = tempEntries.filter(entry => new Date(entry.date) <= endDate);
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
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold">Filtros</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <Label>Período Rápido</Label>
                        <Select onValueChange={(value) => handlePeriodChange(value)}>
                            <SelectTrigger>
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
                    <div>
                        <Label>Data Inicial</Label>
                        <DatePicker date={filters.startDate} setDate={(d) => setFilters(prev => ({...prev, startDate: d || null}))} />
                    </div>
                    <div>
                        <Label>Data Final</Label>
                        <DatePicker date={filters.endDate} setDate={(d) => setFilters(prev => ({...prev, endDate: d || null}))} />
                    </div>
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
            </Card>
            
            {/* Lista de Registros */}
            <div className="space-y-4">
              {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                <Card key={entry.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">
                        {format(parseISO(entry.date), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                      </p>
                      {entry.isDayOff ? (
                        <p className="font-semibold text-destructive">DIA DE FOLGA</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{getCompanyName(entry.companyId)} / {getVehicleName(entry.vehicleId)}</p>
                      )}
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenModal(entry)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => setEntryToDelete(entry)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {!entry.isDayOff && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="font-semibold text-primary">R$ {entry.totalEarned?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-muted-foreground">Total Ganho</p>
                      </div>
                      <div>
                        <p>{entry.deliveriesCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Entregas</p>
                      </div>
                      <div>
                        <p>{entry.kmDriven?.toFixed(1) || 0} km</p>
                        <p className="text-xs text-muted-foreground">KM Rodados</p>
                      </div>
                       <div>
                        <p>R$ {entry.tips?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-muted-foreground">Gorjetas</p>
                      </div>
                    </div>
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
