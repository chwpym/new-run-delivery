"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Company } from '@/types/company';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Pick<Company, 'name'>, id?: string) => void;
  companyToEdit?: Company | null;
}

export function AddCompanyModal({ isOpen, onClose, onSave, companyToEdit }: AddCompanyModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(companyToEdit ? companyToEdit.name : '');
  }, [companyToEdit, isOpen]);

  const handleSubmit = () => {
    if (!name) return alert("O nome da empresa é obrigatório.");
    onSave({ name }, companyToEdit?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{companyToEdit ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit}>{companyToEdit ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
