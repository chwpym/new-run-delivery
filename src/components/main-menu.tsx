// src/components/main-menu.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu, Home, ListChecks, DollarSign, Fuel, Wrench, Target, BarChart2, Database,
  Building, Car, LogOut, MapPin, HandCoins, Settings
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type MainMenuProps = {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
};

export function MainMenu({ activeScreen, setActiveScreen }: MainMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (screen: string) => {
    setActiveScreen(screen);
    // Não fecha o menu se estiver abrindo/fechando o accordion
    if (screen !== 'configuracoes-trigger') {
      setIsOpen(false);
    }
  };

  const navigate = (screen: string) => {
    if (screen === 'reset-session') {
      setActiveScreen('reset-session');
      setIsOpen(false);
    } else {
      handleNavigation(screen);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-left">Menu Principal</SheetTitle>
          <SheetDescription className="sr-only">
            Navegação principal do aplicativo. Use os botões para acessar as diferentes telas.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto">
          <nav className="mt-8 flex flex-col gap-2 px-4">
            {/* Itens Principais */}
            <Button variant={activeScreen === 'dashboard' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('dashboard')}>
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant={activeScreen === 'rastreador' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('rastreador')}>
              <MapPin className="mr-3 h-5 w-5" />
              Rastreador
            </Button>
            <Button variant={activeScreen === 'registros' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('registros')}>
              <ListChecks className="mr-3 h-5 w-5" />
              Registros
            </Button>
             <Button variant={activeScreen === 'recebimentos' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('recebimentos')}>
              <HandCoins className="mr-3 h-5 w-5" />
              Recebimentos
            </Button>
            <Button variant={activeScreen === 'custos' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('custos')}>
              <DollarSign className="mr-3 h-5 w-5" />
              Custos
            </Button>
            <Button variant={activeScreen === 'abastecer' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('abastecer')}>
              <Fuel className="mr-3 h-5 w-5" />
              Abastecer
            </Button>
            <Button variant={activeScreen === 'manutencao' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('manutencao')}>
              <Wrench className="mr-3 h-5 w-5" />
              Manutenção
            </Button>
            <Button variant={activeScreen === 'metas' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('metas')}>
              <Target className="mr-3 h-5 w-5" />
              Metas
            </Button>
            <Button variant={activeScreen === 'relatorios' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('relatorios')}>
              <BarChart2 className="mr-3 h-5 w-5" />
              Relatórios
            </Button>
            <Button variant={activeScreen === 'dados' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => navigate('dados')}>
              <Database className="mr-3 h-5 w-5" />
              Dados
            </Button>
          </nav>

          {/* Seção do Rodapé com Configurações e Reset */}
          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-0 hover:no-underline">
                   <Button variant={['empresas', 'veiculos'].includes(activeScreen) ? 'secondary' : 'ghost'} className="w-full justify-start text-base p-6">
                      <Settings className="mr-3 h-5 w-5" />
                      Configurações
                    </Button>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pl-8 space-y-2">
                   <Button variant={activeScreen === 'empresas' ? 'secondary' : 'ghost'} className="w-full justify-start text-base p-6" onClick={() => navigate('empresas')}>
                    <Building className="mr-3 h-5 w-5" />
                    Gerenciar Empresas
                  </Button>
                  <Button variant={activeScreen === 'veiculos' ? 'secondary' : 'ghost'} className="w-full justify-start text-base p-6" onClick={() => navigate('veiculos')}>
                    <Car className="mr-3 h-5 w-5" />
                    Gerenciar Veículos
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
             <Button variant="ghost" className="w-full justify-start text-base p-6 text-destructive hover:text-destructive" onClick={() => navigate('reset-session')}>
              <LogOut className="mr-3 h-5 w-5" />
              Reiniciar Sessão
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}