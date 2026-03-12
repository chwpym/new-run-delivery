// src/components/login-screen.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUploading, setIsSignUploading] = useState(false);
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async () => {
    setErrorMsg('');
    setIsSignUploading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Automatic login happens on success if email confirmation is disabled
       if (data.session) {
         onLoginSuccess();
       } else {
         setErrorMsg("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
       }
    }
    setIsSignUploading(false);
  };

  const handleSignIn = async () => {
    setErrorMsg('');
    setIsSignInLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("E-mail ou senha incorretos.");
    } else {
      onLoginSuccess();
    }
    setIsSignInLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <Card className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary font-bold">RunDelivery Nuvem</CardTitle>
          <CardDescription>
            Para garantir a segurança dos seus ganhos e o backup offline-first, precisamos de uma conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Mínimo de 6 caracteres" 
            />
          </div>
          
          {errorMsg && (
            <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium">
              {errorMsg}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full" 
            onClick={handleSignIn} 
            disabled={isSignInLoading || isSignUploading || !email || password.length < 6}
          >
            {isSignInLoading ? "Entrando..." : "Entrar"}
          </Button>
          <Button 
            variant="outline"
            className="w-full" 
            onClick={handleSignUp} 
            disabled={isSignInLoading || isSignUploading || !email || password.length < 6}
          >
            {isSignUploading ? "Criando conta..." : "Criar nova conta"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
