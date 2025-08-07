// src/components/delivery-tracker.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/settings-sheet";
import { Truck, RotateCcw } from "lucide-react";
import type { Settings } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MainMenu } from "@/components/main-menu";
import { ReportsScreen } from "@/components/reports-screen";
import { VehiclesScreen } from './vehicles-screen';
import { CompaniesScreen } from './companies-screen';
import { DataScreen } from './data-screen';
import { getAllCompanies, getAllVehicles } from '@/lib/db';
import type { Company, Vehicle } from '@/types';
import { DailyEntriesScreen } from './daily-entries-screen';
import { DashboardScreen } from './dashboard-screen';
import { LiveTrackerScreen } from './live-tracker-screen';
import { CostsScreen } from './costs-screen';
import { RefuelsScreen } from './refuels-screen';
import { MaintenancesScreen } from './maintenances-screen';
import { GoalsScreen } from './goals-screen';


export default function DeliveryTracker() {
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [settings, setSettings] = useState<Settings>({ autoCount: true, stopDuration: 60, baseRadius: 200 });
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('runDeliveryCount');
      if (savedCount) setCount(JSON.parse(savedCount));
      const savedSettings = localStorage.getItem('runDeliverySettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) { console.error("Falha ao ler localStorage", error); }
    setIsMounted(true);

    const loadInitialData = async () => {
      const [allCompanies, allVehicles] = await Promise.all([
        getAllCompanies(),
        getAllVehicles()
      ]);
      setCompanies(allCompanies);
      setVehicles(allVehicles);

      if (allCompanies.length > 0) {
        const lastCompanyId = localStorage.getItem('runDeliveryLastCompany');
        const companyExists = allCompanies.some(c => c.id === lastCompanyId);
        setActiveCompanyId(companyExists ? lastCompanyId : allCompanies[0].id);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => { if (isMounted) localStorage.setItem('runDeliveryCount', JSON.stringify(count)); }, [count, isMounted]);
  useEffect(() => { if (isMounted) localStorage.setItem('runDeliverySettings', JSON.stringify(settings)); }, [settings, isMounted]);
  useEffect(() => { if (activeCompanyId) localStorage.setItem('runDeliveryLastCompany', activeCompanyId); }, [activeCompanyId]);

  const confirmReset = () => { setCount(0); setIsResetDialogOpen(false); };

  if (!isMounted) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><Truck className="h-16 w-16 animate-pulse text-primary" /></div>;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setActiveScreen} />;
      case 'rastreador':
        return <LiveTrackerScreen 
                  count={count} 
                  setCount={setCount} 
                  settings={settings} 
                  companies={companies} 
                  vehicles={vehicles} 
                  activeCompanyId={activeCompanyId} 
                  setActiveCompanyId={setActiveCompanyId} 
                />;
      case 'registros':
        return <DailyEntriesScreen deliveryCount={count} />;
      case 'relatorios':
        return <ReportsScreen />;
      case 'empresas':
        return <CompaniesScreen />;
      case 'veiculos':
        return <VehiclesScreen />;
      case 'dados':
        return <DataScreen />;
      case 'custos':
        return <CostsScreen />;
      case 'abastecer':
        return <RefuelsScreen />;
      case 'manutencao':
        return <MaintenancesScreen />;
      case 'metas':
        return <GoalsScreen />;
      default:
        return <DashboardScreen onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-headline">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2"><MainMenu activeScreen={activeScreen} setActiveScreen={setActiveScreen} /><h1 className="text-xl font-bold">RunDelivery</h1></div>
        <div className="flex items-center gap-1"><ThemeToggle /><Button onClick={() => setIsResetDialogOpen(true)} variant="ghost" size="icon"><RotateCcw className="h-5 w-5" /></Button><SettingsSheet settings={settings} setSettings={setSettings} /></div>
      </header>

      <main className="flex-1 overflow-y-auto bg-background">
        {renderScreen()}
      </main>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Zerar contador?</AlertDialogTitle><AlertDialogDescription>Esta ação irá zerar o contador de entregas de hoje.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmReset}>Sim, zerar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
