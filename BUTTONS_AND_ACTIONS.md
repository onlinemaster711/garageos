# BUTTONS_AND_ACTIONS.md — GarageOS Buttons & Actions

Vollständige Dokumentation aller Buttons und Aktionen für alle 12 Seiten von GarageOS. Diese Referenz hilft bei UI-Design und Feature-Implementierung.

---

## 1️⃣ Dashboard (Meine Sammlung)

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/dashboard` |
| **Seiten-Titel** | Meine Sammlung |
| **Beschreibung** | Übersicht aller Fahrzeuge des Benutzers |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Fahrzeug hinzufügen** | Öffnet Fahrzeug-Hinzufügen-Seite | `/vehicles/new` | Primary (Gold) | Oben rechts neben Headline |
| **Erstes Fahrzeug hinzufügen** | Öffnet Fahrzeug-Hinzufügen-Seite | `/vehicles/new` | Primary (Gold) | Center (bei 0 Fahrzeugen) |
| **[VehicleCard]** | Öffnet Fahrzeug-Details | `/vehicles/[id]` | Card (Hover-Effect) | Grid-Layout (3-4 spalten) |

### Zusätzliche Elemente
- **TopAppBar**: Hamburger-Menu (Links zu Seiten), Logo, Benutzer-Avatar
- **BottomNav**: Mobile Navigation (Sammlung, Portfolio, Termine, Einstellungen)

---

## 2️⃣ Portfolio Liste

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/portfolio` |
| **Seiten-Titel** | Mein Portfolio |
| **Beschreibung** | Portfolio-Dashboard mit Fahrzeugübersicht |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **[Portfolio-Card]** | Öffnet Portfolio-Details | `/portfolio/[id]` | Card (Hover-Effect) | Grid-Layout (3 spalten) |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation
- **Empty State**: Text-Meldung wenn keine Fahrzeuge

---

## 3️⃣ Termine / Wartungen

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/termine` |
| **Seiten-Titel** | Wartungen & Termine |
| **Beschreibung** | Übersicht aller Wartungsaufgaben und Erinnerungen |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Alle** / **Wartungen** / **Erinnerungen** | Filter-Tabs für Tasks | Filtert aktuelle Seite | Secondary | Oben unter Headline |
| **+ Fahrzeug hinzufügen** | Öffnet Modal/Dialog | `/termine/new` | Primary (Gold) | FAB (Floating) unten rechts |
| **[Edit-Button]** | Öffnet Task-Bearbeitung | Modal-Dialog | Outline | Pro Task-Karte |
| **[Delete-Button]** | Löscht Task mit Bestätigung | API DELETE | Danger | Pro Task-Karte |
| **[Complete-Button]** | Markiert Task als erledigt | API PATCH | Success | Pro Task-Karte |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation

---

## 4️⃣ Einstellungen

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/settings` |
| **Seiten-Titel** | Einstellungen |
| **Beschreibung** | Benutzerverwaltung, Gast-Einladungen, Fahrzeugzugriff |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Benutzer einladen** | Öffnet AddUserForm | Modal/Inline-Form | Primary | In "Meine Fahrzeuge" Sektion |
| **Fahrzeug auswählen** | Öffnet Modal für Fahrzeug-Selektion | VehiclePermissionsModal | Secondary | In AddUserForm |
| **Einladung senden** | Sendet Email-Einladung | API `/api/users/add` | Primary | In AddUserForm |
| **Zugriff widerrufen** | Löscht User-Access mit Bestätigung | API `/api/users/delete` | Danger | Pro User-Reihe in UsersTable |
| **Benutzer löschen** | Öffnet DeleteUserDialog | Modal-Dialog | Danger | Pro User-Reihe in UsersTable |
| **Bestätigen** | Bestätigt Benutzer-Löschung | API DELETE | Danger | In DeleteUserDialog |
| **Abbrechen** | Schließt Dialog ohne Aktion | — | Secondary | In DeleteUserDialog |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation
- **Email-Eingabe**: In AddUserForm
- **Fahrzeug-Checkboxes**: In VehiclePermissionsModal

---

## 5️⃣ Fahrzeug Details

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/vehicles/[id]` |
| **Seiten-Titel** | [Make Model] - Fahrzeugdetails |
| **Beschreibung** | Vollständige Fahrzeugdetails mit Tabs |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Zurück zu Meine Sammlung** | Navigation zurück | `/dashboard` | Link (Text) | Oben links |
| **Fahrzeug bearbeiten** | Öffnet Bearbeitungs-Seite | `/vehicles/[id]/edit` | Primary (Gold) | Hero-Section (unten) |
| **Service buchen** | Öffnet Service-Dialog | Modal | Secondary (Outline) | Hero-Section (unten) |
| **Technische Daten** | Zeigt Tech-Data Tab | Switchtet Tab | Tab-Trigger | Tab-Navigation |
| **Versicherung & Dokumente** | Zeigt Insurance Tab | Switchtet Tab | Tab-Trigger | Tab-Navigation |
| **Fahrten** | Zeigt Drives-Tab | Switchtet Tab | Tab-Trigger | Tab-Navigation |
| **Reifen** | Zeigt Tires-Tab | Switchtet Tab | Tab-Trigger | Tab-Navigation |
| **Dokument hinzufügen** | Öffnet Upload-Dialog | Modal | Primary (Outline) | In Insurance Section |
| **+ Fahrt hinzufügen** | Öffnet Drive-Add-Form | Modal | Primary | In Drives-Tab (DrivesTab) |
| **[Edit Drive]** | Bearbeitet existierende Fahrt | Modal | Secondary | Pro Drive-Eintrag (DrivesTab) |
| **[Delete Drive]** | Löscht Fahrt mit Bestätigung | API DELETE | Danger | Pro Drive-Eintrag (DrivesTab) |
| **+ Reifen hinzufügen** | Öffnet Tires-Add-Form | Modal | Primary | In Tires-Tab (TiresTab) |
| **[Edit Tire]** | Bearbeitet existierenden Reifen | Modal | Secondary | Pro Tire-Eintrag (TiresTab) |
| **[Delete Tire]** | Löscht Reifen mit Bestätigung | API DELETE | Danger | Pro Tire-Eintrag (TiresTab) |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation
- **Hero-Stats**: Anzeige PS, 0-100 km/h (Floating Card)

---

## 6️⃣ Fahrzeug bearbeiten

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/vehicles/[id]/edit` |
| **Seiten-Titel** | Fahrzeug bearbeiten |
| **Beschreibung** | Bearbeitungsformular für Fahrzeugdaten |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Zurück** | Navigiert zurück | `/vehicles/[id]` | Link (Text) | Oben links |
| **Speichern** | Speichert Fahrzeugdaten | API PATCH `/api/vehicles/[id]` | Primary (Gold) | Unten (Form-Footer) |
| **Abbrechen** | Verwerf Änderungen, zurück | `/vehicles/[id]` | Secondary | Unten (Form-Footer) |
| **Löschen** | Öffnet Delete-Confirmation | Modal | Danger | Unten (Form-Footer) |
| **Bestätigen** | Bestätigt Fahrzeug-Löschung | API DELETE `/api/vehicles/[id]` | Danger | In Delete-Modal |
| **Abbrechen** | Schließt Delete-Modal | — | Secondary | In Delete-Modal |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation
- **Form-Inputs**: Make, Model, Year, Color, VIN, Plate, etc.

---

## 7️⃣ Fahrzeug hinzufügen

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/vehicles/new` |
| **Seiten-Titel** | Fahrzeug hinzufügen |
| **Beschreibung** | Formular zum Erstellen eines neuen Fahrzeugs |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Zurück zu Meine Sammlung** | Navigation zurück | `/dashboard` | Link (Text) | Oben links |
| **Foto hochladen** | Öffnet File-Upload-Dialog | Modal/Native | Secondary (Outline) | In Form (Foto-Section) |
| **Erstellen** | Erstellt neues Fahrzeug | API POST `/api/vehicles` | Primary (Gold) | Unten (Form-Footer) |
| **Abbrechen** | Verwerf Daten, zurück | `/dashboard` | Secondary | Unten (Form-Footer) |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation
- **Form-Inputs**: Make, Model, Year, Color, Category, etc.

---

## 8️⃣ Account Einstellungen

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/dashboard/settings` (oder `/settings`) |
| **Seiten-Titel** | Account Einstellungen |
| **Beschreibung** | Benutzerprofil, Passwort, Konto-Management |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Passwort ändern** | Öffnet Passwort-Change-Dialog | Modal | Primary | In Profile Section |
| **Profil bearbeiten** | Öffnet Profil-Edit-Form | Modal/Inline | Primary | In Profile Section |
| **Abmelden** | Logs User out | `/auth/login` | Secondary | Oben/Rechts oder Unten |
| **Konto löschen** | Öffnet Delete-Confirmation | Modal | Danger | Unten (Danger Zone) |
| **Bestätigen** | Bestätigt Konto-Löschung | API DELETE | Danger | In Delete-Modal |
| **Abbrechen** | Schließt Modal | — | Secondary | In Delete-Modal |

### Zusätzliche Elemente
- **TopAppBar**: Standard Navigation
- **BottomNav**: Mobile Navigation

---

## 9️⃣ Passwort setzen (Guest Invitation)

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/auth/set-password/[token]` |
| **Seiten-Titel** | Passwort setzen |
| **Beschreibung** | Passwort-Setup für neue Gast-Benutzer |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Passwort anzeigen** | Toggle Password-Visibility | — | Outline (Eye-Icon) | In Password-Input |
| **Passwort bestätigen anzeigen** | Toggle Confirm-Visibility | — | Outline (Eye-Icon) | In Confirm-Input |
| **Passwort setzen** | Setzt Passwort und erstellt Account | API POST `/api/auth/invite/[token]` | Primary (Gold) | Unten (Form-Footer) |
| **Zurück zum Login** | Navigation zurück | `/auth/login` | Link (Text) | Unten oder Oben |

### Zusätzliche Elemente
- **Password-Requirements**: Mindestens 8 Zeichen
- **Error-Messages**: Ungültiger Token, Token abgelaufen, etc.
- **Success-State**: "Konto erstellt! Du wirst zum Dashboard weitergeleitet."

---

## 🔟 Login

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/auth/login` |
| **Seiten-Titel** | Anmelden |
| **Beschreibung** | Login-Formular für bestehende Benutzer |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Passwort anzeigen** | Toggle Password-Visibility | — | Outline (Eye-Icon) | In Password-Input |
| **Anmelden** | Authentifiziert Benutzer | API POST `/api/auth/login` | Primary (Gold) | Unten (Form-Footer) |
| **Du hast kein Konto?** | Navigation zu Signup | `/auth/signup` | Link (Text) | Unten |
| **Passwort vergessen?** | Navigation zu Reset | `/auth/forgot-password` (optional) | Link (Text) | In Form |

### Zusätzliche Elemente
- **Form-Inputs**: Email, Password
- **Error-Messages**: Ungültige Credentials, etc.
- **Remember-Me** (optional): Checkbox "Anmelden merken"

---

## 1️⃣1️⃣ Signup

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/auth/signup` |
| **Seiten-Titel** | Registrieren |
| **Beschreibung** | Registrierungsformular für neue Benutzer |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Passwort anzeigen** | Toggle Password-Visibility | — | Outline (Eye-Icon) | In Password-Input |
| **Passwort bestätigen anzeigen** | Toggle Confirm-Visibility | — | Outline (Eye-Icon) | In Confirm-Input |
| **Registrieren** | Erstellt neues Konto | API POST `/api/auth/signup` | Primary (Gold) | Unten (Form-Footer) |
| **Du hast bereits ein Konto?** | Navigation zu Login | `/auth/login` | Link (Text) | Unten |
| **Terms akzeptieren** | Öffnet Terms Modal | Modal | Link (Text) | In Form |

### Zusätzliche Elemente
- **Form-Inputs**: Email, Password, Confirm Password
- **Checkbox**: "Ich akzeptiere die Nutzungsbedingungen"
- **Error-Messages**: Email existiert bereits, Passwörter stimmen nicht überein, etc.

---

## 1️⃣2️⃣ Landing Page

| Seiten-Info | Value |
|-------------|-------|
| **URL** | `/` oder `/landing` |
| **Seiten-Titel** | GarageOS - Deine Fahrzeugsammlung |
| **Beschreibung** | Public-facing Landing Page für nicht-angemeldete Nutzer |

### Buttons & Actions

| Button-Text | Aktion | Ziel | Style | Platzierung |
|-------------|--------|------|-------|------------|
| **Anmelden** | Navigation zu Login | `/auth/login` | Primary (Gold) | TopNav oder Hero |
| **Registrieren** | Navigation zu Signup | `/auth/signup` | Secondary | TopNav oder Hero |
| **Jetzt starten** | Navigation zu Signup | `/auth/signup` | Primary (Gold/Large) | Hero-CTA |
| **Mehr erfahren** | Scroll zu Features/Info | #features | Link (Text) | Hero |
| **[Feature-Card]** | Öffnet Modal oder scrollt zu Details | Modal/Scroll | Card | Feature-Grid |
| **Kontakt** | Öffnet Contact-Form oder mailto | Modal/Email | Secondary | Footer oder Header |
| **Datenschutz** | Öffnet Privacy-Policy | Modal oder externe Seite | Link (Text) | Footer |
| **Nutzungsbedingungen** | Öffnet Terms | Modal oder externe Seite | Link (Text) | Footer |

### Zusätzliche Elemente
- **TopAppBar/Navigation**: Logo, Menu (Links zu Features, Pricing, etc.), Login/Signup-Buttons
- **Hero-Section**: Großes CTA ("Jetzt starten")
- **Feature-Showcase**: Mehrere Feature-Cards
- **Pricing-Section** (optional): Tarif-Vergleich mit CTAs
- **Footer**: Links, Copyright, Social-Media

---

## 📊 Button-Style Übersicht

| Style-Typ | Verwendung | Beispiele |
|-----------|-----------|----------|
| **Primary (Gold)** | Hauptaktionen | "Fahrzeug hinzufügen", "Speichern", "Anmelden", "Jetzt starten" |
| **Secondary (Outline)** | Alternative Aktionen | "Abbrechen", "Service buchen", "Mehr erfahren" |
| **Danger (Red)** | Destruktive Aktionen | "Löschen", "Konto löschen", "Widerrufen" |
| **Success (Green)** | Bestätigungen | "Fahrt markiert", "Konto erstellt" |
| **Link (Text)** | Navigation | "Zurück", "Passwort vergessen?", "Datenschutz" |
| **Card** | Selektierbare Items | Vehicle-Cards, Portfolio-Cards, Feature-Cards |
| **Tab-Trigger** | Tab-Navigation | "Technische Daten", "Fahrten", "Reifen" |

---

## 🎯 Button-Platzierungs-Muster

| Platzierung | Kontext | Beispiele |
|-------------|---------|----------|
| **TopNav** | Navigation oben | Hamburger-Menu, Logo, Benutzer-Avatar |
| **Hero-Section** | Große CTAs oben | "Fahrzeug hinzufügen", "Jetzt starten" |
| **Inline** | Neben Inhalt | "Passwort ändern" neben Email |
| **Form-Footer** | Unten bei Forms | "Speichern", "Abbrechen" |
| **FAB** | Floating Action Button | "+" Buttons unten rechts |
| **Modal/Dialog** | Im Pop-Up | "Bestätigen", "Abbrechen" |
| **Card** | Pro Eintrag in Grid/Liste | Edit/Delete auf Vehicle-Cards |
| **BottomNav** | Mobile Navigation unten | Sammlung, Portfolio, Termine, Einstellungen |
| **Footer** | Ganz unten auf Seite | Links, Copyright |
| **Tab-Bar** | Tab-Navigation | Unterschiedliche Seiten-Abschnitte |

---

## 🔄 API Endpoints (Button Actions)

| Endpoint | Methode | Verwendung | Button |
|----------|---------|-----------|--------|
| `/api/auth/login` | POST | Benutzer-Login | "Anmelden" |
| `/api/auth/signup` | POST | Account-Registrierung | "Registrieren" |
| `/api/auth/invite/[token]` | GET/POST | Guest-Einladung validieren/akzeptieren | "Passwort setzen" |
| `/api/vehicles` | POST | Fahrzeug erstellen | "Fahrzeug hinzufügen" / "Erstellen" |
| `/api/vehicles/[id]` | PATCH | Fahrzeug aktualisieren | "Speichern" |
| `/api/vehicles/[id]` | DELETE | Fahrzeug löschen | "Löschen" (in Edit) |
| `/api/users/add` | POST | Gast-Einladung senden | "Einladung senden" |
| `/api/users/delete` | POST | User-Zugriff widerrufen | "Zugriff widerrufen" |
| `/api/maintenance` | POST | Wartungsaufgabe erstellen | "Erstellen" (in Termine) |
| `/api/maintenance/[id]` | PATCH | Wartungsaufgabe aktualisieren | "Speichern" (Edit) |
| `/api/maintenance/[id]` | DELETE | Wartungsaufgabe löschen | "Löschen" (pro Task) |

---

**Letzte Aktualisierung:** 2026-03-23
**Status:** Vollständige Button & Action Dokumentation ✅
