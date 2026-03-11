"use client";
import { DashboardScreen } from '@/components/dashboard-screen';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  return <DashboardScreen onNavigate={(screen: string) => router.push(`/${screen}`)} />;
}
