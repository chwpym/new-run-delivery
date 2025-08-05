"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from 'date-fns';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';

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
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
    return (parseFloat(deliveriesCount) || 0) * (parseFloat(deliveryFee) || 0);
  }, [deliveriesCount, deliveryFee]);

  const totalEarned = useMemo(() => {
    const rate = isDayOff ? 0 : parseFloat(dailyRate) || 0;
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
    if (isOpen) {
      if (entryToEdit) {
        // Modo Edição
        setDate(entryToEdit.date);
        setIsDayOff(entryToEdit.isDayOff);
        setCompanyId(entryToEdit.companyId);
        setVehicleId(entryToEdit.vehicleId);
        setDeliveriesCount(String(entryToEdit.deliveriesCount || ''));
        setDailyRate(String(entryToEdit.dailyRate || ''));
        setDeliveryFee(String(entryToEdit.deliveryFee || ''));
        setTips(String(entryToEdit.tips || ''));
        setStartKm(String(entryToEdit.startKm || ''));
        setEndKm(String(entryToEdit.endKm || ''));
      } else {
        // Modo Adição
        const today = format(new Date(), 'yyyy-MM-dd');
        setDate(today);
        setIsDayOff(false);
        setDeliveriesCount(String(deliveryCount || 0)); // Usa o contador da tela principal
        // Tenta preencher com base na empresa ativa
        if (companies.length > 0) {
          const defaultCompany = companies[0];
          setCompanyId(defaultCompany.id);
        } else {
          setCompanyId(undefined);
        }
        setVehicleId(vehicles.length > 0 ? vehicles[0].id : undefined);
        setTips('');
        setStartKm('');
        setEndKm('');
      }
    }
  }, [entryToEdit, isOpen, deliveryCount, companies, vehicles]);

  // Atualiza a diária e taxa de entrega ao mudar de empresa
  useEffect(() => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
  
    if (company) {
      // Preenche os campos com base na empresa, mas apenas se for um novo registro
      if (!entryToEdit) {
        if (company.paymentType === 'fixed') {
          // Se for fixo, APENAS a diária é zerada. A taxa por entrega vem da empresa.
          setDailyRate('0');
          setDeliveryFee(String(company.deliveryFee || 0));
        } else {
          // Se for diária, preenche ambos com os valores da empresa.
          setDailyRate(String(company.dailyRate || 0));
          setDeliveryFee(String(company.deliveryFee || 0));
        }
        setDeliveriesCount(String(deliveryCount || 0)); // Reseta a contagem
      }
    } else {
      if(!entryToEdit) {
        setDailyRate('0');
        setDeliveryFee('0');
      }
    }
  }, [companyId, companies, entryToEdit, deliveryCount]);


  const handleSubmit = () => {
    const entryData: DailyEntry = {
      id: date,
      date,
      isDayOff,
      companyId: isDayOff ? undefined : companyId,
      vehicleId: isDayOff ? undefined : vehicleId,
      deliveriesCount: isDayOff ? 0 : parseInt(deliveriesCount, 10) || 0,
      dailyRate: isDayOff ? 0 : parseFloat(dailyRate) || 0,
      deliveryFee: isDayOff ? 0 : parseFloat(deliveryFee) || 0,
      tips: parseFloat(tips) || 0,
      startKm: parseFloat(startKm) || 0,
      endKm: parseFloat(endKm) || 0,
      totalFromDeliveries,
      totalEarned,
      kmDriven,
    };
    onSave(entryData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl grid grid-rows-[auto_1fr_auto] h-full max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>{entryToEdit ? 'Editar Registro' : 'Adicionar Novo Registro'}</DialogTitle>
          <DialogDescription>
            {entryToEdit ? `Modificando registro do dia ${format(parseISO(date), 'dd/MM/yyyy')}` : `Criando registro para o dia ${format(parseISO(date), 'dd/MM/yyyy')}`}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-6 space-y-4 py-4">
            {/* Data e Folga */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!!entryToEdit} />
                </div>
                 <div className="flex items-end pb-2 space-x-2">
                    <Checkbox id="isDayOff" checked={isDayOff} onCheckedChange={(checked) => setIsDayOff(Boolean(checked))} />
                    <Label htmlFor="isDayOff">Marcar como Folga</Label>
                </div>
            </div>

            {/* Seletor de Empresa e Veículo */}
            {!isDayOff && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Veículo</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Ganhos */}
            {!isDayOff && (
              <div className='p-4 border rounded-md'>
                <h3 className="text-lg font-medium mb-2">Ganhos do Dia</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveriesCount">Nº Entregas</Label>
                    <Input id="deliveriesCount" type="number" value={deliveriesCount} onChange={e => setDeliveriesCount(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="totalFromDeliveries">Total Entregas (R$)</Label>
                    <Input id="totalFromDeliveries" type="text" value={totalFromDeliveries.toFixed(2)} readOnly disabled className="bg-muted"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Taxa/Entrega (R$)</Label>
                    <Input id="deliveryFee" type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tips">Gorjetas (R$)</Label>
                    <Input id="tips" type="number" value={tips} onChange={e => setTips(e.target.value)} />
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
            )}

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
