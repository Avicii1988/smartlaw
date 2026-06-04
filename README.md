# smartlaw – Schweizer Kanzleisoftware

Eine moderne, KI-gestützte Kanzleiverwaltungsplattform für Schweizer Anwaltskanzleien.

## Funktionen

- **Mandantenverwaltung** – CRUD für Privat- und Firmenmandanten
- **Dossier-Management** – Fristüberwachung, Aufgaben, Statusverwaltung
- **Leistungserfassung** – Zeiterfassung mit Stoppuhr, tageweise Übersicht
- **Honorar & Rechnungen** – Rechnungserstellung, MwSt-Berechnung, Statusverfolgung
- **Dokumentenverwaltung** – Upload/Download mit E-Signatur-Status
- **KI-Assistent** – Claude-powered Chat für Schriftsätze, Recherche, Zusammenfassungen
- **Rechtspakete** – Vorlagen und Checklisten pro Rechtsgebiet
- **Dashboard** – KPI-Übersicht, Fristen, KI-Hinweise

## Tech-Stack

| Ebene | Technologie |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Datenbank | PostgreSQL, Prisma ORM |
| KI | Anthropic Claude (claude-sonnet-4-20250514) |
| Auth | JWT-basiert (Admin / Anwalt / Assistent) |

## Voraussetzungen

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Installation

### 1. Repository klonen

```bash
git clone <repo-url>
cd smartlaw
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Bearbeiten Sie `server/.env`:

```env
DATABASE_URL="postgresql://postgres:passwort@localhost:5432/smartlaw"
JWT_SECRET="ihr-geheimer-schluessel"
ANTHROPIC_API_KEY="sk-ant-..."
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 4. Datenbank einrichten

```bash
# Datenbank erstellen (PostgreSQL muss laufen)
createdb smartlaw

# Schema deployen
npm run db:push

# Demo-Daten laden
npm run db:seed
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffnen Sie http://localhost:5173

## Demo-Zugänge

| Benutzer | E-Mail | Passwort | Rolle |
|----------|--------|----------|-------|
| Anna Meier | admin@smartlaw.ch | smartlaw123 | Admin |
| Thomas Müller | mueller@smartlaw.ch | smartlaw123 | Anwalt |
| Sarah Schneider | schneider@smartlaw.ch | smartlaw123 | Anwältin |
| Marc Weber | assistant@smartlaw.ch | smartlaw123 | Assistent |

## Demo-Daten

Das Seed-Skript erstellt:

- 4 Benutzer (3 Anwälte + 1 Assistent)
- 10 Mandanten (Privat und Firmen)
- 15 Dossiers (alle Rechtsgebiete, verschiedene Status)
- 40 Leistungseinträge
- 5 Aufgaben
- 3 Rechnungen (versendet, bezahlt, überfällig)
- 5 Rechtspakete mit Vorlagen
- Honorarvereinbarungen

## Projektstruktur

```
smartlaw/
├── client/          # React Frontend (Vite)
│   └── src/
│       ├── pages/   # Hauptseiten
│       ├── components/  # Wiederverwendbare Komponenten
│       ├── lib/     # API-Client, Utilities
│       └── store/   # Zustand (Zustand)
├── server/          # Express Backend
│   └── src/
│       ├── routes/  # API-Endpunkte
│       ├── middleware/  # Auth, Fehlerbehandlung
│       └── lib/     # Prisma-Client
│   └── prisma/
│       └── schema.prisma
└── shared/          # Gemeinsame TypeScript-Typen
```

## API-Endpunkte

| Route | Beschreibung |
|-------|-------------|
| `POST /api/auth/login` | Anmelden |
| `GET /api/clients` | Mandantenliste |
| `GET /api/dossiers` | Dossierliste |
| `GET /api/time-entries` | Leistungseinträge |
| `GET /api/invoices` | Rechnungen |
| `GET /api/documents` | Dokumente |
| `POST /api/ai/chat` | KI-Chat (SSE-Streaming) |
| `GET /api/packages` | Rechtspakete |
| `GET /api/dashboard/kpis` | Dashboard-KPIs |

## Produktionsbuild

```bash
npm run build
# Frontend: client/dist/
# Backend: server/dist/
```

## Hinweise

- Der KI-Assistent erfordert einen gültigen Anthropic API-Key
- Dokumente werden im Ordner `server/src/uploads/` gespeichert
- Für Produktion: Uploads in S3/CloudStorage auslagern
- JWT-Tokens laufen nach 7 Tagen ab
