# DSTAR — Tienda Online

Streetwear exclusivo. Del barrio para el barrio.

---

## Estructura del Proyecto

```
dstar-store/
├── index.html              ← Página principal
├── gracias.html            ← Página post-compra exitosa
├── error-pago.html         ← Página error de pago
├── netlify.toml            ← Configuración de Netlify
├── package.json            ← Dependencias
├── css/
│   └── style.css           ← Estilos completos
├── js/
│   └── app.js              ← Lógica (carrito, productos, checkout)
├── images/
│   ├── logo.png            ← Logo DSTAR
│   ├── concrete-bg.jpg     ← Textura de concreto (fondo)
│   └── products/           ← AQUÍ VAN TUS FOTOS DE PRODUCTOS
│       ├── hoodie-phantom.jpg
│       ├── tee-concrete.jpg
│       └── ...
└── netlify/
    └── functions/
        └── create-preference.js  ← Función serverless para Mercado Pago
```

---

## 1. SETUP LOCAL (Tu Máquina)

### Requisitos
- Node.js 18+ (descarga en https://nodejs.org)
- Git (opcional pero recomendado)
- Cuenta en Netlify (gratis: https://netlify.com)
- Cuenta en Mercado Pago Developers

### Instalar

```bash
# 1. Entra a la carpeta del proyecto
cd dstar-store

# 2. Instala dependencias
npm install

# 3. Instala Netlify CLI global (una sola vez)
npm install -g netlify-cli

# 4. Corre el servidor local
netlify dev
```

Tu tienda estará corriendo en `http://localhost:8888`

### Agregar tus productos

1. Mete las fotos de tus productos en `images/products/`
2. Abre `js/app.js` y edita el array `PRODUCTS` al inicio del archivo
3. Cada producto tiene: nombre, precio, descripción, imagen, tallas, stock

```javascript
{
  id: 'mi-producto-01',        // ID único
  name: 'HOODIE EJEMPLO',      // Nombre que se muestra
  price: 1200,                 // Precio en MXN (número entero)
  description: 'Descripción...', 
  image: 'images/products/mi-foto.jpg',  // Ruta a la foto
  badge: 'LIMITED',            // LIMITED | NEW | SOLDOUT
  stock: 20,                   // Piezas totales disponibles
  sizes: ['S', 'M', 'L', 'XL'],
  sizesStock: { S: 5, M: 5, L: 5, XL: 5 }  // Stock por talla
}
```

---

## 2. PAGOS — MERCADO PAGO

### ¿Por qué Mercado Pago y no Stripe?

Para México, **Mercado Pago es la mejor opción** porque:
- Acepta **tarjetas, OXXO, SPEI, CoDi** (Stripe no acepta OXXO fácilmente)
- Tus clientes pueden pagar en **efectivo en OXXO** (muy importante para streetwear)
- Meses sin intereses automáticos
- Depósitos en tu cuenta bancaria mexicana
- Comisión: ~3.6% + $4 MXN por transacción
- Interfaz y soporte 100% en español

### Configurar Mercado Pago

1. **Crea tu cuenta de vendedor** en https://www.mercadopago.com.mx
2. Ve a https://www.mercadopago.com.mx/developers/panel
3. Crea una aplicación nueva (nombre: "DSTAR Tienda")
4. En credenciales de **Producción**, copia tu `Access Token`
5. Configúralo como variable de entorno en Netlify:

```
MERCADOPAGO_ACCESS_TOKEN = APP_USR-xxxxx-tu-token-xxxxx
SITE_URL = https://tu-sitio.netlify.app
```

### Para testear antes de ir live

1. Usa las credenciales de **Sandbox** (pruebas)
2. En `js/app.js`, cambia el endpoint para usar `sandbox_init_point` en vez de `init_point`
3. Usa las tarjetas de prueba de Mercado Pago:
   - Visa: 4509 9535 6623 3704 (cualquier CVV, cualquier fecha futura)

### Flujo de compra

```
Cliente agrega productos → Clic en PAGAR → 
Netlify Function crea preferencia → Redirige a Mercado Pago → 
Cliente paga (tarjeta/OXXO/SPEI) → Regresa a /gracias.html
```

### Webhook (Notificaciones de pago)

Para saber cuándo un pago se completó (especialmente pagos en OXXO que no son inmediatos):

1. En el panel de Mercado Pago Developers, configura un Webhook
2. URL: `https://tu-sitio.netlify.app/.netlify/functions/webhook-mercadopago`
3. Crea una nueva función en `netlify/functions/webhook-mercadopago.js` para recibir notificaciones
4. Ahí puedes enviar emails de confirmación, actualizar stock, etc.

---

## 3. ENVÍOS EN MÉXICO

### Opción recomendada: SKYDROPX

**Skydropx** (https://skydropx.com) es un agregador de paquetería ideal para marcas pequeñas:

- **No necesitas contrato** con cada paquetería por separado
- Te da acceso a: Estafeta, FedEx, DHL, Redpack, J&T Express, 99minutos
- **Precios de mayoreo** aunque mandes pocos paquetes
- Genera guías de envío desde su dashboard o por API
- Tracking automático para tus clientes
- Precio aprox: desde $80-120 MXN por envío nacional

#### Cómo funciona

1. **Regístrate** en https://app.skydropx.com/register (plan gratuito disponible)
2. Recarga saldo en tu cuenta (mínimo $500 MXN)
3. Cuando recibes un pedido:
   - Entra al dashboard de Skydropx
   - Crea un envío con los datos del cliente
   - Selecciona la paquetería más barata/rápida
   - Genera la guía de envío (PDF)
   - Imprime la guía y pégala en el paquete
   - Agenda recolección o lleva a sucursal

#### Flujo práctico para tu marca

```
1. Te llega notificación de pago completado
2. Preparas el paquete (empaca la ropa)
3. Entras a Skydropx → Crear envío
4. Pones: datos del comprador, peso, medidas
5. Skydropx te muestra opciones (Estafeta $89, FedEx $110, etc.)
6. Eliges la más conveniente
7. Generas e imprimes la guía
8. Mandas tracking al cliente por WhatsApp/email
9. Programas recolección o lo llevas a la sucursal
```

### Alternativas de envío

| Servicio | Ventaja | Desventaja |
|----------|---------|------------|
| **Skydropx** | Fácil, múltiples paqueterías, buen precio | Necesitas recargar saldo |
| **Envia.com** | Similar a Skydropx, API robusta | Interfaz menos intuitiva |
| **99minutos** | Envío express mismo día en CDMX/MTY/GDL | Solo ciudades grandes |
| **Correos de México** | El más barato (~$50-70 MXN) | Lento (5-10 días), menos confiable |
| **Estafeta directo** | Confiable, buena cobertura | Necesitas contrato y volumen |

### Costos de envío sugeridos

Para una marca pequeña de streetwear en México:
- **Envío estándar**: $99-149 MXN (Estafeta/Redpack, 3-5 días)
- **Envío express**: $149-199 MXN (FedEx/DHL, 1-3 días)
- **Envío gratis**: en compras mayores a $999 MXN (tú absorbes el costo)

---

## 4. DEPLOY EN NETLIFY

### Primera vez

```bash
# 1. Login en Netlify desde tu terminal
netlify login

# 2. Conecta el proyecto
netlify init
# Selecciona "Create & configure a new site"
# Team: tu equipo
# Site name: dstar (será dstar.netlify.app)

# 3. Configura variables de entorno
netlify env:set MERCADOPAGO_ACCESS_TOKEN "tu-token-aqui"
netlify env:set SITE_URL "https://dstar.netlify.app"

# 4. Deploy
netlify deploy --prod
```

### Actualizaciones posteriores

Cada vez que hagas cambios:
```bash
netlify deploy --prod
```

### Dominio personalizado (opcional)

1. Compra un dominio (recomiendo Namecheap o Google Domains): `dstar.mx`
2. En Netlify → Domain Settings → Add custom domain
3. Apunta los DNS de tu dominio a Netlify
4. Netlify te da SSL gratis automáticamente

---

## 5. PERSONALIZACIÓN

### Cambiar colores
Edita las variables CSS en `css/style.css`:
```css
:root {
  --black: #0a0a0a;
  --concrete: #8a8a83;
  --white: #f0ede8;
  --red: #e63232;     /* Color de badges "LIMITADO" */
}
```

### Cambiar textos
- Announcement bar: en `index.html` busca `.announcement-bar__track`
- Sección About: en `index.html` busca `#about`
- Redes sociales: busca los links de Instagram/TikTok

### Fotos de productos
- Resolución recomendada: **800x1067px** (ratio 3:4)
- Formato: JPG optimizado (~100-200KB cada una)
- Fondo oscuro o neutro se ve mejor con el diseño

---

## 6. TIPS PARA TU MARCA

### Fotografía
- Usa fondo de concreto o pared de ladrillo (mantiene la estética)
- Fotos flat lay + fotos de modelo
- Iluminación natural o flash directo (aesthetic callejero)

### Stock management
- Este sitio NO tiene backend de inventario automático
- Cuando se agote un producto, cambia `badge: 'SOLDOUT'` y `stock: 0` en `app.js`
- Re-deploya con `netlify deploy --prod`

### WhatsApp Business
- Agrega un link de WhatsApp para atención directa:
  `https://wa.me/52TUNUMERO?text=Hola%20DSTAR`
- Puedes agregarlo en el footer o como botón flotante

---

## Soporte

¿Necesitas ayuda? Modifica cualquier archivo y re-deploya. 
La estructura es simple: HTML + CSS + JS vanilla = fácil de mantener.
