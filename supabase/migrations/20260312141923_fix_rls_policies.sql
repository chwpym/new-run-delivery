-- Drop existing monolithic FOR ALL policies
DROP POLICY IF EXISTS "Users can manage their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can manage their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can manage their own daily_entries" ON public.daily_entries;
DROP POLICY IF EXISTS "Users can manage their own fixed_payments" ON public.fixed_payments;
DROP POLICY IF EXISTS "Users can manage their own costs" ON public.costs;
DROP POLICY IF EXISTS "Users can manage their own refuels" ON public.refuels;
DROP POLICY IF EXISTS "Users can manage their own maintenances" ON public.maintenances;
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can manage their own stops" ON public.stops;

-- 1. Companies
CREATE POLICY "Enable SELECT for users based on user_id" ON public.companies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.companies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Vehicles
CREATE POLICY "Enable SELECT for users based on user_id" ON public.vehicles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.vehicles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.vehicles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Daily Entries
CREATE POLICY "Enable SELECT for users based on user_id" ON public.daily_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.daily_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.daily_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.daily_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Fixed Payments
CREATE POLICY "Enable SELECT for users based on user_id" ON public.fixed_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.fixed_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.fixed_payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.fixed_payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Costs
CREATE POLICY "Enable SELECT for users based on user_id" ON public.costs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.costs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.costs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.costs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Refuels
CREATE POLICY "Enable SELECT for users based on user_id" ON public.refuels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.refuels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.refuels FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.refuels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Maintenances
CREATE POLICY "Enable SELECT for users based on user_id" ON public.maintenances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.maintenances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.maintenances FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.maintenances FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. Goals
CREATE POLICY "Enable SELECT for users based on user_id" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9. Stops
CREATE POLICY "Enable SELECT for users based on user_id" ON public.stops FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Enable INSERT for users based on user_id" ON public.stops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable UPDATE for users based on user_id" ON public.stops FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable DELETE for users based on user_id" ON public.stops FOR DELETE TO authenticated USING (auth.uid() = user_id);
