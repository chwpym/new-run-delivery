// src/app/(main)/layout.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/settings-sheet";
import { Truck, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MainMenu } from "@/components/main-menu";
import { useApp } from "@/components/providers/app-provider";

import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { LoginScreen } from "@/components/login-screen";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMounted, isDataLoaded, count, setCount, settings, setSettings, companies, vehicles, session } = useApp();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetSessionDialogOpen, setIsResetSessionDialogOpen] = useState(false);

  const confirmReset = () => { setCount(0); setIsResetDialogOpen(false); };

  const handleResetSession = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!isMounted || !isDataLoaded) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><Truck className="h-16 w-16 animate-pulse text-primary" /></div>;
  }

  if (!session) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  if (companies.length === 0 || vehicles.length === 0) {
    return <OnboardingScreen />;
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-headline">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MainMenu onResetSession={() => setIsResetSessionDialogOpen(true)} />
          <h1 className="text-xl font-bold">RunDelivery</h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button onClick={() => setIsResetDialogOpen(true)} variant="ghost" size="icon"><RotateCcw className="h-5 w-5" /></Button>
          <SettingsSheet settings={settings} setSettings={setSettings} />
        </div>
      </header>

      <OfflineIndicator />

      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>

      <footer className="py-1 text-center text-xs text-muted-foreground border-t">
        RunDelivery v1.0.0
      </footer>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Zerar contador?</AlertDialogTitle><AlertDialogDescription>Esta ação irá zerar o contador de entregas de hoje.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmReset}>Sim, zerar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isResetSessionDialogOpen} onOpenChange={setIsResetSessionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar Sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação limpará todos os dados de sessão do aplicativo (contadores, configurações salvas), mas não excluirá seus registros do banco de dados (empresas, veículos, etc.). Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSession}>Sim, reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
