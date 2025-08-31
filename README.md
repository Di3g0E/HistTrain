# HistTrain
Web de traqueo de entrenamientos

# 🎯 Guía Detallada: Dónde y Cómo Ejecutar Cada Comando

## 📍 UBICACIÓN: Carpeta del Proyecto

**IMPORTANTE**: Todos los comandos se ejecutan desde la carpeta raíz de tu proyecto (donde están los archivos `package.json`, `tsconfig.json`, etc.)

```
📁 tu-proyecto/           👈 AQUÍ ejecutas todos los comandos
├── 📁 docker/
├── 📁 prisma/
├── 📁 scripts/
├── 📁 src/
├── 📄 package.json      👈 Si ves este archivo, estás en el lugar correcto
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 🖥️ PASO 1: Abrir Terminal/Consola

### En Windows:
1. Presiona `Windows + R`
2. Escribe `cmd` o `powershell`
3. Presiona Enter

### En Mac:
1. Presiona `Cmd + Espacio`
2. Escribe "Terminal"
3. Presiona Enter

### En Linux:
1. Presiona `Ctrl + Alt + T`

---

## 📂 PASO 2: Navegar a tu Proyecto

```bash
# Ejemplo: Si tu proyecto está en el Escritorio
cd Desktop/tu-proyecto

# Ejemplo: Si está en Documentos
cd Documents/tu-proyecto

# Ejemplo: Si está en una carpeta específica
cd /ruta/completa/a/tu-proyecto
```

**💡 TIP**: Puedes arrastrar la carpeta del proyecto a la terminal y te dará la ruta automáticamente.

**✅ Verificar que estás en el lugar correcto:**
```bash
# Ejecuta este comando para ver los archivos
ls        # En Mac/Linux
dir       # En Windows

# Deberías ver: package.json, src/, docker/, prisma/, etc.
```

---

## ⚙️ PASO 3: Instalar Prerequisitos

### 3.1 Instalar pnpm (si no lo tienes)
```bash
npm install -g pnpm
```
**Dónde**: Terminal, desde cualquier ubicación
**Qué hace**: Instala pnpm globalmente en tu sistema

### 3.2 Verificar instalaciones
```bash
# Verificar Node.js
node --version
# Debe mostrar algo como: v18.17.0

# Verificar pnpm
pnpm --version
# Debe mostrar algo como: 8.6.2

# Verificar Docker
docker --version
# Debe mostrar algo como: Docker version 20.10.17
```

---

## 📝 PASO 4: Crear Archivo .env

### 4.1 Crear el archivo
```bash
# En Mac/Linux
touch .env

# En Windows (PowerShell)
New-Item -ItemType File -Name ".env"

# O simplemente crea un archivo llamado .env con tu editor de texto
```

### 4.2 Agregar contenido al .env
**Opción A: Con editor de terminal (nano)**
```bash
nano .env
```
Luego pega el contenido y presiona `Ctrl + X`, luego `Y`, luego `Enter`.

**Opción B: Con cualquier editor de texto**
- Abre el archivo `.env` con Visual Studio Code, Notepad++, etc.
- Pega este contenido:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:password@localhost:5432/workout_db"

# JWT
JWT_SECRET="desarrollo-super-secreto-jwt-muy-largo-y-seguro-aqui-123456789"
JWT_EXPIRES_IN="7d"

# Admin
ADMIN_PASSWORD="admin123"

# URLs
BASE_URL="http://localhost:3000"
BASE_URL_OTHER_PORT="http://localhost:[PORT]"

# Entorno
NODE_ENV="development"
```

---

## 🐳 PASO 5: Ejecutar Docker

### 5.1 Verificar que Docker esté corriendo
**En Windows**: Abre Docker Desktop desde el menú inicio
**En Mac**: Abre Docker Desktop desde Applications
**En Linux**: 
```bash
sudo systemctl start docker
```

### 5.2 Levantar servicios de base de datos
```bash
docker-compose up -d
```
**Dónde**: Terminal, desde la carpeta de tu proyecto
**Qué hace**: Levanta PostgreSQL y MinIO en segundo plano
**Resultado esperado**: 
```
✔ Container proyecto_postgres_1  Started
✔ Container proyecto_minio_1     Started
```

### 5.3 Verificar que los contenedores estén corriendo
```bash
docker-compose ps
```
**Resultado esperado**: Ver contenedores con estado "Up"

---

## 📦 PASO 6: Instalar Dependencias

```bash
pnpm install
```
**Dónde**: Terminal, desde la carpeta de tu proyecto
**Qué hace**: Descarga e instala todas las dependencias del proyecto
**Tiempo estimado**: 2-5 minutos
**Resultado esperado**: Se crea la carpeta `node_modules/`

---

## 🗄️ PASO 7: Configurar Base de Datos

### 7.1 Generar cliente Prisma
```bash
pnpm prisma generate
```
**Qué hace**: Genera el cliente de Prisma basado en tu schema

### 7.2 Ejecutar migraciones
```bash
pnpm prisma migrate dev
```
**Qué hace**: Crea las tablas en la base de datos
**Resultado esperado**: 
```
✔ Generated Prisma Client
✔ The following migration(s) have been applied:
  migrations/
    └── 20231201_init/
        └── migration.sql
```

### 7.3 (Opcional) Ver la base de datos
```bash
pnpm prisma studio
```
**Qué hace**: Abre una interfaz web para ver tus datos
**URL**: http://localhost:5555

---

## 🚀 PASO 8: Ejecutar el Proyecto

```bash
pnpm dev
```
**Dónde**: Terminal, desde la carpeta de tu proyecto
**Qué hace**: Inicia el servidor de desarrollo
**Resultado esperado**:
```
🚀 Server ready at http://localhost:3000
✨ tRPC server running on http://localhost:3000/trpc
```

**Para detener el servidor**: Presiona `Ctrl + C` en la terminal

---

## 🔍 VERIFICACIÓN: ¿Todo Funciona?

### 8.1 Verificar en el navegador
1. Abre tu navegador
2. Ve a: `http://localhost:3000`
3. Deberías ver la página de tu aplicación

### 8.2 Verificar servicios
```bash
# En otra terminal (mantén pnpm dev corriendo)
docker-compose ps
# Debe mostrar servicios "Up"

curl http://localhost:3000
# Debe retornar HTML de tu app
```

---

## 🆘 SI ALGO SALE MAL

### Error: "pnpm not found"
```bash
npm install -g pnpm
# Luego reinicia la terminal
```

### Error: "Docker not found"
1. Instala Docker Desktop
2. Asegúrate de que esté corriendo
3. Reinicia la terminal

### Error: "Port 3000 already in use"
```bash
# Encontrar qué usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Cambiar puerto en package.json scripts:
"dev": "vite --port 3001"
```

### Error: Database connection
```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Reiniciar servicios
docker-compose down
docker-compose up -d

# Verificar .env
cat .env
```

### Reset completo si nada funciona
```bash
# Parar todo
docker-compose down -v
rm -rf node_modules

# Empezar de nuevo
pnpm install
docker-compose up -d
pnpm prisma migrate dev
pnpm dev
```

---

## 📋 RESUMEN DE COMANDOS EN ORDEN

```bash
# 1. Navegar al proyecto
cd ruta/a/tu-proyecto

# 2. Instalar pnpm (si no lo tienes)
npm install -g pnpm

# 3. Crear .env (luego editarlo)
touch .env

# 4. Levantar Docker
docker-compose up -d

# 5. Instalar dependencias
pnpm install

# 6. Configurar base de datos
pnpm prisma generate
pnpm prisma migrate dev

# 7. Ejecutar proyecto
pnpm dev
```

**🎉 ¡Listo! Tu proyecto debería estar corriendo en http://localhost:3000**
