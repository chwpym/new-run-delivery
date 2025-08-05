// src/lib/db.ts

import { openDB, type DBSchema } from 'idb';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
import type { DailyEntry } from '@/types/dailyEntry';
// Futuramente, importaremos outros tipos aqui
// import type { Stop } from '@/types/stop';
// import type { DailyEntry } from '@/types/dailyEntry';

// 1. Define a "Schema" do nosso banco de dados.
// Isso diz ao TypeScript quais "tabelas" (Object Stores) nós temos
// e como são os dados dentro delas.
interface RunDeliveryDBSchema extends DBSchema {
  companies: {
    key: string; // A chave primária (ID) é uma string
    value: Company; // Os valores são do tipo Company
    indexes: { 'by-name': string }; // Um índice para buscar por nome
  };
  vehicles: {
    key: string;
    value: Vehicle;
    indexes: { 'by-name': string };
  };
  daily_entries: {
    key: string;
    value: DailyEntry;
    indexes: { 'by-date': string };
  };
  // Futuramente, adicionaremos outras tabelas aqui
  /*
  stops: {
    key: string;
    value: Stop;
    indexes: { 'by-date': number };
  };
  daily_entries: {
    key: string;
    value: DailyEntry;
    indexes: { 'by-date': string };
  };
  */
}

// 2. Define o nome e a versão do nosso banco de dados.
// Se precisarmos adicionar novas tabelas ou índices no futuro,
// nós incrementaremos o número da versão.
const DB_NAME = 'RunDeliveryDB';
const DB_VERSION = 2;

// 3. Cria e exporta a função que abre a conexão com o banco de dados.
// Nossos componentes irão chamar esta função para poder ler e escrever dados.
export const getDb = () => {
  return openDB<RunDeliveryDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Esta função só é executada na primeira vez que o usuário abre o app,
      // ou quando nós aumentamos o DB_VERSION.
      console.log(`Atualizando banco de dados da versão ${oldVersion} para ${newVersion}`);

      // Criamos a tabela 'companies' se ela não existir.
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('companies')) {
          const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
          companyStore.createIndex('by-name', 'name');
        }

        // Criamos a tabela 'vehicles' se ela não existir.
        if (!db.objectStoreNames.contains('vehicles')) {
          const vehicleStore = db.createObjectStore('vehicles', { keyPath: 'id' });
          vehicleStore.createIndex('by-name', 'name');
        }
      }

      if (oldVersion < 2) {
        // Cria a tabela 'daily_entries' se ela não existir.
        if (!db.objectStoreNames.contains('daily_entries')) {
          const entryStore = db.createObjectStore('daily_entries', { keyPath: 'id' });
          entryStore.createIndex('by-date', 'date');
        }
      }

      // Futuramente, a criação de novas tabelas virá aqui.
    },
  });
};

// Funções CRUD para a tabela 'companies'

export async function getAllCompanies() {
  const db = await getDb();
  return db.getAll('companies');
}

export async function saveCompany(company: Company) {
  const db = await getDb();
  return db.put('companies', company);
}

export async function deleteCompany(id: string) {
  const db = await getDb();
  return db.delete('companies', id);
}

export async function setCompanyBaseLocation(id: string, baseLocation: { latitude: number; longitude: number; }) {
  const db = await getDb();
  const company = await db.get('companies', id);
  if (company) {
    company.baseLocation = baseLocation;
    return db.put('companies', company);
  }
}

// Funções CRUD para a tabela 'vehicles'

export async function getAllVehicles() {
  const db = await getDb();
  return db.getAll('vehicles');
}

export async function saveVehicle(vehicle: Vehicle) {
  const db = await getDb();
  return db.put('vehicles', vehicle);
}

export async function deleteVehicle(id: string) {
  const db = await getDb();
  return db.delete('vehicles', id);
}

// Funções CRUD para a tabela 'daily_entries'

export async function getAllEntries() {
  const db = await getDb();
  return db.getAll('daily_entries');
}

export async function getEntryById(id: string) {
  const db = await getDb();
  return db.get('daily_entries', id);
}

export async function saveDailyEntry(entry: DailyEntry) {
  const db = await getDb();
  return db.put('daily_entries', entry);
}

export async function deleteDailyEntry(id: string) {
  const db = await getDb();
  return db.delete('daily_entries', id);
}


// Funções de Backup e Restauração

export async function exportDbToJson() {
  const db = await getDb();
  const companiesData = await db.getAll('companies');
  const vehiclesData = await db.getAll('vehicles');
  const entriesData = await db.getAll('daily_entries');
  // Futuramente, adicionaremos outras tabelas aqui

  const dataToExport = {
    companies: companiesData,
    vehicles: vehiclesData,
    daily_entries: entriesData
  };

  // Cria um "blob" (Binary Large Object) com os dados em formato JSON
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Cria um link temporário e simula um clique para iniciar o download
  const a = document.createElement('a');
  a.download = `run-delivery-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  // Libera a URL do objeto da memória
  URL.revokeObjectURL(url);
}

export async function importDbFromJson(jsonData: string) {
  const db = await getDb();
  const data = JSON.parse(jsonData);

  // Inicia uma transação para apagar os dados antigos e inserir os novos
  const tx = db.transaction(['companies', 'vehicles', 'daily_entries'], 'readwrite');

  // Limpa as tabelas atuais
  await tx.objectStore('companies').clear();
  await tx.objectStore('vehicles').clear();
  await tx.objectStore('daily_entries').clear();


  // Insere os novos dados do backup
  if (data.companies) {
    for (const company of data.companies) {
      await tx.objectStore('companies').put(company);
    }
  }
  if (data.vehicles) {
    for (const vehicle of data.vehicles) {
      await tx.objectStore('vehicles').put(vehicle);
    }
  }
   if (data.daily_entries) {
    for (const entry of data.daily_entries) {
      await tx.objectStore('daily_entries').put(entry);
    }
  }

  // Espera a transação ser completada
  await tx.done;
}
