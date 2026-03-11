"use client";
import { StopsReviewScreen } from '@/components/stops-review-screen';
import { useApp } from '@/components/providers/app-provider';

export default function AuditoriaPage() {
  const { updateConfirmedDeliveries } = useApp();
  return <StopsReviewScreen onConfirmDelivery={updateConfirmedDeliveries} />;
}
