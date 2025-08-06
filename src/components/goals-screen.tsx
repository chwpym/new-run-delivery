// src/components/goals-screen.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { getGoal, saveGoal, getAllEntries, getAllCompanies } from '@/lib/db';
import type { Goal, Company } from '@/types';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function GoalsScreen() {
  const [date, setDate] = useState(new Date());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalValue, setGoalValue] = useState('');
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  const goalId = selectedCompanyId === 'all'
    ? format(date, 'yyyy-MM')
    : `${format(date, 'yyyy-MM')}-${selectedCompanyId}`;

  const fetchData = useCallback(async () => {
    // Busca empresas sempre
    const companiesData = await getAllCompanies();
    setCompanies(companiesData);
    
    // Busca a meta correta (geral ou específica)
    const fetchedGoal = await getGoal(goalId);
    setGoal(fetchedGoal || { id: goalId, value: 0 });
    setGoalValue(String(fetchedGoal?.value || ''));

    // Busca os ganhos (filtrados ou não)
    const allEntries = await getAllEntries();
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');

    const monthlyEntries = allEntries.filter(e => {
        const isWithinDate = e.date >= start && e.date <= end && !e.isDayOff;
        if (!isWithinDate) return false;
        if (selectedCompanyId === 'all') return true; // Inclui todos se a meta for geral
        return e.companyId === selectedCompanyId; // Filtra pela empresa
    });

    const totalEarnings = monthlyEntries.reduce((sum, e) => sum + (e.totalEarned || 0), 0);
    setMonthlyEarnings(totalEarnings);
  }, [date, goalId, selectedCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveGoal = async () => {
    const value = parseFloat(goalValue);
    if (isNaN(value) || value < 0) return alert("Valor da meta inválido.");
    
    const newGoal: Goal = {
        id: goalId,
        value,
        companyId: selectedCompanyId !== 'all' ? selectedCompanyId : undefined
    };

    await saveGoal(newGoal);
    setGoal(newGoal); // Atualiza o estado local com a nova meta
    alert("Meta salva com sucesso!");
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  };
  
  const progress = goal && goal.value > 0 ? (monthlyEarnings / goal.value) * 100 : 0;
  const remaining = goal ? goal.value - monthlyEarnings : 0;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='flex items-center gap-3 self-start'>
              <Target className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Metas Financeiras</CardTitle>
                <CardDescription>Defina e acompanhe suas metas de ganhos mensais.</CardDescription>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <span className="font-bold w-full md:w-32 text-center text-lg capitalize">{format(date, 'MMMM/yyyy', { locale: ptBR })}</span>
              <div className="flex items-center gap-2 w-full">
                <Button variant="outline" onClick={() => handleMonthChange('prev')} className="flex-1">Anterior</Button>
                <Button variant="outline" onClick={() => handleMonthChange('next')} className="flex-1">Próximo</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-grow space-y-2 w-full">
                <Label htmlFor="goalValue">
                  Definir Meta para {selectedCompanyId === 'all' ? 'Todas as Empresas' : companies.find(c => c.id === selectedCompanyId)?.name} (R$)
                </Label>
                <div className='flex flex-col md:flex-row gap-2'>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                        <SelectTrigger className="w-full md:w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Todas as Empresas</SelectItem>
                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input
                        id="goalValue"
                        type="number"
                        value={goalValue}
                        onChange={(e) => setGoalValue(e.target.value)}
                        placeholder="Ex: 3000.00"
                        className="flex-1"
                    />
                </div>
              </div>
              <Button onClick={handleSaveGoal} className="w-full sm:w-auto">Salvar Meta</Button>
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <CardTitle className="mb-4">Progresso do Mês</CardTitle>
            <div className="space-y-4">
              <Progress value={progress} className="h-4" />
              <div className="flex justify-between text-sm font-medium">
                <span>R$ {monthlyEarnings.toFixed(2)}</span>
                <span>Meta: R$ {(goal?.value || 0).toFixed(2)}</span>
              </div>
              <div className="mt-4">
                {goal?.value && goal.value > 0 ? (
                  remaining > 0 ? (
                    <p className="text-lg">Faltam <span className="font-bold text-primary">R$ {remaining.toFixed(2)}</span> para atingir sua meta!</p>
                  ) : (
                    <p className="text-lg font-bold text-green-500">🎉 Parabéns, você atingiu sua meta! 🎉</p>
                  )
                ) : (
                  <p className="text-muted-foreground">Defina uma meta para começar a acompanhar.</p>
                )}
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
