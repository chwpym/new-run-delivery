// src/components/dashboard-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";
import { getAllEntries } from '@/lib/db';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardScreenProps {
  onNavigate: (screen: 'rastreador' | 'registros') => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const allEntries = await getAllEntries();
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthlyEntries = allEntries.filter(e => e.date >= monthStart && !e.isDayOff);
      const total = monthlyEntries.reduce((sum, entry) => sum + (entry.totalEarned || 0), 0);
      setMonthlyEarnings(total);
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Resumo do Mês</CardTitle><TrendingUp className="h-5 w-5 text-muted-foreground" /></CardHeader>
        <CardContent><p className="text-4xl font-bold text-primary">R$ {monthlyEarnings.toFixed(2)}</p><p className="text-sm text-muted-foreground">Ganhos em {format(new Date(), 'MMMM', { locale: ptBR })}</p></CardContent>
      </Card>
      <Button size="lg" className="w-full h-16 text-lg" onClick={() => onNavigate('rastreador')}><MapPin className="mr-3 h-6 w-6" />Iniciar Rastreamento</Button>
    </div>
  );
}
