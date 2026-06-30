# Reclamos Cañada de Gómez

Aplicación web para registrar, visualizar y gestionar reclamos ciudadanos de Cañada de Gómez. La página pública permite cargar reclamos con ubicación en mapa, consultar el estado por número de seguimiento y visualizar reclamos existentes. El panel administrativo permite revisar reclamos, marcarlos como vistos y actualizar su estado/respuesta.

## Tecnologías

- React 19
- Vite
- Supabase Auth, Database, RPC y Storage
- React Router
- React Leaflet / Leaflet
- Tailwind CSS
- Vercel

## Rutas principales

- `/`: página pública del mapa y carga de reclamos.
- `/admin`: login del panel administrativo.
- `/admin/dashboard`: panel administrativo protegido por sesión Supabase.

## Variables de entorno

Crear un archivo `.env` local a partir de `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

No guardar claves reales en el repositorio. La anon key de Supabase se configura en `.env` local y en las variables de entorno de Vercel.

## Instalación local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env`:

```bash
cp .env.example .env
```

3. Completar las variables de Supabase.

4. Ejecutar el entorno local:

```bash
npm run dev
```

5. Validar build:

```bash
npm run build
```

6. Validar lint:

```bash
npm run lint
```

## Base de datos Supabase

Los scripts SQL viven en `database/` y deben ejecutarse en este orden desde el SQL Editor de Supabase:

1. `database/schema.sql`
2. `database/policies.sql`
3. `database/storage.sql`
4. `database/seed.sql`

### Qué crea cada archivo

- `schema.sql`: extensiones, enums, tablas, relaciones, defaults, secuencia `reclamo_numero_seq`, triggers y funciones RPC.
- `policies.sql`: RLS, policies por tabla y grants necesarios.
- `storage.sql`: bucket `reclamos-fotos`, límite de 5 MB, MIME types permitidos y policies de Storage.
- `seed.sql`: categorías iniciales y números de emergencia. No incluye reclamos de prueba.
- `reset-demo-data.sql`: borra reclamos, fotos y respuestas, y reinicia `reclamo_numero_seq` en `100`.

### RPCs usadas por el frontend

El servicio `src/services/claimsService.js` usa estas funciones de Supabase:

- `crear_reclamo_publico`
- `obtener_reclamos_mapa_publico`
- `buscar_reclamo_por_numero`
- `actualizar_gestion_reclamo_admin`
- `marcar_reclamo_visto`

Importante: la función del mapa debe llamarse exactamente `obtener_reclamos_mapa_publico`, porque ese es el nombre usado por `getMapClaims()` en `claimsService.js`.

## Crear Supabase

1. Crear un proyecto nuevo en Supabase.
2. Ir a SQL Editor.
3. Ejecutar los scripts de `database/` en el orden indicado.
4. Ir a Authentication y crear el usuario administrador.
5. Ir a Storage y verificar que exista el bucket público `reclamos-fotos`.
6. Copiar `Project URL` y `anon public key`.
7. Cargar esas credenciales en `.env` local:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## Conectar Vercel

1. Importar el repositorio en Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Agregar variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.
7. Probar `/`, `/admin` y `/admin/dashboard`.

## Conectar dominio

1. En Vercel, ir a Project Settings > Domains.
2. Agregar el dominio o subdominio.
3. Configurar DNS según indique Vercel:
   - `A` record para dominio raíz, o
   - `CNAME` para subdominio.
4. Esperar la propagación DNS.
5. Verificar que HTTPS quede activo.
6. Actualizar cualquier URL pública fija del proyecto si cambia el dominio final.

## Checklist final de entrega

- [ ] `.env` real no está versionado.
- [ ] `.env.example` existe y no contiene claves.
- [ ] `npm install` funciona.
- [ ] `npm run build` pasa correctamente.
- [ ] `npm run lint` no tiene errores.
- [ ] Scripts de `database/` ejecutados en Supabase.
- [ ] Bucket `reclamos-fotos` creado con límite de 5 MB.
- [ ] Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- [ ] Usuario administrador creado en Supabase Auth.
- [ ] Página pública carga categorías y mapa.
- [ ] Formulario público crea reclamos.
- [ ] Consulta por número funciona.
- [ ] Panel admin permite login.
- [ ] Panel admin lista reclamos.
- [ ] Panel admin permite marcar reclamos como vistos.
- [ ] Panel admin permite actualizar estado/respuesta.
- [ ] Variables de entorno cargadas en Vercel.
- [ ] Dominio conectado y con HTTPS activo.
