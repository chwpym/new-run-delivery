// src/components/goals-screen.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import { getGoal, saveGoal, getAllEntries } from '@/lib/db';
import type { Goal } from '@/types';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GoalsScreen() {
  const [date, setDate] = useState(new Date());
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalValue, setGoalValue] = useState('');
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  const goalId = format(date, 'yyyy-MM');

  const fetchData = async () => {
    const fetchedGoal = await getGoal(goalId);
    setGoal(fetchedGoal || { id: goalId, value: 0 });
    setGoalValue(String(fetchedGoal?.value || ''));

    const allEntries = await getAllEntries();
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    const monthly = allEntries
      .filter(e => e.date >= start && e.date <= end && !e.isDayOff)
      .reduce((sum, e) => sum + (e.totalEarned || 0), 0);
    setMonthlyEarnings(monthly);
  };

  useEffect(() => {
    fetchData();
  }, [date, goalId]);

  const handleSaveGoal = async () => {
    const value = parseFloat(goalValue);
    if (isNaN(value) || value < 0) return alert("Valor da meta inválido.");
    const newGoal: Goal = { id: goalId, value };
    await saveGoal(newGoal);
    setGoal(newGoal);
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
          <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
              <Target className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Metas Financeiras</CardTitle>
                <CardDescription>Defina e acompanhe suas metas de ganhos mensais.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleMonthChange('prev')}>Anterior</Button>
              <span className="font-bold w-32 text-center">{format(date, 'MMMM/yyyy', { locale: ptBR })}</span>
              <Button variant="outline" onClick={() => handleMonthChange('next')}>Próximo</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-grow space-y-2">
                <Label htmlFor="goalValue">Definir Meta de Ganhos para o Mês (R$)</Label>
                <Input
                  id="goalValue"
                  type="number"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  placeholder="Ex: 3000.00"
                />
              </div>
              <Button onClick={handleSaveGoal}>Salvar Meta</Button>
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
                {remaining > 0 ? (
                  <p className="text-lg">Faltam <span className="font-bold text-primary">R$ {remaining.toFixed(2)}</span> para atingir sua meta!</p>
                ) : (
                  <p className="text-lg font-bold text-green-500">🎉 Parabéns, você atingiu sua meta! 🎉</p>
                )}
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
