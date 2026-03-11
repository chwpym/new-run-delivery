"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction, DollarSign, Fuel, Wrench, Target, Icon } from "lucide-react";
import { ElementType } from 'react';

// Mapeia o nome do ícone (string) para o componente real do Lucide
const icons: { [key: string]: ElementType } = {
  Construction,
  DollarSign,
  Fuel,
  Wrench,
  Target,
};

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon?: string;
}

export function PlaceholderScreen({ title, description, icon = "Construction" }: PlaceholderScreenProps) {
  const IconComponent = icons[icon] || Construction;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <IconComponent className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center gap-4 text-muted-foreground">
          <Construction className="h-16 w-16" />
          <p>Esta funcionalidade está em construção.</p>
          <p className="text-sm">Em breve você poderá gerenciar seus {title.toLowerCase()} aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
