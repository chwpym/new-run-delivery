// src/lib/db.ts

import { openDB, type DBSchema } from 'idb';
import type { Company } from '@/types/company';
import type { Vehicle } from '@/types/vehicle';
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
const DB_VERSION = 1;

// 3. Cria e exporta a função que abre a conexão com o banco de dados.
// Nossos componentes irão chamar esta função para poder ler e escrever dados.
export const getDb = () => {
  return openDB<RunDeliveryDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Esta função só é executada na primeira vez que o usuário abre o app,
      // ou quando nós aumentamos o DB_VERSION.
      console.log(`Atualizando banco de dados da versão ${oldVersion} para ${newVersion}`);

      // Criamos a tabela 'companies' se ela não existir.
      if (!db.objectStoreNames.contains('companies')) {
        const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
        companyStore.createIndex('by-name', 'name');
      }

      // Criamos a tabela 'vehicles' se ela não existir.
      if (!db.objectStoreNames.contains('vehicles')) {
        const vehicleStore = db.createObjectStore('vehicles', { keyPath: 'id' });
        vehicleStore.createIndex('by-name', 'name');
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
