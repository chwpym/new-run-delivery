"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle, MapPin, Edit, Trash2 } from "lucide-react";
import { AddCompanyModal } from './add-company-modal';
import type { Company } from '@/types/company';
// Importe o AlertDialog para a exclusão
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function CompaniesScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleSaveCompany = (companyData: Pick<Company, 'name'>, id?: string) => {
    if (id) { // Editando
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...companyData } : c));
    } else { // Adicionando
      const newCompany: Company = { id: new Date().toISOString(), ...companyData };
      setCompanies(prev => [...prev, newCompany]);
    }
  };

  const handleSetBaseLocation = (companyId: string) => {
    if (!navigator.geolocation) return alert("GPS não suportado.");
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, baseLocation: { latitude, longitude } } : c));
      alert(`Base definida com sucesso!`);
    }, (error) => {
      alert(`Erro ao obter localização: ${error.message}`);
    });
  };

  const handleDeleteCompany = () => {
    if (!companyToDelete) return;
    setCompanies(prev => prev.filter(c => c.id !== companyToDelete.id));
    setCompanyToDelete(null);
  };

  return (
    <>
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Empresas</CardTitle>
              <CardDescription>Cadastre as empresas para as quais você trabalha.</CardDescription>
            </div>
            <Button onClick={() => { setCompanyToEdit(null); setIsModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Empresa
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.length > 0 ? companies.map(company => (
              <Card key={company.id} className="p-4 space-y-2">
                <p className="font-bold text-lg">{company.name}</p>
                {company.baseLocation ? (
                  <p className="text-xs text-green-500">Base definida: {company.baseLocation.latitude.toFixed(4)}, {company.baseLocation.longitude.toFixed(4)}</p>
                ) : (
                  <p className="text-xs text-yellow-500">Base não definida.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSetBaseLocation(company.id)}><MapPin className="mr-2 h-4 w-4" /> Definir Base Aqui</Button>
                  <Button variant="outline" size="sm" onClick={() => { setCompanyToEdit(company); setIsModalOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => setCompanyToDelete(company)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
                </div>
              </Card>
            )) : <p className="text-center text-muted-foreground py-8">Nenhuma empresa cadastrada.</p>}
          </CardContent>
        </Card>
      </div>

      <AddCompanyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveCompany} companyToEdit={companyToEdit} />

      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>A empresa "{companyToDelete?.name}" será excluída permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCompany}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
