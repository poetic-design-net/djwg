# Architektur der Kundenbereiche

## Benutzertypen und Berechtigungen

### 1. Teilnehmer 2024
- Basis-Zugriffsrechte (Free Account)
- Automatische Badge-Zuweisung 2024
- Grundlegende Dashboard-Funktionen

### 2. Teilnehmer 2025
- Basis-Zugriffsrechte (Free Account)
- Automatische Badge-Zuweisung 2025
- Grundlegende Dashboard-Funktionen

### 3. Award Teilnehmer
#### Zusätzliche Funktionen:
- Video-Upload System
  - Unterstützung für Videomix-Uploads
  - Kategorieauswahl (Club/Festival, Mobile/Wedding DJ)
- Optionaler Foto-Upload
- Umfrage-System
- Badge-System
  - Teilnahme-Badge
  - Top 3 Sieger-Badges

### 4. Next Level DJs
#### Funktionen:
- Video-Tutorial-System
  - Kategorisierung nach Themen
  - Level-basiertes Fortschrittssystem
  - Streaming-only (kein Download)
- Musik-Download-System
  - MP3-Downloads für Recordbox & Serato
  - Free Music für Social Media
- Vertragsverwaltung
  - Vertragsdetails
  - Kündigungsmanagement
  - AGB für Musiknutzung

### 5. Partner
#### Funktionen:
- Vertragsverwaltung
- Location-Management
- Logo-Verwaltung (Upload/Download)

## Technische Implementierung

### Datenbank-Schema (Supabase)

```sql
-- Benutzerprofile mit Rollenunterscheidung
CREATE TYPE user_role AS ENUM ('participant_2024', 'participant_2025', 'award_participant', 'next_level_dj', 'partner');

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  year INTEGER,
  type VARCHAR NOT NULL,
  image_url VARCHAR
);

-- Benutzer-Badges Verknüpfung
CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Media-Uploads für Award-Teilnehmer
CREATE TABLE award_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  video_url VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  photo_url VARCHAR,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video-Tutorials
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  level INTEGER NOT NULL,
  video_url VARCHAR NOT NULL,
  mp3_download_url VARCHAR
);

-- Partner-Informationen
CREATE TABLE partner_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR NOT NULL,
  location_plan_url VARCHAR,
  logo_url VARCHAR,
  contract_details JSONB
);
```

### Berechtigungssystem

Die Zugriffsrechte werden über Row Level Security (RLS) in Supabase implementiert:

```sql
-- Beispiel RLS-Policies
CREATE POLICY "Award participants can upload videos"
ON award_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM auth.users 
  WHERE role = 'award_participant'
));

CREATE POLICY "Next Level DJs can access tutorials"
ON tutorials
FOR SELECT
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM auth.users 
  WHERE role = 'next_level_dj'
));
```

## Frontend-Implementierung

### Komponenten-Struktur

```
src/lib/components/
├── auth/
│   ├── SignIn.svelte
│   └── SignUp.svelte
├── awards/
│   ├── VideoUpload.svelte
│   └── SubmissionForm.svelte
├── tutorials/
│   ├── VideoPlayer.svelte
│   └── LevelProgress.svelte
├── partner/
│   ├── LocationManager.svelte
│   └── LogoUpload.svelte
└── badges/
    └── BadgeDisplay.svelte
```

### Routing-Struktur

```
src/routes/
├── dashboard/
│   ├── +page.svelte
│   └── +page.server.ts
├── awards/
│   ├── submit/
│   └── results/
├── tutorials/
│   ├── [category]/
│   └── [level]/
└── partner/
    ├── contract/
    └── location/
```

## Security Considerations

1. **Authentifizierung**: 
   - Implementierung über Supabase Auth
   - JWT-basierte Sitzungsverwaltung

2. **Dateizugriff**:
   - Signierte URLs für Media-Assets
   - Zeitlich begrenzte Download-Links

3. **Video-Streaming**:
   - HLS-Streaming für Tutorial-Videos
   - DRM-Integration für Premium-Inhalte

4. **Berechtigungsprüfung**:
   - Serverseitige Validierung aller Anfragen
   - Clientseitige Berechtigungsprüfung für UI-Elemente