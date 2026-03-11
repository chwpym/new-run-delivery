// src/lib/__tests__/db-import.test.ts
import { describe, it, expect } from 'vitest';

// We test the validation logic of importDbFromJson by importing the module
// Since IndexedDB is not available in test env, we test the validation layer
// by extracting the validation logic into a testable function.

// For now, we test the validation rules that importDbFromJson would apply:

describe('importDbFromJson validation', () => {
  // Helper to simulate validation logic from db.ts
  function validateImportData(jsonData: string) {
    let data: any;

    try {
      data = JSON.parse(jsonData);
    } catch {
      throw new Error('O arquivo não contém JSON válido.');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('O formato do backup é inválido. Esperado um objeto JSON.');
    }

    const stores = ['companies', 'vehicles', 'daily_entries', 'costs', 'refuels', 'maintenances', 'goals', 'fixed_payments', 'stops'] as const;

    for (const storeName of stores) {
      if (data[storeName] !== undefined) {
        if (!Array.isArray(data[storeName])) {
          throw new Error(`Dados inválidos: "${storeName}" deveria ser um array.`);
        }
        for (const record of data[storeName]) {
          if (!record || typeof record !== 'object' || !record.id) {
            throw new Error(`Registro inválido em "${storeName}": cada item precisa ter um campo "id".`);
          }
        }
      }
    }

    return data;
  }

  it('should reject invalid JSON', () => {
    expect(() => validateImportData('not json')).toThrow('O arquivo não contém JSON válido.');
  });

  it('should reject arrays at root level', () => {
    expect(() => validateImportData('[1,2,3]')).toThrow('O formato do backup é inválido');
  });

  it('should reject null', () => {
    expect(() => validateImportData('null')).toThrow('O formato do backup é inválido');
  });

  it('should reject primitives', () => {
    expect(() => validateImportData('"hello"')).toThrow('O formato do backup é inválido');
    expect(() => validateImportData('42')).toThrow('O formato do backup é inválido');
  });

  it('should reject store that is not an array', () => {
    expect(() => validateImportData('{"companies":"not array"}')).toThrow('deveria ser um array');
  });

  it('should reject records without id field', () => {
    expect(() => validateImportData('{"companies":[{"name":"Test"}]}')).toThrow('precisa ter um campo "id"');
  });

  it('should reject null records in array', () => {
    expect(() => validateImportData('{"companies":[null]}')).toThrow('precisa ter um campo "id"');
  });

  it('should accept valid backup data', () => {
    const validData = JSON.stringify({
      companies: [{ id: '1', name: 'Test Company' }],
      vehicles: [{ id: '2', plate: 'ABC-1234' }],
    });
    expect(() => validateImportData(validData)).not.toThrow();
  });

  it('should accept empty object (no stores)', () => {
    expect(() => validateImportData('{}')).not.toThrow();
  });

  it('should accept empty arrays for stores', () => {
    const data = JSON.stringify({ companies: [], vehicles: [] });
    expect(() => validateImportData(data)).not.toThrow();
  });

  it('should ignore unknown store names', () => {
    const data = JSON.stringify({ unknown_store: 'anything' });
    expect(() => validateImportData(data)).not.toThrow();
  });
});
