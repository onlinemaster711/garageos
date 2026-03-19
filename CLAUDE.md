# GarageOS — Projektübergabe
**Für: Claude Cowork**
**Stand: März 2026**

---

## Was ist GarageOS?

Eine Web-App für private Fahrzeugsammler die mehrere hochwertige Autos besitzen (typisch 6–15 Fahrzeuge, Portfoliowert 500k–2 Mio. €). Die App löst ein konkretes Problem: Viele Autos zu besitzen ist ein versteckter Vollzeitjob. GarageOS übernimmt diese Arbeit automatisch.

**Kernversprechen:** Deine Sammlung auf Autopilot. Zeitersparnis von 7+ Stunden pro Monat. Werterhalt durch Dokumentation und aktive Erinnerungen.

---

## Zielgruppe

- **B2C:** Privatpersonen mit 3–15 Fahrzeugen, Portfoliowert 500k–2 Mio. €
- **B2B:** Händler, Verwalter, Family Offices mit mehreren Fahrzeugen
- Typischer Nutzer: 45–65 Jahre, kaufkräftig, wenig Zeit, hoher Anspruch

---

## Tech Stack (entschieden und final)

| Layer | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Datenbank + Auth + Storage | Supabase |
| E-Mail | Resend |
| Deployment | Vercel (Free Tier) |
| Sprache | Deutsch (primär), Englisch (später) |

**Accounts existieren bereits:** Supabase, Vercel und Resend sind vorhanden.

---

## Alle Features — vollständige Liste

### 1. Fahrzeugakte
- Marke, Modell, Baujahr, Farbe, Fahrgestellnummer, Kennzeichen
- Kaufdatum, Kaufpreis, aktueller Kilometerstand
- Fahrzeugkategorie: Oldtimer / Youngtimer / Modern
- Land (für länderspezifische Fristen)
- Versicherungsnummer, Hauptfahrer, Notizen

### 2. Reifenmanagement
- Sommer- und Winterreifen separat pro Auto
- Reifenmarke, Größe, Kaufdatum, Zustand, Profiltiefe
- Gefahrene Kilometer pro Reifensatz
- Lagerort: Heimgarage, Werkstatt, Reifenservice
- Wann zuletzt gewechselt
- Erinnerung: Reifenwechsel Frühjahr und Herbst
- Warnung bei zu geringer Profiltiefe

### 3. Dokumentenablage
- Upload per WhatsApp, E-Mail oder direkt in der App
- Automatische Zuordnung zum richtigen Fahrzeug per KI
- Typen: Kaufvertrag, TÜV, Gutachten, Rechnungen, Versicherung, Zulassung
- Ablaufdaten werden erkannt und als Erinnerung gesetzt
- Suchfunktion über alle Dokumente aller Fahrzeuge

### 4. WhatsApp-Integration
- Foto oder Dokument in WhatsApp schicken
- System erkennt automatisch zu welchem Auto es gehört
- Wird sofort abgelegt ohne manuelles Sortieren
- Spracheingabe: "Porsche war beim Ölwechsel, 280 Euro" → automatischer Wartungseintrag

### 5. Spracheingabe (überall in der App)
- Alles per Sprache bedienbar
- Fahrterfassung: "Heute 80 km mit dem Ferrari gefahren" → wird automatisch geloggt
- Wartungseinträge, Erinnerungen, Notizen — alles per Sprache

### 6. Verkaufs-Dossier (PDF-Export)
- Ein Klick → vollständiges professionelles PDF
- Enthält: alle Fahrzeugdaten, komplette Wartungshistorie, Dokumente, Fotos, Gutachten
- Teilbarer Link mit Ablaufdatum und Wasserzeichen
- QR-Code für digitalen Käufer-Zugang ohne Login

### 7. Wartungshistorie
- Jede Wartung: Datum, Werkstatt, Kosten, Kilometerstand, Beschreibung
- Wiederkehrende Wartungen mit Intervallen
- Werkstatt-Kontakte hinterlegen
- Kostenübersicht pro Auto und gesamt

### 8. Erinnerungen & Fristen
- TÜV/HU länderspezifisch automatisch
- Versicherungsverlängerung, KFZ-Steuer
- Reifenwechsel Frühjahr/Herbst
- Benachrichtigung 30 / 7 / 1 Tag vorher per E-Mail
- Eigene Erinnerungen frei definierbar

### 9. Fahrt-Erinnerung (Oldtimer-Schutz)
- Letztes Fahrdatum pro Auto
- Maximale Standzeit einstellbar (Standard: 4 Wochen)
- Erinnerung vor Standschäden (Batterie, Dichtungen, Bremsen)
- Kilometerstand-Verlauf über Zeit

### 10. Standort & Lagerung
- Wo steht welches Auto: Heimgarage, Zweitgarage, Einlagerung, Werkstatt
- Klimabedingungen hinterlegen
- Kontaktdaten des Lagerorts
- Erinnerung bei langer Einlagerung

### 11. Marktwert & Wertentwicklung
- Kaufpreis vs. aktueller Marktwert
- Vergleichspreise aus Mobile.de / AutoScout24
- Wertentwicklung über Zeit als Grafik
- Holding-Kosten vs. Wertsteigerung → echte Rendite

### 12. Portfolio-Dashboard
- Gesamtwert aller Fahrzeuge
- Kosten pro Auto (Wartung, Versicherung, Steuer, Lagerung)
- Welches Auto kostet am meisten, welches hat am meisten gewonnen

### 13. Versicherungs-Cockpit
- Versicherter Wert vs. aktueller Marktwert
- Warnung bei Unterversicherung
- Auslaufdaten aller Policen
- Schadenhistorie

### 14. Rollen & Zugänge
- Owner: voller Zugriff
- Assistent: kann erfassen und bearbeiten, nicht löschen
- Viewer: nur lesen
- Aktivitäts-Log wer was wann geändert hat

### 15. Fotos & Zustandsdokumentation
- Unbegrenzte Fotos pro Auto
- Zustandsbewertung hinterlegen
- Vorher/Nachher-Vergleich
- Upload per WhatsApp automatisch zugeordnet

### 16. Länderspezifische Regelwerke
- Deutschland: HU alle 2 Jahre, H-Kennzeichen-Regeln
- Österreich: Pickerl §57a
- Schweiz: MFK
- Spanien: ITV
- Pro Auto Land wählen → richtige Fristen greifen automatisch

### 17. Kilometerstand-Tracking
- Erfassung bei jeder Wartung oder Fahrt
- Verlauf als Grafik
- Durchschnittliche Jahreskilometer
- Relevant für Wenigfahrer-Versicherungstarife

---

## Preismodell (final entschieden)

### B2C
| Tier | Fahrzeuge | Monat | Jahr |
|---|---|---|---|
| Solo | 1–2 Autos | 29 € | 290 € |
| Collector | 3–5 Autos | 79 € | 790 € |
| Estate | Ab 6 Autos — alles inklusive | 249 € | 2.490 € |

### B2B
| Tier | Fahrzeuge | Monat |
|---|---|---|
| Business | Bis 25 Autos | 399 € |
| Enterprise | Unbegrenzt | auf Anfrage |

**Empfehlung für Launch:** Nur Collector (79 €) und Estate (249 €) — Solo-Tier erst später.

---

## Datenbank Schema (vollständig)

```sql
-- Fahrzeuge
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  make text not null,
  model text not null,
  year integer,
  plate text,
  vin text,
  color text,
  country_code text default 'DE',
  category text default 'modern',
  purchase_date date,
  purchase_price numeric,
  current_mileage integer,
  last_driven_date date,
  max_standzeit_weeks integer default 4,
  location_id uuid references locations,
  cover_photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- Standorte
create table locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  address text,
  type text,
  climate_controlled boolean default false,
  contact_name text,
  contact_phone text,
  notes text
);

-- Dokumente
create table documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  type text,
  file_url text not null,
  file_name text,
  expires_at date,
  notes text,
  uploaded_at timestamptz default now()
);

-- Erinnerungen
create table reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  type text not null,
  title text not null,
  due_date date not null,
  repeat_months integer,
  status text default 'open',
  notified_30 boolean default false,
  notified_7 boolean default false,
  notified_1 boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Wartung
create table maintenance (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  date date not null,
  title text not null,
  description text,
  workshop text,
  cost numeric,
  mileage integer,
  created_at timestamptz default now()
);

-- Reifen
create table tires (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  type text not null,
  brand text,
  size text,
  purchase_date date,
  mileage_km integer default 0,
  tread_depth_mm numeric,
  condition text,
  storage_location text,
  last_mounted_date date,
  notes text
);

-- Fahrten
create table drives (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles not null,
  user_id uuid references auth.users not null,
  date date not null,
  km_driven integer,
  mileage_after integer,
  notes text,
  created_at timestamptz default now()
);

-- Rollen
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  member_email text not null,
  member_id uuid references auth.users,
  role text not null,
  created_at timestamptz default now()
);
```

---

## Bauphasen

### Phase 1 — Fundament (JETZT STARTEN)
- Next.js Projekt initialisieren
- Supabase Setup (Auth, DB, Storage)
- Login / Signup / Logout
- Dashboard: alle Fahrzeuge auf einen Blick
- Fahrzeug anlegen / bearbeiten / löschen
- Foto-Upload pro Fahrzeug
- Dokumente hochladen und anzeigen
- Fahrzeugakte mit Tab-Navigation

### Phase 2 — Erinnerungen
- Reminder-System mit allen Typen
- Länderspezifische Regelwerke (DE, AT, CH, ES)
- Fahrt-Erinnerung für Oldtimer
- E-Mail-Benachrichtigungen via Resend
- Cron Job täglich 08:00 Uhr via Vercel Cron

### Phase 3 — Mehrwert
- Marktwert-Tracking (Mobile.de)
- Portfolio-Dashboard
- Rollen & Zugänge
- Verkaufs-Dossier PDF-Export
- Reifenmanagement

### Phase 4 — Profi-Features
- WhatsApp-Integration
- Spracheingabe (Web Speech API)
- Versicherungs-Cockpit
- Kilometerstand-Verlauf als Grafik

---

## Design-Vorgaben

- **Hintergrund:** #0A0A0A (sehr dunkel)
- **Karten:** #1E1E1E
- **Akzentfarbe:** #C9A84C (Gold)
- **Text:** #F0F0F0 (fast weiß)
- **Schrift:** Große Texte — mindestens 16px Fließtext
- **Mobile-first** — alles auf dem Handy perfekt bedienbar
- **Viel Weißraum** — nichts gedrängt, nichts gequetscht
- Dunkles Premium-Feeling — passend zur Zielgruppe

---

## Umgebungsvariablen (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Wichtige Entscheidungen die bereits getroffen sind

- Kein kostenloses Tier beim Launch
- Zuerst nur Collector (79 €) und Estate (249 €) anbieten
- Marketing-Start: persönlich auf Oldtimermessen, nicht digital
- Erste 10–20 Kunden bekommen "Founding Member" Status mit dauerhaftem Rabatt
- Spracheingabe ist kein Premium-Feature — in allen Tarifen enthalten
- Supabase Storage Bucket heißt: `vehicle-files`
- E-Mails immer auf Deutsch

---

## Was noch NICHT existiert

- Kein Code bisher — Projekt startet jetzt
- Kein Design in Figma — direkt in Code bauen
- Domain noch nicht registriert (Arbeitstitel: GarageOS)

---

## Erster Schritt für Claude Cowork

1. Neuen Ordner `garageos` erstellen
2. Diese Datei als `CLAUDE.md` in den Ordner legen
3. Next.js Projekt initialisieren:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --eslint
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input label card badge separator avatar dropdown-menu dialog tabs
   npm install @supabase/supabase-js @supabase/ssr resend
   ```
4. `.env.local` mit den Supabase und Resend Keys befüllen
5. Mit Phase 1 beginnen: Auth → Dashboard → Fahrzeugakte

---

*Dokument erstellt: März 2026*
*Projektstatus: Planungsphase abgeschlossen — bereit zum Bauen*
