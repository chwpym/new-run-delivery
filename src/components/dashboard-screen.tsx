"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, PlusCircle, TrendingUp, Target, TrendingDown, Package, Gauge, AlertTriangle } from "lucide-react";
import { getAllEntries, getAllCosts, getAllRefuels, getAllMaintenances, getGoal, getAllFixedPayments, getAllVehicles } from '@/lib/db';
import { format, startOfMonth, endOfMonth, differenceInCalendarDays, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from './ui/progress';
import { DateRangeFilter } from './ui/date-range-filter';
import Link from 'next/link';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useApp } from "@/components/providers/app-provider";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { activeCompanyId } = useApp();
  const [stats, setStats] = useState({ gross: 0, net: 0, totalCosts: 0, avgDeliveries: 0, costPerKm: 0, totalDeliveries: 0, workDays: 0, totalKm: 0 });
  const [goalProgress, setGoalProgress] = useState({ current: 0, goal: 0, progress: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<{
    vehicleName: string;
    itemName: string;
    currentKm: number;
    lastMaintenanceKm: number;
    kmSinceMaintenance: number;
    limitKm: number;
    limitMonths: number;
    monthsSince: number | null;
    reason: 'km' | 'time';
  }[]>([]);
  
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
    
    const monthlyEntries = entries.filter(e => 
      e.date >= filterStart && 
      e.date <= filterEnd && 
      !e.isDayOff &&
      (activeCompanyId === 'all' || e.companyId === activeCompanyId)
    );
    const dailyGross = monthlyEntries.reduce((sum, entry) => sum + (entry.totalEarned || 0), 0);
    const totalDeliveries = monthlyEntries.reduce((sum, entry) => sum + (entry.deliveriesCount || 0), 0);
    const workDays = monthlyEntries.length;

    const monthlyFixedPayments = fixedPayments.filter(p => 
      p.date >= filterStart && 
      p.date <= filterEnd &&
      (activeCompanyId === 'all' || p.companyId === activeCompanyId)
    );
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

    // Process chart data for evolution
    try {
      const daysInInterval = eachDayOfInterval({ start: parseISO(filterStart), end: parseISO(filterEnd) });
      const processedChartData = daysInInterval.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        
        const entryForDay = entries.find(e => 
          e.date === dayStr && 
          !e.isDayOff &&
          (activeCompanyId === 'all' || e.companyId === activeCompanyId)
        );
        const dailyEarned = entryForDay?.totalEarned || 0;
        const fixedForDay = fixedPayments.filter(p => 
          p.date === dayStr &&
          (activeCompanyId === 'all' || p.companyId === activeCompanyId)
        ).reduce((sum, p) => sum + p.value, 0);
        
        const costsForDay = costs.filter(c => c.date === dayStr).reduce((s, c) => s + c.value, 0);
        const refuelsForDay = refuels.filter(r => r.date === dayStr).reduce((s, r) => s + r.value, 0);
        const maintenancesForDay = maintenances.filter(m => m.date === dayStr).reduce((s, m) => s + m.value, 0);

        return { 
          date: format(day, 'dd/MM'), 
          gross: dailyEarned + fixedForDay,
          expenses: costsForDay + refuelsForDay + maintenancesForDay
        };
      });
      setChartData(processedChartData);
    } catch (e) {
      console.error("Invalid date interval for chartData");
    }

    // Calcular alertas de manutenção preventiva por item/peça
    try {
      const allVehicles = await getAllVehicles();
      const alertsList: typeof maintenanceAlerts = [];

      const DEFAULT_LIMITS = {
        "Óleo": { kmLimit: 1000, monthLimit: 6 },
        "Filtro de Ar": { kmLimit: 5000, monthLimit: 6 },
        "Pastilha de Freio": { kmLimit: 8000, monthLimit: 12 },
        "Relação (Corrente)": { kmLimit: 5000, monthLimit: 12 },
        "Pneu Dianteiro": { kmLimit: 15000, monthLimit: 24 },
        "Pneu Traseiro": { kmLimit: 12000, monthLimit: 24 },
        "Vela de Ignição": { kmLimit: 10000, monthLimit: 12 }
      };

      for (const vehicle of allVehicles) {
        const limits = vehicle.maintenanceLimits || DEFAULT_LIMITS;

        const vehicleDailyEntries = entries.filter(e => e.vehicleId === vehicle.id);
        const maxDailyKm = vehicleDailyEntries.reduce((max, e) => Math.max(max, e.endKm || 0), 0);

        const vehicleRefuels = refuels.filter(r => r.vehicleId === vehicle.id);
        const maxRefuelKm = vehicleRefuels.reduce((max, r) => Math.max(max, r.km || 0), 0);

        const currentKm = Math.max(maxDailyKm, maxRefuelKm);
        const vehicleMaintenances = maintenances.filter(m => m.vehicleId === vehicle.id);

        for (const [itemName, config] of Object.entries(limits)) {
          // Busca a manutenção mais recente que combine com o nome do item
          const matchingMaint = vehicleMaintenances
            .filter(m => m.description.toLowerCase().includes(itemName.toLowerCase()) ||
                         itemName.toLowerCase().includes(m.description.toLowerCase()))
            .sort((a, b) => b.date.localeCompare(a.date))[0];

          const lastMaintKm = matchingMaint ? (matchingMaint.km || 0) : 0;
          const lastMaintDate = matchingMaint ? parseISO(matchingMaint.date) : null;

          const kmSinceMaintenance = currentKm - lastMaintKm;

          let monthsSince = Infinity;
          if (lastMaintDate) {
            const today = new Date();
            monthsSince = (today.getFullYear() - lastMaintDate.getFullYear()) * 12 + (today.getMonth() - lastMaintDate.getMonth());
          } else {
            monthsSince = currentKm > 0 ? Infinity : 0;
          }

          const isKmExpired = currentKm > 0 && kmSinceMaintenance >= config.kmLimit;
          const isTimeExpired = monthsSince >= config.monthLimit;

          if (isKmExpired || isTimeExpired) {
            alertsList.push({
              vehicleName: vehicle.name,
              itemName,
              currentKm,
              lastMaintenanceKm: lastMaintKm,
              kmSinceMaintenance,
              limitKm: config.kmLimit,
              limitMonths: config.monthLimit,
              monthsSince: lastMaintDate ? monthsSince : null,
              reason: isKmExpired ? 'km' : 'time'
            });
          }
        }
      }
      setMaintenanceAlerts(alertsList);
    } catch (e) {
      console.error("Erro ao calcular alertas de manutenção", e);
    }

  }, [filterStart, filterEnd, activeCompanyId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-4 space-y-4">
      <DateRangeFilter onFilterChange={(s, e) => { setFilterStart(s); setFilterEnd(e); }} />

      {maintenanceAlerts.length > 0 && (
        <div className="space-y-2">
          {maintenanceAlerts.map((alert, idx) => (
            <Card key={idx} className="bg-amber-600/10 border-amber-600 text-amber-700 dark:text-amber-500">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="flex-1 text-sm">
                  <p className="font-bold">⚠️ Venceu a manutenção de: {alert.itemName} ({alert.vehicleName})</p>
                  <p>
                    {alert.reason === 'km' ? (
                      <>
                        O item rodou <strong>{alert.kmSinceMaintenance} km</strong> desde a última troca/manutenção (Limite: <strong>{alert.limitKm} km</strong>). (KM Atual: {alert.currentKm} km / Última Troca: {alert.lastMaintenanceKm || 0} km).
                      </>
                    ) : (
                      <>
                        A última troca foi há <strong>{alert.monthsSince === Infinity ? 'muito tempo (nunca registrada)' : `${alert.monthsSince} meses`}</strong> (Limite: <strong>{alert.limitMonths} meses</strong>). Recomendamos realizar a troca/revisão em breve!
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução no Período</CardTitle>
          <CardDescription>Receitas vs Despesas dia a dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ 
            gross: { label: "Receita (R$)", color: "hsl(var(--primary))" },
            expenses: { label: "Despesas (R$)", color: "hsl(var(--destructive))" }
          }} className="w-full h-[250px] sm:h-[300px]">
            <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3"/>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `R$ ${v}`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="gross" stroke="var(--color-gross)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
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
