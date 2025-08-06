// src/components/reports-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Calendar, DollarSign, TrendingUp, Filter, Fuel, Wrench } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Pie, PieChart, Label } from "recharts";
import { getAllEntries, getAllCosts, getAllRefuels, getAllMaintenances } from '@/lib/db';
import { DailyEntry, Cost, Refuel, Maintenance } from '@/types';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const chartConfig = {
  totalEarned: { label: "Ganhos (R$)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const pieChartConfig = {
  refuels: { label: 'Abastecimento', color: "hsl(var(--chart-2))" },
  maintenances: { label: 'Manutenção', color: "hsl(var(--chart-3))" },
  costs: { label: 'Outros Custos', color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function ReportsScreen() {
  const [date, setDate] = useState(new Date());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [stats, setStats] = useState({ gross: 0, net: 0, totalCosts: 0, days: 0, avg: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const allEntries = await getAllEntries();
      const monthEntries = allEntries.filter(e => e.date >= startStr && e.date <= endStr);
      setEntries(monthEntries);

      const allCosts = await getAllCosts();
      const monthCosts = allCosts.filter(c => c.date >= startStr && c.date <= endStr);
      setCosts(monthCosts);
      
      const allRefuels = await getAllRefuels();
      const monthRefuels = allRefuels.filter(r => r.date >= startStr && r.date <= endStr);
      setRefuels(monthRefuels);

      const allMaintenances = await getAllMaintenances();
      const monthMaintenances = allMaintenances.filter(m => m.date >= startStr && m.date <= endStr);
      setMaintenances(monthMaintenances);

      // Process bar chart data
      const daysInMonth = eachDayOfInterval({ start, end });
      const processedChartData = daysInMonth.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const entryForDay = monthEntries.find(e => e.date === dayStr && !e.isDayOff);
        return { date: format(day, 'dd'), totalEarned: entryForDay?.totalEarned || 0 };
      });
      setChartData(processedChartData);

      // Calculate stats
      const workingDays = monthEntries.filter(e => !e.isDayOff);
      const gross = workingDays.reduce((sum, e) => sum + (e.totalEarned || 0), 0);
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
  }, [date]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setDate(currentDate => subMonths(currentDate, direction === 'prev' ? 1 : -1));
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
              <BarChart2 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Relatório Mensal</CardTitle>
                <CardDescription>Análise detalhada do seu desempenho.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleMonthChange('prev')}>Anterior</Button>
              <DatePicker date={date} setDate={setDate} />
              <Button variant="outline" onClick={() => handleMonthChange('next')}>Próximo</Button>
            </div>
          </div>
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
                <CardHeader><CardTitle>Ganhos Diários - {format(date, 'MMMM yyyy', { locale: ptBR })}</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="w-full h-[300px]">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={10} width={80} tickFormatter={(value) => `R$ ${value}`} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(label) => `${label}/${format(date, 'MM')}`} formatter={(value) => `R$ ${Number(value).toFixed(2)}`}/>} />
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
                        <Label
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
                      <p>Nenhuma despesa registrada no mês.</p>
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
