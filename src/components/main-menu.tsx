"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BarChart2, Settings } from "lucide-react";

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
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu Principal</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2">
          <Button variant={activeScreen === 'dashboard' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('dashboard')}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant={activeScreen === 'reports' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('reports')}>
            <BarChart2 className="mr-3 h-5 w-5" />
            Relatórios
          </Button>
          <Button variant={activeScreen === 'settings_app' ? 'secondary' : 'ghost'} className="justify-start text-base p-6" onClick={() => handleNavigation('settings_app')}>
            <Settings className="mr-3 h-5 w-5" />
            Configurações do App
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
