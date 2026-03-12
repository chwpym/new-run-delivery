// src/lib/export-utils.ts

/**
 * Converte um array de objetos em uma string CSV.
 * @param data Array de objetos contendo os dados.
 * @param headers (Opcional) Array de strings com os cabeçalhos das colunas.
 * @returns String formatada em CSV.
 */
export function convertToCSV<T extends Record<string, any>>(data: T[], headers?: string[]): string {
  if (!data || !data.length) {
    return '';
  }

  const keys = Object.keys(data[0]);
  const columnHeaders = headers || keys;

  const csvRows = [];
  
  // Adiciona o cabeçalho
  csvRows.push(columnHeaders.join(','));

  // Adiciona as linhas de dados
  for (const row of data) {
    const values = keys.map(key => {
      let value = row[key];
      // Tratamento para evitar que vírgulas no texto quebrem o CSV
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      return value ?? '';
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Cria um arquivo CSV em memória e força o download no navegador.
 * @param csvContent String com o conteúdo do CSV.
 * @param filename Nome do arquivo (ex: 'relatorio.csv')
 */
export function downloadCSV(csvContent: string, filename: string) {
  // O BOM (\ufeff) ajuda o Excel a reconhecer os caracteres UTF-8 corretamente (acentos, etc)
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
