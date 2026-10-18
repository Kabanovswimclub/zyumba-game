-- Prepared for the separate Supabase project «Игры». NOT applied yet.
-- No Swim Up tables, accounts or connections are referenced.
begin;
create table public.zyumba_children (
 id uuid primary key,
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 30),
 age integer not null check (age between 2 and 7),
 hand text not null check (hand in ('right','left','both')),
 created_at timestamptz not null default now(),
 unique(id,owner_id)
);
create table public.zyumba_game_state (
 child_id uuid primary key,
 owner_id uuid not null default auth.uid(),
 state jsonb not null default '{}'::jsonb,
 revision bigint not null default 0,
 updated_at timestamptz not null default now(),
 foreign key(child_id,owner_id) references public.zyumba_children(id,owner_id) on delete cascade
);
create table public.zyumba_photos (
 id uuid primary key,
 child_id uuid not null,
 owner_id uuid not null default auth.uid(),
 storage_path text not null unique,
 effect text not null check (effect in ('original','soft','cartoon')),
 created_at timestamptz not null default now(),
 foreign key(child_id,owner_id) references public.zyumba_children(id,owner_id) on delete cascade,
 check(split_part(storage_path,'/',1)=owner_id::text),
 check(split_part(storage_path,'/',2)=child_id::text)
);
alter table public.zyumba_children enable row level security;
alter table public.zyumba_game_state enable row level security;
alter table public.zyumba_photos enable row level security;
revoke all on public.zyumba_children,public.zyumba_game_state,public.zyumba_photos from anon;
grant select,insert,update on public.zyumba_children,public.zyumba_game_state,public.zyumba_photos to authenticated;
create policy zyumba_children_owner on public.zyumba_children for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy zyumba_game_state_owner on public.zyumba_game_state for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy zyumba_photos_owner on public.zyumba_photos for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create index on public.zyumba_children(owner_id);
create index on public.zyumba_game_state(owner_id);
create index on public.zyumba_photos(owner_id,child_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('zyumba-family-photos','zyumba-family-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy zyumba_photo_read on storage.objects for select to authenticated using(bucket_id='zyumba-family-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy zyumba_photo_insert on storage.objects for insert to authenticated with check(bucket_id='zyumba-family-photos' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.zyumba_children c where c.id::text=(storage.foldername(name))[2] and c.owner_id=(select auth.uid())));
commit;
