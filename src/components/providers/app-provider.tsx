// src/components/providers/app-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings, Company, Vehicle } from '@/types';
import { getAllCompanies, getAllVehicles, getAllStopsByStatus } from '@/lib/db';

interface AppContextType {
  // Delivery state
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  updateConfirmedDeliveries: () => Promise<void>;

  // Settings
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;

  // Data
  companies: Company[];
  vehicles: Vehicle[];
  refreshCompanies: () => Promise<void>;
  refreshVehicles: () => Promise<void>;

  // Active company
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;

  // Mounted state
  isMounted: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [count, setCount] = useState(0);
  const [settings, setSettings] = useState<Settings>({ autoCount: true, stopDuration: 60, baseRadius: 200 });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const updateConfirmedDeliveries = useCallback(async () => {
    const confirmedStops = await getAllStopsByStatus('confirmed');
    setCount(confirmedStops.length);
  }, []);

  const refreshCompanies = useCallback(async () => {
    const allCompanies = await getAllCompanies();
    setCompanies(allCompanies);
  }, []);

  const refreshVehicles = useCallback(async () => {
    const allVehicles = await getAllVehicles();
    setVehicles(allVehicles);
  }, []);

  // Initial load
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('runDeliverySettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      updateConfirmedDeliveries();
    } catch (error) {
      console.error("Falha ao ler localStorage", error);
    }
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
  }, [updateConfirmedDeliveries]);

  // Persist settings
  useEffect(() => {
    if (isMounted) localStorage.setItem('runDeliverySettings', JSON.stringify(settings));
  }, [settings, isMounted]);

  // Persist active company
  useEffect(() => {
    if (activeCompanyId) localStorage.setItem('runDeliveryLastCompany', activeCompanyId);
  }, [activeCompanyId]);

  return (
    <AppContext.Provider value={{
      count, setCount, updateConfirmedDeliveries,
      settings, setSettings,
      companies, vehicles, refreshCompanies, refreshVehicles,
      activeCompanyId, setActiveCompanyId,
      isMounted,
    }}>
      {children}
    </AppContext.Provider>
  );
}
