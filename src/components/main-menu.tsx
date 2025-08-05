// src/components/main-menu.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  MapPin,
  ListChecks,
  BarChart,
  Building2,
  Car,
  Database,
} from "lucide-react";

type MainMenuProps = {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
};

export function MainMenu({ activeScreen, setActiveScreen }: MainMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (screen: string) => {
    setActiveScreen(screen);
    setIsOpen(false);
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rastreador', label: 'Rastreador', icon: MapPin },
    { id: 'registros', label: 'Registros', icon: ListChecks },
    { id: 'reports', label: 'Relatórios', icon: BarChart },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'veiculos', label: 'Veículos', icon: Car },
    { id: 'dados', label: 'Backup/Restore', icon: Database },
  ];

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
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map(item => (
             <Button
              key={item.id}
              variant={activeScreen === item.id ? 'secondary' : 'ghost'}
              className="justify-start text-base p-6"
              onClick={() => handleNavigation(item.id)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
