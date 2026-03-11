// src/components/reports-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, DollarSign, TrendingUp, Filter, Fuel, Wrench } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Pie, PieChart, Label as RechartsLabel } from "recharts";
import { getAllEntries, getAllCosts, getAllRefuels, getAllMaintenances, getAllCompanies, getAllVehicles, getAllFixedPayments } from '@/lib/db';
import type { DailyEntry, Cost, Refuel, Maintenance, Company, Vehicle, FixedPayment } from '@/types';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

const chartConfig = {
  totalEarned: { label: "Ganhos (R$)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const pieChartConfig = {
  refuels: { label: 'Abastecimento', color: "hsl(var(--chart-2))" },
  maintenances: { label: 'Manutenção', color: "hsl(var(--chart-3))" },
  costs: { label: 'Outros Custos', color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function ReportsScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [filters, setFilters] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    companyId: string;
    vehicleId: string;
  }>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    companyId: 'all',
    vehicleId: 'all',
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [stats, setStats] = useState({ gross: 0, net: 0, totalCosts: 0, days: 0, avg: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { startDate, endDate, companyId, vehicleId } = filters;
      if (!startDate || !endDate) return;
      
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      // Fetch all data once
      const [
        allEntries, 
        allCosts, 
        allRefuels, 
        allMaintenances, 
        allCompanies, 
        allVehicles,
        allFixedPayments,
      ] = await Promise.all([
        getAllEntries(),
        getAllCosts(),
        getAllRefuels(),
        getAllMaintenances(),
        getAllCompanies(),
        getAllVehicles(),
        getAllFixedPayments(),
      ]);

      setCompanies(allCompanies);
      setVehicles(allVehicles);

      // Apply filters
      const monthEntries = allEntries.filter(e => {
        const isWithinDate = e.date >= startStr && e.date <= endStr;
        const companyMatch = companyId === 'all' || e.companyId === companyId;
        const vehicleMatch = vehicleId === 'all' || e.vehicleId === vehicleId;
        return isWithinDate && companyMatch && vehicleMatch;
      });

      const monthFixedPayments = allFixedPayments.filter(p => {
        const isWithinDate = p.date >= startStr && p.date <= endStr;
        const companyMatch = companyId === 'all' || p.companyId === companyId;
        return isWithinDate && companyMatch;
      });
      
      const vehicleFilteredIds = vehicleId === 'all' 
        ? allVehicles.map(v => v.id) 
        : [vehicleId];

      const monthCosts = allCosts.filter(c => c.date >= startStr && c.date <= endStr); // Costs are not tied to vehicle/company
      const monthRefuels = allRefuels.filter(r => r.date >= startStr && r.date <= endStr && vehicleFilteredIds.includes(r.vehicleId));
      const monthMaintenances = allMaintenances.filter(m => m.date >= startStr && m.date <= endStr && vehicleFilteredIds.includes(m.vehicleId));

      // Process bar chart data
      const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });
      const processedChartData = daysInInterval.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const entryForDay = monthEntries.find(e => e.date === dayStr && !e.isDayOff);
        return { date: format(day, 'dd/MM'), totalEarned: entryForDay?.totalEarned || 0 };
      });
      setChartData(processedChartData);

      // Calculate stats
      const workingDays = monthEntries.filter(e => !e.isDayOff);
      const dailyGross = workingDays.reduce((sum, e) => sum + (e.totalEarned || 0), 0);
      const fixedGross = monthFixedPayments.reduce((sum, p) => sum + p.value, 0);
      const gross = dailyGross + fixedGross;

      const costValue = monthCosts.reduce((sum, c) => sum + c.value, 0);
      const refuelValue = monthRefuels.reduce((sum, r) => sum + r.value, 0);
      const maintenanceValue = monthMaintenances.reduce((sum, m) => sum + m.value, 0);
      const totalCosts = costValue + refuelValue + maintenanceValue;
      const net = gross - totalCosts;
      const days = workingDays.length;
      setStats({ gross, net, totalCosts, days, avg: days > 0 ? net / days : 0 });

      // Process pie chart data
      setPieData([
        { name: 'Abastecimento', value: refuelValue, fill: 'var(--color-refuels)' },
        { name: 'Manutenção', value: maintenanceValue, fill: 'var(--color-maintenances)' },
        { name: 'Outros Custos', value: costValue, fill: 'var(--color-costs)' },
      ].filter(item => item.value > 0));
    };
    fetchData();
  }, [filters]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setFilters(currentFilters => {
      const currentMonth = currentFilters.startDate || new Date();
      const newMonth = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
      return {
        ...currentFilters,
        startDate: startOfMonth(newMonth),
        endDate: endOfMonth(newMonth),
      };
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className='flex items-center gap-3 self-start'>
                <BarChart2 className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle>Relatório Detalhado</CardTitle>
                    <CardDescription>Análise detalhada do seu desempenho.</CardDescription>
                </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" onClick={() => handleMonthChange('prev')} className="flex-1">Anterior</Button>
                    <Button variant="outline" onClick={() => handleMonthChange('next')} className="flex-1">Próximo</Button>
                </div>
            </div>
            
            <Card className="p-4 mt-4 bg-card/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data Inicial</Label>
                  <DatePicker date={filters.startDate} setDate={(d) => setFilters(prev => ({...prev, startDate: d}))} />
                </div>
                 <div>
                  <Label>Data Final</Label>
                  <DatePicker date={filters.endDate} setDate={(d) => setFilters(prev => ({...prev, endDate: d}))} />
                </div>
                <div>
                    <Label>Empresa</Label>
                    <Select value={filters.companyId} onValueChange={(id) => setFilters(prev => ({...prev, companyId: id}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Empresas</SelectItem>
                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Veículo</Label>
                    <Select value={filters.vehicleId} onValueChange={(id) => setFilters(prev => ({...prev, vehicleId: id}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Veículos</SelectItem>
                        {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
              </div>
            </Card>

        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-center">
            <Card className="p-4"><CardHeader className="p-2"><DollarSign className="h-6 w-6 mx-auto text-primary" /><CardTitle className="text-lg">Receita Bruta</CardTitle></CardHeader><CardContent className="p-2"><p className="text-2xl font-bold">R$ {stats.gross.toFixed(2)}</p></CardContent></Card>
            <Card className="p-4 bg-destructive/10 border-destructive"><CardHeader className="p-2"><DollarSign className="h-6 w-6 mx-auto text-destructive" /><CardTitle className="text-lg">Despesas Totais</CardTitle></CardHeader><CardContent className="p-2"><p className="text-2xl font-bold">R$ {stats.totalCosts.toFixed(2)}</p></CardContent></Card>
            <Card className="p-4 bg-primary/10 border-primary"><CardHeader className="p-2"><DollarSign className="h-6 w-6 mx-auto text-primary" /><CardTitle className="text-lg">Receita Líquida</CardTitle></CardHeader><CardContent className="p-2"><p className="text-2xl font-bold">R$ {stats.net.toFixed(2)}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Ganhos Diários</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="w-full h-[300px]">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={10} width={80} tickFormatter={(value) => `R$ ${value}`} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(label, payload) => `${payload?.[0]?.payload.date}`} formatter={(value) => `R$ ${Number(value).toFixed(2)}`}/>} />
                      <Bar dataKey="totalEarned" fill="var(--color-totalEarned)" radius={4}>
                        <LabelList position="top" offset={8} className="fill-foreground text-xs" formatter={(value: number) => (value > 0 ? `${value.toFixed(0)}` : '')} />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><CardTitle>Composição das Despesas</CardTitle></CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ChartContainer config={pieChartConfig} className="w-full h-[300px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                        <RechartsLabel
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" >
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold" >
                                    {stats.totalCosts.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground" >
                                    Total
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <p>Nenhuma despesa registrada no período.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
