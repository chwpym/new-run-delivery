// src/lib/db.ts

import { openDB, type DBSchema } from 'idb';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Cost } from '@/types/cost';
import type { Refuel } from '@/types/refuel';
import type { Maintenance } from '@/types/maintenance';
import type { Goal } from '@/types/goal';
import type { FixedPayment } from '@/types/fixedPayment';
import type { Stop } from '@/types/stop';


interface RunDeliveryDBSchema extends DBSchema {
  companies: {
    key: string;
    value: Company;
    indexes: { 'by-name': string };
  };
  vehicles: {
    key: string;
    value: Vehicle;
    indexes: { 'by-name': string };
  };
  daily_entries: {
    key: string;
    value: DailyEntry;
    indexes: { 'by-date': string, 'by-vehicle': string };
  };
  costs: {
    key: string;
    value: Cost;
    indexes: { 'by-date': string };
  };
  refuels: {
    key: string;
    value: Refuel;
    indexes: { 'by-date': string, 'by-vehicle': string };
  };
  maintenances: {
    key: string;
    value: Maintenance;
    indexes: { 'by-date': string, 'by-vehicle': string };
  };
  goals: {
    key: string; // AAAA-MM
    value: Goal;
  };
  fixed_payments: {
    key: string;
    value: FixedPayment;
    indexes: { 'by-date': string; 'by-company': string; };
  };
  stops: {
    key: string;
    value: Stop;
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'RunDeliveryDB';
const DB_VERSION = 6;

export const getDb = () => {
  return openDB<RunDeliveryDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Atualizando banco de dados da versão ${oldVersion} para ${newVersion}`);

      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('companies')) {
          const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
          companyStore.createIndex('by-name', 'name');
        }
        if (!db.objectStoreNames.contains('vehicles')) {
          const vehicleStore = db.createObjectStore('vehicles', { keyPath: 'id' });
          vehicleStore.createIndex('by-name', 'name');
        }
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('daily_entries')) {
          const entryStore = db.createObjectStore('daily_entries', { keyPath: 'id' });
          entryStore.createIndex('by-date', 'date');
        }
      }

      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('costs')) {
          const store = db.createObjectStore('costs', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('refuels')) {
          const store = db.createObjectStore('refuels', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('maintenances')) {
          const store = db.createObjectStore('maintenances', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
      }
      if (oldVersion < 4) {
        transaction.objectStore('refuels').createIndex('by-vehicle', 'vehicleId');
        transaction.objectStore('maintenances').createIndex('by-vehicle', 'vehicleId');
        transaction.objectStore('daily_entries').createIndex('by-vehicle', 'vehicleId');
      }
      if (oldVersion < 5) {
        if (!db.objectStoreNames.contains('fixed_payments')) {
            const store = db.createObjectStore('fixed_payments', { keyPath: 'id' });
            store.createIndex('by-date', 'date');
            store.createIndex('by-company', 'companyId');
        }
      }
      if (oldVersion < 6) {
        if (!db.objectStoreNames.contains('stops')) {
          const store = db.createObjectStore('stops', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
        }
      }
    },
  });
};

// Companies
export async function getAllCompanies() { return (await getDb()).getAll('companies'); }
export async function saveCompany(company: Company) { return (await getDb()).put('companies', company); }
export async function deleteCompany(id: string) { return (await getDb()).delete('companies', id); }
export async function setCompanyBaseLocation(id: string, baseLocation: { latitude: number; longitude: number; }) {
  const db = await getDb();
  const company = await db.get('companies', id);
  if (company) {
    company.baseLocation = baseLocation;
    return db.put('companies', company);
  }
}

// Vehicles
export async function getAllVehicles() { return (await getDb()).getAll('vehicles'); }
export async function saveVehicle(vehicle: Vehicle) { return (await getDb()).put('vehicles', vehicle); }
export async function deleteVehicle(id: string) { return (await getDb()).delete('vehicles', id); }

// Daily Entries
export async function getAllEntries() { return (await getDb()).getAll('daily_entries'); }
export async function getEntryById(id: string) { return (await getDb()).get('daily_entries', id); }
export async function saveDailyEntry(entry: DailyEntry) { return (await getDb()).put('daily_entries', entry); }
export async function deleteDailyEntry(id: string) { return (await getDb()).delete('daily_entries', id); }

// Costs
export async function getAllCosts() { return (await getDb()).getAll('costs'); }
export async function saveCost(cost: Cost) { return (await getDb()).put('costs', cost); }
export async function deleteCost(id: string) { return (await getDb()).delete('costs', id); }

// Refuels
export async function getAllRefuels() { return (await getDb()).getAll('refuels'); }
export async function saveRefuel(refuel: Refuel) { return (await getDb()).put('refuels', refuel); }
export async function deleteRefuel(id: string) { return (await getDb()).delete('refuels', id); }

// Maintenances
export async function getAllMaintenances() { return (await getDb()).getAll('maintenances'); }
export async function saveMaintenance(maintenance: Maintenance) { return (await getDb()).put('maintenances', maintenance); }
export async function deleteMaintenance(id: string) { return (await getDb()).delete('maintenances', id); }

// Goals
export async function getGoal(id: string) { return (await getDb()).get('goals', id); }
export async function saveGoal(goal: Goal) { return (await getDb()).put('goals', goal); }

// Fixed Payments
export async function getAllFixedPayments() { return (await getDb()).getAll('fixed_payments'); }
export async function saveFixedPayment(payment: FixedPayment) { return (await getDb()).put('fixed_payments', payment); }
export async function deleteFixedPayment(id: string) { return (await getDb()).delete('fixed_payments', id); }

// Stops
export async function getAllStopsByStatus(status: Stop['status']) { return (await getDb()).getAllFromIndex('stops', 'by-status', status); }
export async function saveStop(stop: Stop) { return (await getDb()).put('stops', stop); }
export async function clearAllStops() { return (await getDb()).clear('stops'); }


// Backup & Restore
export async function exportDbToJson() {
  const db = await getDb();
  const dataToExport = {
    companies: await db.getAll('companies'),
    vehicles: await db.getAll('vehicles'),
    daily_entries: await db.getAll('daily_entries'),
    costs: await db.getAll('costs'),
    refuels: await db.getAll('refuels'),
    maintenances: await db.getAll('maintenances'),
    goals: await db.getAll('goals'),
    fixed_payments: await db.getAll('fixed_payments'),
    stops: await db.getAll('stops'),
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `run-delivery-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export async function importDbFromJson(jsonData: string) {
  const db = await getDb();
  const data = JSON.parse(jsonData);
  const stores = ['companies', 'vehicles', 'daily_entries', 'costs', 'refuels', 'maintenances', 'goals', 'fixed_payments', 'stops'] as const;
  
  // Limpa os dados antigos e insere os novos dentro de uma única transação
  const tx = db.transaction(stores, 'readwrite');
  try {
    await Promise.all(stores.map(storeName => {
      const store = tx.objectStore(storeName);
      return store.clear().then(() => {
        if (data[storeName]) {
          return Promise.all(data[storeName].map((record: any) => store.put(record)));
        }
      });
    }));
    await tx.done;
  } catch(e) {
    console.error('Falha na importação', e);
    tx.abort();
    throw e;
  }
}
