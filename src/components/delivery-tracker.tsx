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
import { getAllCompanies } from '@/lib/db';
import type { Company } from '@/types/company';
import { DailyEntriesScreen } from './daily-entries-screen';
import { DashboardScreen } from './dashboard-screen';
import { LiveTrackerScreen } from './live-tracker-screen';

export default function DeliveryTracker() {
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [settings, setSettings] = useState<Settings>({ autoCount: true, stopDuration: 60, baseRadius: 200 });
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
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
      const allCompanies = await getAllCompanies();
      setCompanies(allCompanies);
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

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-headline">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2"><MainMenu activeScreen={activeScreen} setActiveScreen={setActiveScreen} /><h1 className="text-xl font-bold">RunDelivery</h1></div>
        <div className="flex items-center gap-1"><ThemeToggle /><Button onClick={() => setIsResetDialogOpen(true)} variant="ghost" size="icon"><RotateCcw className="h-5 w-5" /></Button><SettingsSheet settings={settings} setSettings={setSettings} /></div>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {activeScreen === 'dashboard' && <DashboardScreen onNavigate={setActiveScreen} />}
        {activeScreen === 'rastreador' && <LiveTrackerScreen count={count} setCount={setCount} settings={settings} companies={companies} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />}
        {activeScreen === 'registros' && <DailyEntriesScreen deliveryCount={count} />}
        {activeScreen === 'reports' && <ReportsScreen />}
        {activeScreen === 'veiculos' && <VehiclesScreen />}
        {activeScreen === 'empresas' && <CompaniesScreen />}
        {activeScreen === 'dados' && <DataScreen />}
      </div>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Zerar contador?</AlertDialogTitle><AlertDialogDescription>Esta ação irá zerar o contador de entregas de hoje.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmReset}>Sim, zerar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
