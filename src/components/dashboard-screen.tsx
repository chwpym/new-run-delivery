"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, PlusCircle, TrendingUp, Target, TrendingDown } from "lucide-react";
import { getAllEntries, getAllCosts, getAllRefuels, getAllMaintenances, getGoal } from '@/lib/db';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from './ui/progress';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [stats, setStats] = useState({ gross: 0, net: 0, totalCosts: 0 });
  const [goalProgress, setGoalProgress] = useState({ current: 0, goal: 0, progress: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      const goalId = format(now, 'yyyy-MM');
      
      const [entries, costs, refuels, maintenances, goal] = await Promise.all([
        getAllEntries(),
        getAllCosts(),
        getAllRefuels(),
        getAllMaintenances(),
        getGoal(goalId),
      ]);
      
      const monthlyEntries = entries.filter(e => e.date >= monthStart && e.date <= monthEnd && !e.isDayOff);
      const gross = monthlyEntries.reduce((sum, entry) => sum + (entry.totalEarned || 0), 0);

      const monthlyCosts = costs.filter(c => c.date >= monthStart && c.date <= monthEnd).reduce((s, c) => s + c.value, 0);
      const monthlyRefuels = refuels.filter(r => r.date >= monthStart && r.date <= monthEnd).reduce((s, r) => s + r.value, 0);
      const monthlyMaintenances = maintenances.filter(m => m.date >= monthStart && m.date <= monthEnd).reduce((s, m) => s + m.value, 0);
      const totalCosts = monthlyCosts + monthlyRefuels + monthlyMaintenances;

      const net = gross - totalCosts;

      setStats({ gross, net, totalCosts });

      const currentGoal = goal?.value || 0;
      const progress = currentGoal > 0 ? (gross / currentGoal) * 100 : 0;
      setGoalProgress({ current: gross, goal: currentGoal, progress });
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de {format(new Date(), 'MMMM', { locale: ptBR })}</CardTitle>
          <CardDescription>Seu resumo financeiro para o mês atual.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4 bg-green-600/10 border-green-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
              <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">R$ {stats.net.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="p-4">
             <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
              <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">R$ {stats.gross.toFixed(2)}</div>
            </CardContent>
          </Card>
           <Card className="p-4">
             <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">R$ {stats.totalCosts.toFixed(2)}</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      {goalProgress.goal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Meta do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={goalProgress.progress} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>R$ {goalProgress.current.toFixed(2)}</span>
                <span>R$ {goalProgress.goal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Button size="lg" className="h-16 text-lg sm:col-span-3" onClick={() => onNavigate('rastreador')}>
          <MapPin className="mr-3 h-6 w-6" />Iniciar Rastreamento
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('registros')}>
          <PlusCircle className="mr-2 h-5 w-5" />Adicionar Registro
        </Button>
        <Button size="lg" variant="secondary" onClick={() => onNavigate('custos')}>
          <PlusCircle className="mr-2 h-5 w-5" />Adicionar Custo
        </Button>
         <Button size="lg" variant="secondary" onClick={() => onNavigate('abastecer')}>
          <PlusCircle className="mr-2 h-5 w-5" />Abastecer
        </Button>
      </div>
    </div>
  );
}