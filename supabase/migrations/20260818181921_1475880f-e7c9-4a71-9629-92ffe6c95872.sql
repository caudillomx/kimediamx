update public.client_portal_dependencias d
set active = false
where d.client_id = '651190b4-7787-4814-af9a-b5aff22d9297'
  and d.active
  and not exists (
    select 1 from public.client_portal_benchmark_competitors c
    where c.dependencia_id = d.id and c.active
  );