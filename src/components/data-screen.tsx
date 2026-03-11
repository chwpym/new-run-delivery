"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, Download } from "lucide-react";
import { exportDbToJson, importDbFromJson } from '@/lib/db';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function DataScreen() {
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
  const [jsonToImport, setJsonToImport] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setJsonToImport(text);
        setIsImportAlertOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!jsonToImport) return;
    try {
      await importDbFromJson(jsonToImport);
      alert("Backup importado com sucesso! O aplicativo será recarregado.");
      window.location.reload(); // Recarrega para que todas as telas atualizem os dados
    } catch (error) {
      console.error("Erro ao importar backup:", error);
      alert("Ocorreu um erro ao importar o backup. Verifique o console para mais detalhes.");
    }
    setIsImportAlertOpen(false);
    setJsonToImport(null);
  };

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>Exporte seus dados para um arquivo de backup ou importe um backup existente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={exportDbToJson}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Backup (JSON)
            </Button>
            <div>
              <Button className="w-full" variant="outline" onClick={() => document.getElementById('import-input')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Importar Backup (JSON)
              </Button>
              <input type="file" id="import-input" accept=".json" className="hidden" onChange={handleFileSelect} />
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção: Isso substituirá TODOS os dados atuais do aplicativo pelos dados do arquivo de backup. Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>Sim, importar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}