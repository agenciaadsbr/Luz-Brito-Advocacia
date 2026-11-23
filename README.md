# LP Luz & Brito Advocacia — Direito Previdenciário

Landing page estática (HTML/CSS/JS) para captação de leads em Direito Previdenciário (BPC/LOAS, pensão especial do Zika — Lei 15.156/2025, aposentadoria rural, incapacidade e aposentadoria urbana) no sul do Pará e norte do Tocantins.

- `/` — página principal; todos os CTAs levam ao formulário no fim (Nome + WhatsApp)
- `/redirect` — tela de transição (contador 3-2-1) que dispara a conversão e abre o WhatsApp do escritório
- `/dashboard` — painel de leads (login via Supabase Auth)

## Configuração
Tudo que depende do cliente fica em `config.js` (WhatsApp, OAB, endereço, Meta Pixel, Google Ads, webhook do CRM, equipe).

## Dados
Supabase "ADS BR CLIENTES" (`qxhnjzyhtllmtdrcyygi`), tabelas `lp_visits` e `lp_leads` com `site='luz-brito'` (assunto do lead em `servico`).
Acesso ao painel controlado por `lp_acessos` (RLS `pode_ver_site`). Login: usuário `admin`.

## Pendências de configuração
- Número do WhatsApp do escritório (`CONFIG.whatsapp.number`)
- Número da OAB no rodapé (Provimento 205/2021)
- IDs do Meta Pixel e da conversão do Google Ads
- Foto do Dr. Lucas e dados do sócio
