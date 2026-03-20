# GarageOS Farbpalette — Premium Design System

## Neue Farben (2026)
Eleganter, luxuriöser Look mit wärmeren & einladenderen Tönen

### Primärfarben
| Name | Hex | RGB | Verwendung |
|------|-----|-----|-----------|
| **Navy** | `#0A1A2F` | rgb(10, 26, 47) | Hintergrund, Hauptelemente |
| **Gold** | `#E5C97B` | rgb(229, 201, 123) | Akzente, Highlights, Call-to-Actions |
| **Grau** | `#E6E6E6` | rgb(230, 230, 230) | Text, UI-Elemente |
| **Charcoal** | `#2A2D30` | rgb(42, 45, 48) | Karten, Container, Panels |

### Sekundärfarben (Border & Abstufungen)
| Hex | RGB | Verwendung |
|-----|-----|-----------|
| `#3D4450` | rgb(61, 68, 80) | Leichte Borders, Hover-States |
| `#4A5260` | rgb(74, 82, 96) | Mittlere Borders, Separatoren |
| `#5A6270` | rgb(90, 98, 112) | Dunklere Borders, Dividers |
| `#454A55` | rgb(69, 74, 85) | Card-Borders, Input-Borders |

### Accent-Farben
| Hex | RGB | Verwendung |
|-----|-----|-----------|
| `#E5799F` | rgb(229, 121, 159) | Error, Logout, Destruktive Aktionen |

---

## Alte Farben → Neue Farben (Mapping)
Automatisch ersetzt in allen Dateien:

```
#0A0A0A  →  #0A1A2F  (Navy)
#C9A84C  →  #E5C97B  (Gold)
#F0F0F0  →  #E6E6E6  (Grau)
#1E1E1E  →  #2A2D30  (Charcoal)
#2A2A2A  →  #3D4450  (Light Border)
#333333  →  #4A5260  (Medium Border)
#444444  →  #5A6270  (Dark Border)
#3A3A3A  →  #454A55  (Card Border)
#FF6B6B  →  #E5799F  (Warm Red/Pink)
```

---

## Änderungen pro Komponente

### ✅ Header (`src/components/layout/header.tsx`)
- Navigation: **Fahrzeuge | Termine | Portfolio** (Einstellungen entfernt)
- User Dropdown: Profile Header + Logout Button
- Neue Farben überall angewendet
- Responsive Design erhalten

### ✅ Alle anderen Komponenten
**645 Farb-Vorkommen automatisch ersetzt:**
- 132x Navy (#0A1A2F)
- 179x Gold (#E5C97B)
- 221x Grau (#E6E6E6)
- 113x Charcoal (#2A2D30)
- Plus alle Border- & Abstufungsfarben

**Betroffene Dateien:**
- `/src/app/dashboard/*`
- `/src/app/auth/*`
- `/src/components/**`
- `/src/app/globals.css`

---

## Verifizierung
✓ **npm run build**: Erfolgreich kompiliert (1413ms)
✓ **TypeScript**: Keine Fehler (1723ms)
✓ **Alte Farben**: 0 Vorkommen (alle ersetzt)

---

## Design-Philosophie
- **Luxuriös**: Tiefes Navy mit warmem Gold
- **Elegant**: Softer Grau statt reines Weiß
- **Professionell**: Konsistente Abstufungen für Kontrast
- **Einladend**: Wärmere Töne als vorher

---

## Zukünftige Farbänderungen
Falls weitere Anpassungen nötig: Immer alle Farben vom neuen Standard verwenden:
```bash
# Template für zukünftige Ersetzungen:
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i '' 's/ALTE_FARBE/NEUE_FARBE/g' {} +
```
