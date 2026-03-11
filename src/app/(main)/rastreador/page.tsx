"use client";
import { LiveTrackerScreen } from '@/components/live-tracker-screen';
import { useApp } from '@/components/providers/app-provider';

export default function RastreadorPage() {
  const { count, setCount, settings, companies, vehicles, activeCompanyId, setActiveCompanyId } = useApp();
  return <LiveTrackerScreen count={count} setCount={setCount} settings={settings} companies={companies} vehicles={vehicles} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />;
}
