-- Inserir usuários de exemplo para cada perfil
-- Nota: Em produção, estes usuários devem ser criados via interface de administração
-- Estas são apenas credenciais de exemplo para desenvolvimento/teste

-- Inserir perfis de exemplo (os usuários devem ser criados via Auth do Supabase)
-- Simulando que os usuários já foram criados no Auth com estes IDs

INSERT INTO public.profiles (user_id, name, email, role, is_active) VALUES
-- Administrador
('11111111-1111-1111-1111-111111111111', 'Carlos Silva', 'admin@actionsys.com.br', 'administrador', true),

-- Gerente
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'gerente@actionsys.com.br', 'gerente', true),

-- Analista
('33333333-3333-3333-3333-333333333333', 'João Oliveira', 'analista@actionsys.com.br', 'analista', true),

-- Consultor
('44444444-4444-4444-4444-444444444444', 'Ana Costa', 'consultor@actionsys.com.br', 'consultor', true)

ON CONFLICT (user_id) DO NOTHING;