-- Drop existing problematic policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can view all providers" on public.providers;
drop policy if exists "Admins can update all providers" on public.providers;
drop policy if exists "Admins can delete providers" on public.providers;

-- Create a helper function to check if current user is admin
-- This function uses security definer to bypass RLS and prevent infinite recursion
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Recreate profiles admin policy using the helper function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Recreate providers admin policies using the helper function
create policy "Admins can view all providers"
  on public.providers for select
  using (public.is_admin());

create policy "Admins can update all providers"
  on public.providers for update
  using (public.is_admin());

create policy "Admins can delete providers"
  on public.providers for delete
  using (public.is_admin());
