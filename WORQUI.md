# Marketplace de Refrigeração

> Plataforma que conecta clientes com profissionais de refrigeração/ar condicionado via WhatsApp

## 🎯 Conceito

Marketplace focado em serviços de refrigeração e ar condicionado. A plataforma usa **WhatsApp como canal principal** através de links autenticados, eliminando a necessidade de login para clientes.

## 👥 Tipos de Usuários

### Cliente
- ✅ Uso **gratuito**
- 📱 Gerencia tudo via **WhatsApp**
- 🔗 Acessa através de **links autenticados**
- ❌ Não possui dashboard

### Partner (Profissional)
- 💳 Paga **assinatura** mensal/anual
- 📱 Recebe notificações via **WhatsApp**
- 🖥️ Possui **dashboard** completo
- 📊 Limite de orçamentos por período

## 💰 Modelo de Negócio

- Partners pagam assinatura com **limite de orçamentos**
- Plataforma **NÃO cobra comissão** sobre serviços
- Pagamento negociado **diretamente** entre cliente e partner
- Planos: Básico, Pro, Premium

## 🔄 Fluxo Simplificado
```
1. Cliente → Preenche formulário no site
2. Partner → Recebe notificação (WhatsApp ou dashboard)
3. Partner → Envia orçamento
4. Cliente → Analisa via link (sem login)
5. Match → WhatsApps compartilhados
6. Negociação → Direto entre as partes
```

## 📋 Dados da Solicitação

**Obrigatórios:**
- Marca do aparelho (15 opções)
- Status da garantia
- Tipo de serviço (Manutenção/Instalação)
- Problema/Necessidade (9 opções)
- Prazo de atendimento (5 opções)
- WhatsApp (validado)
- CEP

**Opcional:**
- Informações adicionais

## 🔔 Sistema de Links Autenticados
```javascript
{
  token: "uuid",
  userId: "user_id",
  targetUrl: "/path",
  expiresAt: "timestamp"
}
```

**Características:**
- Token válido por 24-48h
- Reutilizável até expirar
- Gera JWT automaticamente
- Sem necessidade de login

## 🖥️ Dashboard do Partner

- 📋 Pedidos abertos
- 📤 Orçamentos enviados
- 📊 Status e histórico
- 💳 Gestão de plano/assinatura
- 👤 Perfil e documentação

## 📐 Regras Principais

### Distância
- Calculada via CEP
- Exibida antes do orçamento
- Partner decide viabilidade

### Limite de Orçamentos
- Definido pelo plano
- Reset automático por período
- Contador visível no dashboard

### Privacidade
- Contatos ocultos até match
- Após match: WhatsApp revelado

**Integrações:**
- WhatsApp Business API
- API de CEP
- Gateway de pagamento

## ✅ Pendências

### Alta Prioridade
- [ ] Documentos para validação
- [ ] Período de reset (diário/semanal)
- [ ] Estrutura de planos e preços
- [ ] Sistema de pagamento

### Média Prioridade
- [ ] Backoffice completo
- [ ] Templates WhatsApp
- [ ] Sistema de status do serviço

### Versão 2
- [ ] Filtro por raio
- [ ] Sistema de reviews
- [ ] Múltiplas categorias

## 🎯 Diferencial

Sistema de **links autenticados via WhatsApp** permite que clientes usem a plataforma sem criar conta. Partners têm **flexibilidade** entre usar links rápidos ou dashboard completo.

---

**Versão:** 1.0  
**Status:** Em desenvolvimento  
**Última atualização:** 24/11/2024