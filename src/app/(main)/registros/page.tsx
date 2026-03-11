"use client";
import { DailyEntriesScreen } from '@/components/daily-entries-screen';
import { useApp } from '@/components/providers/app-provider';

export default function RegistrosPage() {
  const { count } = useApp();
  return <DailyEntriesScreen deliveryCount={count} />;
}
