-- Seed default red-line rules when a new user signs up.
-- Fires after a row is inserted into auth.users.

create or replace function public.seed_default_rules()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.rules (user_id, name, description, enabled, is_default, produces_gap)
  values
    (
      new.id,
      'IP Assignment (overbroad)',
      'Flags when the contract assigns ownership of pre-existing work, work outside the project scope, or derivative rights beyond what the project requires. If no IP clause exists, flags the gap — ownership may default to the client.',
      true, true, true
    ),
    (
      new.id,
      'Payment Terms (unfavorable)',
      'Flags net-60 or net-90 payment windows, milestone triggers controlled entirely by the client, and absence of late-payment penalties. If no payment timeline exists, flags the gap — there is no enforceable due date.',
      true, true, true
    ),
    (
      new.id,
      'Termination without guaranteed payment',
      'Flags contracts where the client can cancel with no kill fee, minimum commitment, or notice period. If no termination clause exists, flags the gap — neither party has a defined exit.',
      true, true, true
    ),
    (
      new.id,
      'Non-Compete',
      'Flags restrictions on who the freelancer can work for during or after the engagement. Severity depends on scope, duration, and breadth of restriction.',
      true, true, false
    ),
    (
      new.id,
      'Indemnification (overbroad)',
      'Flags clauses that make the freelancer liable for the client''s losses, especially losses the freelancer does not control.',
      true, true, false
    ),
    (
      new.id,
      'Forced Arbitration + Class Action Waiver',
      'Flags clauses that require arbitration instead of court and waive the right to join a class action.',
      true, true, false
    );

  return new;
end;
$$;

create trigger on_auth_user_created_seed_rules
  after insert on auth.users
  for each row execute function public.seed_default_rules();
