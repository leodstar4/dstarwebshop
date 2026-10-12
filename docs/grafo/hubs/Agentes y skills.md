---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Agentes y skills

Agentes de .kiro y skills de .agents instalados en el proyecto.

Parte de: [[DSTAR]]

## Contenido

- [[Agente architect]] — The Architect — critica la implementación. Evalúa diseño, estructura, mantenibilidad y decisiones técnicas de DSTAR.
- [[Agente budgeter]] — The Budgeter — costo cero: tokens de IA, gasto operativo y elección de servicios/herramientas (open source y free tiers primero).
- [[Agente diagnostico]] — The Detective — investiga por qué la web en producción (Netlify) se traba o da tirones aunque en localhost vaya bien. Mide, compara prod vs local y encuentra la causa raíz con evidencia.
- [[Agente grafo-actualizador]] — Mantiene al día el grafo de Obsidian (docs/) después de cambios de código: descripciones en generar-grafo.js, notas de contexto y pendientes.
- [[Agente grafo-contexto]] — Lee el grafo de Obsidian (docs/) y devuelve un resumen corto de contexto para una tarea: archivos, conexiones, reglas y pendientes, sin leer todo el código.
- [[Agente implementor]] — The Implementor — genera el código para satisfacer a Tester, Architect y Budgeter. Escribe, prueba y verifica.
- [[Agente optimizer]] — The Optimizer — vigila que la web nunca vaya lenta ni se trabe. Rendimiento, Core Web Vitals y fluidez.
- [[Agente planner]] — The Planner — descompone ideas en planes de implementación claros para DSTAR, sin escribir código.
- [[Agente security]] — The Guardian — seguridad de DSTAR. Protege pagos, credenciales, webhooks y datos de clientes.
- [[Agente tester]] — The Tester — intenta romper el código continuamente. Caza bugs, edge cases y fallos en el flujo de compra de DSTAR.
- [[Skill accessibility]] — Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make accessible".
- [[Skill frontend-design]] — Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
- [[Skill nodejs-backend-patterns]] — Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.
- [[Skill nodejs-best-practices]] — "Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying."
- [[Skill seo]] — Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization".

