// src/components/ui/date-range-filter.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, X } from "lucide-react";
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangeFilter({ onFilterChange, className }: DateRangeFilterProps) {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = format(new Date(year, m - 1, 1), 'yyyy-MM-dd');
      const end = format(endOfMonth(new Date(year, m - 1, 1)), 'yyyy-MM-dd');
      onFilterChange(start, end);
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      onFilterChange(start, end);
    }
  };

  const handleClearFilter = () => {
    setSelectedMonth(currentMonth);
    setFilterType('month');
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    setStartDate(start);
    setEndDate(end);
    onFilterChange(start, end);
  };

  return (
    <div className={`flex flex-col gap-3 p-3 rounded-lg border bg-card ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>Filtrar por:</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant={filterType === 'month' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setFilterType('month');
              handleMonthChange(selectedMonth);
            }}
          >
            Mês
          </Button>
          <Button
            variant={filterType === 'range' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setFilterType('range');
              if (startDate && endDate) onFilterChange(startDate, endDate);
            }}
          >
            Período
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleClearFilter}
            aria-label="Limpar filtro"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filterType === 'month' ? (
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="h-10"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleRangeChange(e.target.value, endDate)}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleRangeChange(startDate, e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
