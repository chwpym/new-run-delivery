"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, PlusCircle, TrendingUp, Target, TrendingDown, Package, Gauge } from "lucide-react";
import { getAllEntries, getAllCosts, getAllRefuels, getAllMaintenances, getGoal, getAllFixedPayments } from '@/lib/db';
import { format, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from './ui/progress';
import { DateRangeFilter } from './ui/date-range-filter';
import Link from 'next/link';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [stats, setStats] = useState({ gross: 0, net: 0, totalCosts: 0, avgDeliveries: 0, costPerKm: 0, totalDeliveries: 0, workDays: 0, totalKm: 0 });
  const [goalProgress, setGoalProgress] = useState({ current: 0, goal: 0, progress: 0 });
  
  const now = new Date();
  const [filterStart, setFilterStart] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [filterEnd, setFilterEnd] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const fetchDashboardData = useCallback(async () => {
    const goalId = filterStart.substring(0, 7);
    
    const [entries, costs, refuels, maintenances, goal, fixedPayments] = await Promise.all([
      getAllEntries(),
      getAllCosts(),
      getAllRefuels(),
      getAllMaintenances(),
      getGoal(goalId),
      getAllFixedPayments(),
    ]);
    
    const monthlyEntries = entries.filter(e => e.date >= filterStart && e.date <= filterEnd && !e.isDayOff);
    const dailyGross = monthlyEntries.reduce((sum, entry) => sum + (entry.totalEarned || 0), 0);
    const totalDeliveries = monthlyEntries.reduce((sum, entry) => sum + (entry.deliveriesCount || 0), 0);
    const workDays = monthlyEntries.length;

    const monthlyFixedPayments = fixedPayments.filter(p => p.date >= filterStart && p.date <= filterEnd);
    const fixedGross = monthlyFixedPayments.reduce((sum, p) => sum + p.value, 0);

    const gross = dailyGross + fixedGross;

    const monthlyCosts = costs.filter(c => c.date >= filterStart && c.date <= filterEnd).reduce((s, c) => s + c.value, 0);
    const monthlyRefuels = refuels.filter(r => r.date >= filterStart && r.date <= filterEnd);
    const refuelsCost = monthlyRefuels.reduce((s, r) => s + r.value, 0);
    const totalKm = monthlyRefuels.reduce((maxKm, r) => Math.max(maxKm, r.km || 0), 0) - monthlyRefuels.reduce((minKm, r) => Math.min(minKm, r.km || Infinity), Infinity);
    const monthlyMaintenances = maintenances.filter(m => m.date >= filterStart && m.date <= filterEnd).reduce((s, m) => s + m.value, 0);
    const totalCosts = monthlyCosts + refuelsCost + monthlyMaintenances;

    const net = gross - totalCosts;

    // Média diária de entregas
    const avgDeliveries = workDays > 0 ? totalDeliveries / workDays : 0;

    // Custo por km (combustível / km)
    const costPerKm = totalKm > 0 ? refuelsCost / totalKm : 0;

    setStats({ gross, net, totalCosts, avgDeliveries, costPerKm, totalDeliveries, workDays, totalKm: totalKm > 0 ? totalKm : 0 });

    const currentGoal = goal?.value || 0;
    const progress = currentGoal > 0 ? (gross / currentGoal) * 100 : 0;
    setGoalProgress({ current: gross, goal: currentGoal, progress });
  }, [filterStart, filterEnd]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-4 space-y-4">
      <DateRangeFilter onFilterChange={(s, e) => { setFilterStart(s); setFilterEnd(e); }} />

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
          <CardDescription>Seu resumo financeiro para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <Card className="p-4 bg-green-600/10 border-green-600 col-span-2 sm:col-span-1">
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

          {/* Novos cards de estatísticas */}
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
              <CardTitle className="text-sm font-medium">Média/Dia</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">{stats.avgDeliveries.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{stats.totalDeliveries} entregas em {stats.workDays} dias</p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
              <CardTitle className="text-sm font-medium">Custo/km</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">R$ {stats.costPerKm.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{stats.totalKm > 0 ? `${stats.totalKm} km rodados` : 'Sem dados de km'}</p>
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
        <Button size="lg" className="h-14 text-lg sm:col-span-3 min-h-[48px]" asChild>
          <Link href="/rastreador">
            <MapPin className="mr-3 h-6 w-6" />Iniciar Rastreamento
          </Link>
        </Button>
        <Button size="lg" variant="secondary" className="min-h-[48px]" asChild>
          <Link href="/registros">
            <PlusCircle className="mr-2 h-5 w-5" />Adicionar Registro
          </Link>
        </Button>
        <Button size="lg" variant="secondary" className="min-h-[48px]" asChild>
          <Link href="/custos">
            <PlusCircle className="mr-2 h-5 w-5" />Adicionar Custo
          </Link>
        </Button>
        <Button size="lg" variant="secondary" className="min-h-[48px]" asChild>
          <Link href="/abastecer">
            <PlusCircle className="mr-2 h-5 w-5" />Abastecer
          </Link>
        </Button>
      </div>
    </div>
  );
}
