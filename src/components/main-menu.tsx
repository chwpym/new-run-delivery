"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import {
  Menu, Home, ListChecks, DollarSign, Fuel, Wrench, Target, BarChart2, Database,
  Building, Car, LogOut, MapPin
} from "lucide-react";

type MainMenuProps = {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
};

export function MainMenu({ activeScreen, setActiveScreen }: MainMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (screen: string) => {
    setActiveScreen(screen);
    setIsOpen(false); // Fecha o menu após a seleção
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">Menu Principal</SheetTitle>
          <SheetDescription className="text-left sr-only">
            Navegação principal do aplicativo. Use os botões para acessar as diferentes telas.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto">
          <nav className="mt-8 flex flex-col gap-2">
            {/* Itens Principais */}
            <Button variant={activeScreen === 'dashboard' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('dashboard')}>
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant={activeScreen === 'rastreador' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('rastreador')}>
              <MapPin className="mr-3 h-5 w-5" />
              Rastreador
            </Button>

            <Button variant={activeScreen === 'registros' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('registros')}>
              <ListChecks className="mr-3 h-5 w-5" />
              Registros
            </Button>
            <Button variant={activeScreen === 'custos' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('custos')}>
              <DollarSign className="mr-3 h-5 w-5" />
              Custos
            </Button>
            <Button variant={activeScreen === 'abastecer' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('abastecer')}>
              <Fuel className="mr-3 h-5 w-5" />
              Abastecer
            </Button>
            <Button variant={activeScreen === 'manutencao' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('manutencao')}>
              <Wrench className="mr-3 h-5 w-5" />
              Manutenção
            </Button>
            <Button variant={activeScreen === 'metas' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('metas')}>
              <Target className="mr-3 h-5 w-5" />
              Metas
            </Button>
            <Button variant={activeScreen === 'relatorios' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('relatorios')}>
              <BarChart2 className="mr-3 h-5 w-5" />
              Relatórios
            </Button>
            <Button variant={activeScreen === 'dados' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('dados')}>
              <Database className="mr-3 h-5 w-5" />
              Dados
            </Button>
          </nav>

          {/* Seção do Rodapé */}
          <div>
            <hr className="my-4 border-border" />
            <nav className="flex flex-col gap-2">
              <Button variant={activeScreen === 'empresas' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('empresas')}>
                <Building className="mr-3 h-5 w-5" />
                Gerenciar Empresas
              </Button>
              <Button variant={activeScreen === 'veiculos' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('veiculos')}>
                <Car className="mr-3 h-5 w-5" />
                Gerenciar Veículos
              </Button>
              <Button variant="ghost" className="justify-start text-base p-6 text-destructive hover:text-destructive" onClick={() => handleNavigation('logout')}>
                <LogOut className="mr-3 h-5 w-5" />
                Reiniciar Sessão
              </Button>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
