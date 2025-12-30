# Guia de Desenvolvimento - MarcAI Agenda

Este documento contém informações essenciais para desenvolvedores trabalhando no projeto MarcAI Agenda.

## 🔐 Acesso Desenvolvedor (Admin)

O sistema possui uma conta de "super-usuário" configurada hardcoded para desenvolvimento e administração.

- **E-mail:** `wennsouza@gmail.com`
- **Acesso:** Painel Administrativo (`ADMIN_DASHBOARD`)
- **Privilégios:**
  - Login prioritário (bypassa verificação de assinatura/profissional)
  - Acesso a estatísticas globais da plataforma
  - Cadastro de novos profissionais sem restrições
  - Visualização de todos os profissionais cadastrados

### Como acessar
1. Vá para a tela de Login
2. Insira o e-mail: `wennsouza@gmail.com`
3. Use a senha configurada no Supabase (ou Magic Link se configurado)
4. O sistema redirecionará automaticamente para o Painel Administrativo

## 🛠️ Comandos Úteis

### Rodar o projeto
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

## 📂 Estrutura de Pastas Principais

- `/views`: Contém as telas principais (BookingView, AdminDashboardView, ProDashboardView, etc.)
- `/components`: Componentes reutilizáveis
- `/services`: Integrações com APIs (Supabase)

## 🐛 Debugging Comum

### Problemas de Data/Fuso Horário
O sistema foi ajustado para lidar com datas locais no fuso horário do Brasil.
- **Sempre utilize** as funções helpers de data (ex: `formatLocalDate`) ao invés de `toISOString()` para datas de agendamento.
- **Evite** `new Date('YYYY-MM-DD')` pois gera UTC midnight. Prefira parsing manual: `new Date(year, month-1, day)`.
