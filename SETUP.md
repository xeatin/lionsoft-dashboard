# 🚀 Guia de Setup — Lionsoft Dashboard com ClickUp

## O que foi adicionado
- `api/clickup.js` — proxy seguro que esconde seu token da ClickUp
- `src/App.jsx` atualizado — busca dados reais do ClickUp automaticamente
- `.env.example` — template das variáveis de ambiente
- Indicador "ClickUp conectado / Dados demo" na sidebar
- Progresso calculado automaticamente com base nas tarefas reais
- Botão "Atualizar agora" para recarregar sem precisar reabrir a página

---

## PASSO 1 — Criar o espaço no ClickUp

1. Acesse https://app.clickup.com e crie uma conta (grátis)
2. Crie um **Workspace** chamado "Lionsoft Demo"
3. Crie um **Space** chamado com o nome do cliente (ex: "Fintech XYZ")
4. Dentro do Space, crie 4 **Listas**:
   - `Sprint 10`
   - `Sprint 11`
   - `Sprint 12`
   - `Sprint 13`

### Statuses recomendados (configure em cada lista)
O ClickUp permite customizar. Use estes nomes exatos para o mapeamento funcionar:
- `complete` → aparece como Concluída ✅
- `in progress` → aparece como Em Progresso 🟡
- `review` → aparece como Em Review 👁
- `to do` → aparece como Pendente ⚪

### Adicione tarefas nas listas
- Sprint 10 e 11: coloque todas como `complete`
- Sprint 12: mix de status (isso vai calcular o % automaticamente)
- Sprint 13: todas como `to do`

---

## PASSO 2 — Pegar os IDs das listas

1. Abra cada lista no ClickUp
2. Olhe a URL: `https://app.clickup.com/WORKSPACE/v/li/XXXXXXXXX`
3. O número no final é o **List ID**
4. Anote os 4 IDs (um por sprint)

---

## PASSO 3 — Pegar o token da ClickUp API

1. No ClickUp, clique no seu avatar (canto inferior esquerdo)
2. Vá em **Settings** → **Apps**
3. Em **API Token**, clique em **Generate** ou copie o token existente
4. O token começa com `pk_`
5. **Guarde este token com segurança — ele é como uma senha**

---

## PASSO 4 — Subir o projeto no GitHub

1. Abra a pasta do projeto no terminal (ou VS Code)
2. Execute:
```bash
git init
git add .
git commit -m "feat: integração ClickUp"
git remote add origin https://github.com/SEU_USUARIO/lionsoft-dashboard.git
git push -u origin main
```

> Se já tem repo criado, só commite e faça o push.

---

## PASSO 5 — Configurar variáveis no Vercel

1. Acesse https://vercel.com → seu projeto → **Settings** → **Environment Variables**
2. Adicione uma por uma:

| Nome | Valor | Tipo |
|------|-------|------|
| `CLICKUP_API_TOKEN` | `pk_xxxxx` | **Secret** |
| `VITE_PROJECT_NAME` | `Fintech XYZ` | Plain text |
| `VITE_PROJECT_TYPE` | `Plataforma de Pagamentos` | Plain text |
| `VITE_PROJECT_INITIALS` | `FX` | Plain text |
| `VITE_ACTIVE_SPRINT` | `Sprint 12` | Plain text |
| `VITE_SPRINT10_LIST_ID` | `ID da lista` | Plain text |
| `VITE_SPRINT11_LIST_ID` | `ID da lista` | Plain text |
| `VITE_SPRINT12_LIST_ID` | `ID da lista` | Plain text |
| `VITE_SPRINT13_LIST_ID` | `ID da lista` | Plain text |
| `VITE_DELIVERY_DATE` | `12 Out, 2023` | Plain text |
| `VITE_VELOCITY` | `42pts/wk` | Plain text |

3. Clique em **Save** e depois **Redeploy**

---

## PASSO 6 — Testar

1. Abra a URL do Vercel
2. Na sidebar, deve aparecer **"ClickUp conectado"** (verde)
3. As tarefas e o % serão os dados reais do seu ClickUp
4. Quando mover uma tarefa no ClickUp e clicar **"Atualizar agora"** no dashboard, os dados atualizam

---

## Para cada novo cliente

1. Crie novo Space/Listas no ClickUp
2. No Vercel, crie um novo projeto apontando para o mesmo repositório
3. Configure as variáveis com os novos IDs e nome do cliente
4. Cada cliente tem sua URL própria com seus dados

---

## Mapeamento de statuses (customizável)

Se o cliente usar nomes diferentes no ClickUp, edite a função `mapStatus` no `App.jsx`:

```js
function mapStatus(raw) {
  const s = (raw || '').toLowerCase().trim()
  if (['complete','closed','done','concluída'].includes(s)) return 'completed'
  if (['in progress','em progresso','doing'].includes(s))   return 'in_progress'
  if (['review','em review','approval'].includes(s))        return 'review'
  return 'pending'
}
```

Adicione os nomes que seu cliente usa dentro dos arrays.
