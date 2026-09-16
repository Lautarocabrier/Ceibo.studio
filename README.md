# Guía Rápida de Inicio — Ceibo Studio

> **Requisitos:** [Node.js](https://nodejs.org/) (v18 o superior) y npm.

---

### 1. Backend (Terminal 1)

```bash
cd BE
npm install
```

Configurar variables de entorno (si aún no existe `.env`):
- En Windows (PowerShell): `cp .env.example .env`
- En Linux / Mac: `cp .env.example .env`

Generar cliente y base de datos (SQLite):
```bash
npm run prisma:generate
npm run prisma:push
```

Iniciar servidor en modo desarrollo:
```bash
npm run dev
```
> Corre en **http://localhost:5000** (el seed de Super Admin se ejecuta automáticamente al iniciar).

---

### 2. Frontend (Terminal 2)

```bash
cd FE
npm install
npm run dev
```
> Corre en **http://localhost:5173** (redirige `/api` al backend automáticamente).

---

### 3. Credenciales por defecto (Super Admin)

- **URL:** [http://localhost:5173/login](http://localhost:5173/login)
- **Email:** `admin@ceibo.studio`
- **Contraseña:** `Admin123!`
