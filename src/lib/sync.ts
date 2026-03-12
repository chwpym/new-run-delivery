// src/lib/sync.ts
import { supabase } from './supabase';
import { 
  getAllCompanies, getAllVehicles, getAllEntries, 
  getAllCosts, getAllRefuels, getAllMaintenances, getAllFixedPayments,
  saveCompany, saveVehicle, saveDailyEntry, saveCost, saveRefuel, saveMaintenance, saveFixedPayment
} from './db';

/**
 * Retorna o ID do usuário logado no Supabase.
 */
async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
}

/**
 * Executa o Push (Envio) de todos os dados do LocalDB (IndexedDB) para a Nuvem (Supabase).
 * Fazemos Upsert (Update ou Insert) usando as chaves únicas.
 */
export async function pushLocalToRemote() {
  const userId = await getUserId();
  if (!userId) return; // Não sincroniza se não estiver logado

  console.log('🔄 Iniciando Sincronização (Local -> Nuvem)...');

  try {
    // 1. Sincronizar Empresas (Companies)
    const localCompanies = await getAllCompanies();
    if (localCompanies.length > 0) {
      const { error } = await supabase.from('companies').upsert(
        localCompanies.map(c => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          base_location_lat: c.baseLocation?.latitude,
          base_location_lng: c.baseLocation?.longitude,
          payment_type: c.paymentType,
          daily_rate: c.dailyRate,
          delivery_fee: c.deliveryFee,
          fixed_value: c.fixedValue,
        }))
      );
      if (error) console.error('Erro no push de Companies:', error);
    }

    // 2. Sincronizar Veículos
    const localVehicles = await getAllVehicles();
    if (localVehicles.length > 0) {
      const { error } = await supabase.from('vehicles').upsert(
        localVehicles.map(v => ({
          id: v.id,
          user_id: userId,
          name: v.name,
          plate: v.plate,
          average_consumption: v.averageConsumption,
        }))
      );
      if (error) console.error('Erro no push de Vehicles:', error);
    }

    // 3. Sincronizar Entregas Diárias (Daily Entries)
    const localEntries = await getAllEntries();
    if (localEntries.length > 0) {
      const { error } = await supabase.from('daily_entries').upsert(
        localEntries.map(e => ({
          local_id: e.id,
          user_id: userId,
          date: e.date,
          is_day_off: e.isDayOff,
          company_id: e.companyId,
          vehicle_id: e.vehicleId,
          deliveries_count: e.deliveriesCount,
          daily_rate: e.dailyRate,
          delivery_fee: e.deliveryFee,
          total_from_deliveries: e.totalFromDeliveries,
          tips: e.tips,
          extra_fee: e.extraFee,
          total_earned: e.totalEarned,
          start_km: e.startKm,
          end_km: e.endKm,
          km_driven: e.kmDriven,
          last_km: e.lastKm,
        })), { onConflict: 'user_id, date' }
      );
      if (error) console.error('Erro no push de Daily Entries:', error);
    }

    // 4. Sincronizar Custos
    const localCosts = await getAllCosts();
    if (localCosts.length > 0) {
      const { error } = await supabase.from('costs').upsert(
        localCosts.map(c => ({
          id: c.id,
          user_id: userId,
          date: c.date,
          description: c.description,
          value: c.value,
          category: c.category,
        }))
      );
      if (error) console.error('Erro no push de Costs:', error);
    }

    // 5. Sincronizar Abastecimentos
    const localRefuels = await getAllRefuels();
    if (localRefuels.length > 0) {
      const { error } = await supabase.from('refuels').upsert(
        localRefuels.map(r => ({
          id: r.id,
          user_id: userId,
          date: r.date,
          vehicle_id: r.vehicleId,
          value: r.value,
          liters: r.liters,
          km: r.km,
        }))
      );
      if (error) console.error('Erro no push de Refuels:', error);
    }

    // 6. Sincronizar Manutenções
    const localMaintenances = await getAllMaintenances();
    if (localMaintenances.length > 0) {
      const { error } = await supabase.from('maintenances').upsert(
        localMaintenances.map(m => ({
          id: m.id,
          user_id: userId,
          date: m.date,
          vehicle_id: m.vehicleId,
          description: m.description,
          value: m.value,
          km: m.km,
        }))
      );
      if (error) console.error('Erro no push de Maintenances:', error);
    }

    // 7. Sincronizar Registros Fixos
    const localFixed = await getAllFixedPayments();
    if (localFixed.length > 0) {
      const { error } = await supabase.from('fixed_payments').upsert(
        localFixed.map(f => ({
          id: f.id,
          user_id: userId,
          date: f.date,
          company_id: f.companyId,
          value: f.value,
          discounts: f.discounts,
          description: f.description,
        }))
      );
      if (error) console.error('Erro no push de Fixed Payments:', error);
    }

    console.log('✅ Sincronização Finalizada com Sucesso!');
  } catch (error) {
    console.error('❌ Erro Fatal na Sincronização Local -> Nuvem:', error);
  }
}
