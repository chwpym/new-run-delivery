// src/components/onboarding-screen.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Building2, Package, CheckCircle2 } from "lucide-react";
import { useApp } from '@/components/providers/app-provider';
import { saveCompany, saveVehicle } from '@/lib/db';

export function OnboardingScreen() {
  const { refreshCompanies, refreshVehicles, setActiveCompanyId } = useApp();
  const [step, setStep] = useState(1); // 1: Welcome, 2: Company, 3: Vehicle, 4: Done

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [paymentType, setPaymentType] = useState<'daily' | 'fixed'>('daily');
  const [dailyRate, setDailyRate] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [fixedValue, setFixedValue] = useState('');

  const [vehicleName, setVehicleName] = useState('');
  const [plate, setPlate] = useState('');
  const [consumption, setConsumption] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 2) {
      // Validate company
      if (!companyName.trim()) return alert("Insira o nome da empresa.");
      if (paymentType === 'daily' && !deliveryFee) return alert("Insira o valor por entrega.");
      setStep(3);
    } else if (step === 3) {
      // Validate vehicle and submit all
      if (!vehicleName.trim() || !consumption) return alert("Insira o nome e o consumo do veículo.");
      
      setIsSubmitting(true);
      try {
        const companyId = crypto.randomUUID();
        // Save Company
        await saveCompany({
          id: companyId,
          name: companyName,
          paymentType,
          dailyRate: parseFloat(dailyRate) || undefined,
          deliveryFee: parseFloat(deliveryFee) || 0,
          fixedValue: parseFloat(fixedValue) || undefined,
        });

        // Save Vehicle
        await saveVehicle({
          id: crypto.randomUUID(),
          name: vehicleName,
          plate: plate || undefined,
          averageConsumption: parseFloat(consumption),
        });

        // Refresh app state
        await refreshCompanies();
        await refreshVehicles();
        setActiveCompanyId(companyId); // set as active
        
        setStep(4);
      } catch (e) {
        console.error("Error creating onboarding data:", e);
        alert("Ocorreu um erro ao salvar o cadastro.");
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      // Done - it should unmount automatically based on layout logic if companies & vehicles exist
      // The Layout will detect lengths > 0 and render Dashboard
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <Card className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="text-center">
          {step === 1 && (
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
          )}
          {step === 2 && (
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          {step === 3 && (
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          )}
           {step === 4 && (
             <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="h-8 w-8 text-green-500" />
             </div>
           )}

          <CardTitle className="text-2xl">
            {step === 1 && "Bem-vindo ao RunDelivery"}
            {step === 2 && "Cadastre sua Empresa"}
            {step === 3 && "Cadastre seu Veículo"}
            {step === 4 && "Tudo pronto!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Para começarmos a contabilizar seus ganhos, precisamos configurar algumas informações básicas. Leva menos de um minuto!"}
            {step === 2 && "Para quem você vai fazer entregas? Fique tranquilo, você pode adicionar outras empresas depois."}
            {step === 3 && "Qual veículo você usará para as entregas? Isso ajudará a calcular seus curtos de combustível."}
            {step === 4 && "Seu aplicativo está configurado e pronto para uso."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: iFood, Loggi, Sedex..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Tipo de Pagamento</Label>
                <Select value={paymentType} onValueChange={(val: any) => setPaymentType(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária + Por Entrega</SelectItem>
                    <SelectItem value="fixed">Fixo (Previsto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === 'daily' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Diária Base (R$)</Label>
                    <Input id="dailyRate" type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} placeholder="Ex: 50.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Valor / Entrega (R$)</Label>
                    <Input id="deliveryFee" type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} placeholder="Ex: 5.00" />
                  </div>
                </div>
              )}
              {paymentType === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="fixedValue">Valor Fixo Previsto (R$)</Label>
                  <Input id="fixedValue" type="number" value={fixedValue} onChange={e => setFixedValue(e.target.value)} placeholder="Ex: 2500.00" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleName">Veículo</Label>
                  <Input id="vehicleName" value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="Ex: Honda CG 160" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa (Opcional)</Label>
                  <Input id="plate" value={plate} onChange={e => setPlate(e.target.value)} placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumption">Média de Consumo (km/Litro)</Label>
                  <Input id="consumption" type="number" value={consumption} onChange={e => setConsumption(e.target.value)} placeholder="Ex: 35" />
                  <p className="text-xs text-muted-foreground">Usado para estimar os gastos com combustível</p>
                </div>
             </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 1 && <Button className="w-full" onClick={() => setStep(2)}>Começar Configuração</Button>}
          {step === 2 && (
             <>
               <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
               <Button onClick={handleNext}>Próximo</Button>
             </>
          )}
          {step === 3 && (
             <>
               <Button variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>Voltar</Button>
               <Button onClick={handleNext} disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Finalizar Configuração"}
               </Button>
             </>
          )}
          {step === 4 && (
             <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleNext}>
                Acessar o App
             </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
