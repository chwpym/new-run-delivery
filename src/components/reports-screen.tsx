"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export function ReportsScreen() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Análise detalhada do seu desempenho.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Em breve: Gráficos e histórico detalhado aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}