"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BarChart2, Settings } from "lucide-react";

// Futuramente, podemos passar a aba ativa como prop para destacar o item certo.
// type MainMenuProps = {
//   activeTab: string;
//   setActiveTab: (tab: string) => void;
// };

export function MainMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (tab: string) => {
    // Por enquanto, apenas logamos a navegação.
    // No futuro, isso irá trocar a tela visível.
    console.log(`Navegando para: ${tab}`);
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
          <Button variant="ghost" className="justify-start text-base p-6" onClick={() => handleNavigation('dashboard')}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start text-base p-6" onClick={() => handleNavigation('reports')}>
            <BarChart2 className="mr-3 h-5 w-5" />
            Relatórios
          </Button>
          <Button variant="ghost" className="justify-start text-base p-6" onClick={() => handleNavigation('settings_app')}>
            <Settings className="mr-3 h-5 w-5" />
            Configurações do App
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
