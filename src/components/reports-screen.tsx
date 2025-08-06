// src/components/reports-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Calendar, DollarSign, Droplet, TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { getAllEntries } from '@/lib/db';
import type { DailyEntry } from '@/types/dailyEntry';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const chartConfig = {
  totalEarned: {
    label: "Ganhos (R$)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ReportsScreen() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ total: 0, days: 0, avg: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const allEntries = await getAllEntries();
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const monthEntries = allEntries.filter(e => {
        const entryDate = parseISO(e.date);
        return entryDate >= start && entryDate <= end;
      });
      setEntries(monthEntries);

      // Process data for the chart
      const daysInMonth = eachDayOfInterval({ start, end });
      const processedChartData = daysInMonth.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const entryForDay = monthEntries.find(e => e.date === dayStr && !e.isDayOff);
        return {
          date: format(day, 'dd'), // Apenas o dia para o eixo X
          totalEarned: entryForDay?.totalEarned || 0,
        };
      });
      setChartData(processedChartData);

      // Calculate stats
      const workingDays = monthEntries.filter(e => !e.isDayOff);
      const total = workingDays.reduce((sum, e) => sum + (e.totalEarned || 0), 0);
      const days = workingDays.length;
      setMonthlyStats({
        total,
        days,
        avg: days > 0 ? total / days : 0,
      });
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Análise detalhada do seu desempenho no mês atual.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
            <Card className="p-4">
              <CardHeader className="p-2">
                <DollarSign className="h-6 w-6 mx-auto text-primary" />
                <CardTitle className="text-lg">Faturamento Total</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-2xl font-bold">R$ {monthlyStats.total.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader className="p-2">
                <Calendar className="h-6 w-6 mx-auto text-primary" />
                <CardTitle className="text-lg">Dias Trabalhados</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-2xl font-bold">{monthlyStats.days}</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader className="p-2">
                <TrendingUp className="h-6 w-6 mx-auto text-primary" />
                <CardTitle className="text-lg">Média Diária</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <p className="text-2xl font-bold">R$ {monthlyStats.avg.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ganhos Diários - {format(new Date(), 'MMMM', { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full h-[250px]">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} width={80} tickFormatter={(value) => `R$ ${value}`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                      labelFormatter={(label, payload) => `Dia ${label}`}
                      formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                    />}
                  />
                  <Bar dataKey="totalEarned" fill="var(--color-totalEarned)" radius={4}>
                    <LabelList
                      position="top"
                      offset={8}
                      className="fill-foreground text-xs"
                      formatter={(value: number) => (value > 0 ? `R$ ${value.toFixed(0)}` : '')}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
