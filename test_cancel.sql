DO $$
DECLARE
  v_reg_id uuid;
BEGIN
  -- simulate being the user
  PERFORM set_config('request.jwt.claims', '{"sub": "6ce83160-316d-4929-8a14-661a1e496111"}', true);
  
  PERFORM cancel_registration('02ae156c-507d-4a20-9696-8e58e20583b0');
END;
$$;
