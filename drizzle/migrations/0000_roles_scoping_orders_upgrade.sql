GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id uuid;

CREATE POLICY "Orders own cancel" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending','confirmed'))
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
CREATE POLICY "Tracking owner insert" ON public.order_tracking FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Driver view assigned orders" ON public.orders FOR SELECT TO authenticated
  USING (driver_id = auth.uid() AND public.has_role(auth.uid(),'driver'));
CREATE POLICY "Driver update assigned orders" ON public.orders FOR UPDATE TO authenticated
  USING (driver_id = auth.uid() AND public.has_role(auth.uid(),'driver'))
  WITH CHECK (driver_id = auth.uid() AND status IN ('shipped','out_for_delivery','delivered'));
CREATE POLICY "Driver view tracking" ON public.order_tracking FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.driver_id = auth.uid()));
CREATE POLICY "Driver add tracking" ON public.order_tracking FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.driver_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.owns_company(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = _company AND owner_id = auth.uid())
$$;
GRANT EXECUTE ON FUNCTION public.owns_company(uuid) TO authenticated;
CREATE POLICY "Supplier manage own products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'supplier') AND public.owns_company(company_id))
  WITH CHECK (public.has_role(auth.uid(),'supplier') AND public.owns_company(company_id));
CREATE POLICY "Supplier update own company" ON public.companies FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Supplier view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.owns_company(p.company_id)));

CREATE OR REPLACE FUNCTION public.decrement_stock(_product_id uuid, _qty int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET stock_quantity = GREATEST(COALESCE(stock_quantity,0) - _qty, 0),
    in_stock = (COALESCE(stock_quantity,0) - _qty) > 0
  WHERE id = _product_id AND _qty > 0;
$$;
CREATE OR REPLACE FUNCTION public.consume_discount_code(_code text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.discount_codes SET used_count = used_count + 1 WHERE upper(code) = upper(_code);
$$;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid,int) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.consume_discount_code(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid,int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_discount_code(text) TO authenticated;