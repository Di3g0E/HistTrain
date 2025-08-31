# HistTrain
Web de traqueo de entrenamientos

# 🚀 Guía Completa para Ejecutar el Proyecto

## 📋 Prerequisitos

Asegúrate de tener instalado:
- **Node.js** (versión 18 o superior)
- **pnpm** (recomendado) o npm
- **Docker** y **Docker Compose**
- **Git**

## 🔧 Paso 1: Configuración Inicial

### 1.1 Clonar y acceder al proyecto
```bash
# Si aún no tienes el proyecto localmente
git clone <tu-repositorio>
cd <nombre-del-proyecto>
```

### 1.2 Instalar dependencias
```bash
# Usando pnpm (recomendado por el pnpm-lock.yaml)
pnpm install

# O usando npm si no tienes pnpm
npm install
```

### 1.3 Configurar variables de entorno
```bash
# Crear archivo de variables de entorno
cp .env.example .env  # si existe
# O crear .env manualmente
```

**Contenido mínimo para `.env`:**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:password@localhost:5432/workout_db"

# JWT
JWT_SECRET="tu-super-secreto-jwt-muy-largo-y-seguro-aqui"
JWT_EXPIRES_IN="7d"

# Admin
ADMIN_PASSWORD="tu-password-admin-seguro"

# URLs
BASE_URL="http://localhost:3000"
BASE_URL_OTHER_PORT="http://localhost:[PORT]"

# Entorno
NODE_ENV="development"
```

## 🐳 Paso 2: Ejecutar con Docker (Recomendado)

### 2.1 Levantar servicios de base de datos
```bash
# Esto levantará PostgreSQL y MinIO
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 2.2 Configurar la base de datos
```bash
# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Opcional: Sembrar datos iniciales
pnpm prisma db seed  # si tienes seed configurado
```

## 💻 Paso 3: Ejecutar el Proyecto

### 3.1 Modo Desarrollo
```bash
# Ejecutar en modo desarrollo
pnpm dev

# O si usas npm
npm run dev
```

### 3.2 Verificar que todo funcione
- **Frontend**: http://localhost:3000
- **API/tRPC**: http://localhost:3000/trpc
- **Base de datos**: PostgreSQL en puerto 5432
- **MinIO**: http://localhost:9000 (para archivos)

## 🛠️ Comandos Útiles

### Base de datos (Prisma)
```bash
# Ver la base de datos en el navegador
pnpm prisma studio

# Resetear la base de datos
pnpm prisma migrate reset

# Crear una nueva migración
pnpm prisma migrate dev --name nombre-migracion

# Aplicar cambios del schema sin migración
pnpm prisma db push
```

### Desarrollo
```bash
# Linting
pnpm lint

# Formatear código
pnpm format

# Ejecutar tests (si están configurados)
pnpm test

# Build para producción
pnpm build

# Ejecutar en producción
pnpm start
```

### Docker
```bash
# Ver logs de los contenedores
docker-compose logs -f

# Parar todos los servicios
docker-compose down

# Reconstruir contenedores
docker-compose up -d --build

# Limpiar volúmenes (¡CUIDADO: Borra datos!)
docker-compose down -v
```

## 🔍 Solución de Problemas Comunes

### Problema: Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Verificar la URL de conexión
echo $DATABASE_URL

# Reiniciar servicios de Docker
docker-compose restart
```

### Problema: Prisma no encuentra la base de datos
```bash
# Regenerar cliente Prisma
pnpm prisma generate

# Verificar estado de migraciones
pnpm prisma migrate status

# Aplicar migraciones pendientes
pnpm prisma migrate dev
```

### Problema: Puerto ocupado
```bash
# Encontrar qué proceso usa el puerto 3000
lsof -i :3000

# Matar el proceso (reemplaza PID)
kill -9 <PID>

# O cambiar puerto en package.json o .env
```

### Problema: Dependencias desactualizadas
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install

# O con npm
rm -rf node_modules package-lock.json
npm install
```

## 📁 Estructura del Proyecto

```
├── docker/           # Configuraciones Docker
├── prisma/          # Schema y migraciones de base de datos
├── scripts/         # Scripts de automatización
└── src/             # Código fuente
    ├── components/  # Componentes React
    ├── server/      # Backend (tRPC + Prisma)
    ├── stores/      # Estado global (Zustand)
    └── trpc/        # Cliente tRPC
```

## 🔐 Configuración de Seguridad

### Para desarrollo local:
```env
JWT_SECRET="desarrollo-solo-no-usar-en-produccion-123456789"
ADMIN_PASSWORD="admin123"
```

### Para producción:
```env
JWT_SECRET="$(openssl rand -base64 32)"
ADMIN_PASSWORD="$(openssl rand -base64 16)"
```

## 🎯 Verificación Final

Una vez que todo esté corriendo, verifica:

1. ✅ **Frontend carga**: http://localhost:3000
2. ✅ **Base de datos conecta**: `pnpm prisma studio`
3. ✅ **API responde**: Crear un usuario de prueba
4. ✅ **Autenticación funciona**: Login/logout
5. ✅ **CRUD funciona**: Crear, leer, actualizar entrenamientos

## 🆘 Si Nada Funciona

```bash
# Reset completo del proyecto
docker-compose down -v
rm -rf node_modules
pnpm install
docker-compose up -d
pnpm prisma migrate reset --force
pnpm prisma generate
pnpm dev
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica las variables de entorno
3. Comprueba que todos los servicios estén corriendo
4. Consulta la documentación de cada tecnología específica
