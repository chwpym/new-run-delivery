// src/components/main-menu.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu, Home, ListChecks, DollarSign, Fuel, Wrench, Target, BarChart2, Database,
  Building, Car, LogOut, MapPin, HandCoins, Settings, Route
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type MainMenuProps = {
  onResetSession: () => void;
};

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/rastreador', label: 'Rastreador', icon: MapPin },
  { href: '/auditoria', label: 'Auditoria de Paradas', icon: Route },
  { href: '/registros', label: 'Registros', icon: ListChecks },
  { href: '/recebimentos', label: 'Recebimentos', icon: HandCoins },
  { href: '/custos', label: 'Custos', icon: DollarSign },
  { href: '/abastecer', label: 'Abastecer', icon: Fuel },
  { href: '/manutencao', label: 'Manutenção', icon: Wrench },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/dados', label: 'Dados', icon: Database },
];

const configItems = [
  { href: '/empresas', label: 'Gerenciar Empresas', icon: Building },
  { href: '/veiculos', label: 'Gerenciar Veículos', icon: Car },
];

export function MainMenu({ onResetSession }: MainMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto">
          <nav className="mt-8 flex flex-col gap-2 px-4">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Button
                key={href}
                variant={pathname === href ? 'secondary' : 'ghost'}
                className="justify-start text-base p-6"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link href={href}>
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6 justify-start text-base hover:bg-accent rounded-md w-full">
                  <Settings className="mr-3 h-5 w-5" />
                  Configurações
                </AccordionTrigger>
                <AccordionContent className="pb-0 pl-8 space-y-2">
                  {configItems.map(({ href, label, icon: Icon }) => (
                    <Button
                      key={href}
                      variant={pathname === href ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-base p-6"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={href}>
                        <Icon className="mr-3 h-5 w-5" />
                        {label}
                      </Link>
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              variant="ghost"
              className="w-full justify-start text-base p-6 text-destructive hover:text-destructive"
              onClick={() => { onResetSession(); setIsOpen(false); }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Reiniciar Sessão
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
