// src/components/add-entry-modal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, subDays } from 'date-fns';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
import { DatePicker } from './ui/date-picker';
import { getEntryById } from '@/lib/db';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DailyEntry) => void;
  entryToEdit?: DailyEntry | null;
  companies: Company[];
  vehicles: Vehicle[];
  deliveryCount: number;
}

export function AddEntryModal({ isOpen, onClose, onSave, entryToEdit, companies, vehicles, deliveryCount }: AddEntryModalProps) {
  // Estados do Formulário
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDayOff, setIsDayOff] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [deliveriesCount, setDeliveriesCount] = useState('0');
  const [dailyRate, setDailyRate] = useState('0');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [tips, setTips] = useState('0');
  const [startKm, setStartKm] = useState('0');
  const [endKm, setEndKm] = useState('0');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);


  // Valores calculados
  const totalFromDeliveries = useMemo(() => {
    if (isDayOff) return 0;
    return (parseFloat(deliveriesCount) || 0) * (parseFloat(deliveryFee) || 0);
  }, [deliveriesCount, deliveryFee, isDayOff]);

  const totalEarned = useMemo(() => {
    if (isDayOff) return 0;
    const rate = parseFloat(dailyRate) || 0;
    const tipValue = parseFloat(tips) || 0;
    return rate + totalFromDeliveries + tipValue;
  }, [dailyRate, totalFromDeliveries, tips, isDayOff]);
  
  const kmDriven = useMemo(() => {
    const start = parseFloat(startKm) || 0;
    const end = parseFloat(endKm) || 0;
    return end > start ? end - start : 0;
  }, [startKm, endKm]);

  // Popula o formulário ao abrir para edição ou novo registro
  useEffect(() => {
    const populateForm = async () => {
        if (entryToEdit) {
            // Modo Edição
            setDate(parseISO(entryToEdit.date));
            setIsDayOff(entryToEdit.isDayOff);
            setCompanyId(entryToEdit.companyId);
            setVehicleId(entryToEdit.vehicleId);
            // Se o modal for aberto a partir do rastreador, ele já vem com a contagem. Senão, usa a do registro.
            setDeliveriesCount(String(entryToEdit.deliveriesCount || deliveryCount || ''));
            setDailyRate(String(entryToEdit.dailyRate || ''));
            setDeliveryFee(String(entryToEdit.deliveryFee || ''));
            setTips(String(entryToEdit.tips || ''));
            setStartKm(String(entryToEdit.startKm || ''));
            setEndKm(String(entryToEdit.endKm || ''));
        } else {
            // Modo Adição
            const today = new Date();
            setDate(today);
            setIsDayOff(false);
            setDeliveriesCount(String(deliveryCount || 0));
            setCompanyId(companies.length > 0 ? companies[0].id : undefined);
            setVehicleId(vehicles.length > 0 ? vehicles[0].id : undefined);
            setTips('');
            setEndKm('');

            // Tenta buscar o KM final do dia anterior
            const yesterdayId = format(subDays(today, 1), 'yyyy-MM-dd');
            const yesterdayEntry = await getEntryById(yesterdayId);
            if (yesterdayEntry && yesterdayEntry.endKm) {
              setStartKm(String(yesterdayEntry.endKm));
            } else {
              setStartKm('');
            }
        }
    };
    
    if (isOpen) {
        populateForm();
    }
  }, [entryToEdit, isOpen, deliveryCount, companies, vehicles]);
  
  // Efeito para limpar os dados quando "Folga" é marcada
  useEffect(() => {
    if (isDayOff) {
      setCompanyId(undefined);
      setVehicleId(undefined);
      setDeliveriesCount('0');
      setDailyRate('0');
      setDeliveryFee('0');
      setTips('0');
      setSelectedCompany(null);
    }
  }, [isDayOff]);

  // Atualiza a diária e taxa de entrega ao mudar de empresa
  useEffect(() => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
  
    // Só preenche automaticamente se não estiver editando um registro existente.
    // Se for um novo registro ou um registro iniciado pelo rastreador (sem dailyRate), preenche.
    if (company && (!entryToEdit || !entryToEdit.dailyRate)) {
      if (company.paymentType === 'fixed') {
        setDailyRate('0');
        setDeliveryFee(String(company.deliveryFee || 0));
      } else {
        setDailyRate(String(company.dailyRate || 0));
        setDeliveryFee(String(company.deliveryFee || 0));
      }
    }
  }, [companyId, companies, entryToEdit]);


  const handleSubmit = () => {
    if (!date) return alert('Data é obrigatória');
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const entryData: DailyEntry = {
      id: formattedDate,
      date: formattedDate,
      isDayOff,
      companyId: isDayOff ? undefined : companyId,
      vehicleId: isDayOff ? undefined : vehicleId,
      deliveriesCount: isDayOff ? 0 : parseInt(deliveriesCount, 10) || 0,
      dailyRate: isDayOff ? 0 : parseFloat(dailyRate) || 0,
      deliveryFee: isDayOff ? 0 : parseFloat(deliveryFee) || 0,
      tips: isDayOff ? 0 : parseFloat(tips) || 0,
      startKm: parseFloat(startKm) || 0,
      endKm: parseFloat(endKm) || 0,
      totalFromDeliveries,
      totalEarned,
      kmDriven,
      lastKm: parseFloat(endKm) || 0,
    };
    onSave(entryData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl grid grid-rows-[auto_1fr_auto] h-screen max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>{entryToEdit ? 'Editar Registro' : 'Adicionar Novo Registro'}</DialogTitle>
          <DialogDescription>
            {date ? `Modificando registro do dia ${format(date, 'dd/MM/yyyy')}`: 'Selecione uma data'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-6 space-y-4 py-4">
            {/* Data e Folga */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <DatePicker date={date} setDate={setDate} />
                </div>
                 <div className="flex items-end pb-2 space-x-2">
                    <Checkbox id="isDayOff" checked={isDayOff} onCheckedChange={(checked) => setIsDayOff(Boolean(checked))} />
                    <Label htmlFor="isDayOff">Marcar como Folga</Label>
                </div>
            </div>

            {/* Seletor de Empresa e Veículo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Select value={companyId} onValueChange={setCompanyId} disabled={isDayOff}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo</Label>
                <Select value={vehicleId} onValueChange={setVehicleId} disabled={isDayOff}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Ganhos */}
            <div className='p-4 border rounded-md'>
              <h3 className="text-lg font-medium mb-2">Ganhos do Dia</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveriesCount">Nº Entregas</Label>
                  <Input id="deliveriesCount" type="number" value={deliveriesCount} onChange={e => setDeliveriesCount(e.target.value)} disabled={isDayOff} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="totalFromDeliveries">Total Entregas (R$)</Label>
                  <Input id="totalFromDeliveries" type="text" value={totalFromDeliveries.toFixed(2)} readOnly disabled className="bg-muted"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Diária (R$)</Label>
                  <Input id="dailyRate" type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} disabled={isDayOff || selectedCompany?.paymentType === 'fixed'}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Taxa/Entrega (R$)</Label>
                  <Input id="deliveryFee" type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} disabled={isDayOff} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tips">Gorjetas (R$)</Label>
                  <Input id="tips" type="number" value={tips} onChange={e => setTips(e.target.value)} disabled={isDayOff} />
                </div>
              </div>
              <div className='mt-4 p-2 border rounded-md'>
                <h4 className="text-md font-medium mb-2">Resumo Financeiro</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p>Diária/Fixo: <span className='font-bold'>R$ {parseFloat(dailyRate).toFixed(2)}</span></p>
                        <p>Entregas: <span className='font-bold'>R$ {totalFromDeliveries.toFixed(2)}</span></p>
                        <p>Gorjetas: <span className='font-bold'>R$ {parseFloat(tips || '0').toFixed(2)}</span></p>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                        <p className='text-right text-lg'>Total do Dia:</p>
                        <p className='font-bold text-2xl text-primary'>R$ {totalEarned.toFixed(2)}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Quilometragem */}
             <div className='p-4 border rounded-md'>
                <h3 className="text-lg font-medium mb-2">Quilometragem</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startKm">KM Inicial</Label>
                    <Input id="startKm" type="number" value={startKm} onChange={e => setStartKm(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endKm">KM Final</Label>
                    <Input id="endKm" type="number" value={endKm} onChange={e => setEndKm(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                     <Label>KM Rodados</Label>
                     <p className='h-10 flex items-center font-bold text-lg'>{kmDriven.toFixed(1)} km</p>
                  </div>
                </div>
              </div>
          </div>
        
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{entryToEdit ? 'Salvar Alterações' : 'Salvar Registro'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
