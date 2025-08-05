"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, PlusCircle, Edit, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllEntries, saveDailyEntry, deleteDailyEntry, getAllCompanies, getAllVehicles } from '@/lib/db';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
import { AddEntryModal } from './add-entry-modal';

interface DailyEntriesScreenProps {
  deliveryCount: number;
}

export function DailyEntriesScreen({ deliveryCount }: DailyEntriesScreenProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<DailyEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntry | null>(null);

  // Função para carregar/recarregar todos os dados
  const fetchData = async () => {
    const [allEntries, allCompanies, allVehicles] = await Promise.all([
      getAllEntries(),
      getAllCompanies(),
      getAllVehicles()
    ]);
    setEntries(allEntries.sort((a, b) => b.date.localeCompare(a.date))); // Ordena decrescente
    setCompanies(allCompanies);
    setVehicles(allVehicles);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const entriesByMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }, [entries, currentMonth]);

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
            {/* Seletor de Mês */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lista de Registros */}
            <div className="space-y-4">
              {entriesByMonth.length > 0 ? entriesByMonth.map(entry => (
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
              )) : <p className="text-center text-muted-foreground py-8">Nenhum registro para este mês.</p>}
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
