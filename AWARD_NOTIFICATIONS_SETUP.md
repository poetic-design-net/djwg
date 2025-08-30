# Award Notifications System - Setup Guide

## Überblick

Das Award Notification System benachrichtigt Admins automatisch, wenn neue Award-Einreichungen hochgeladen werden. Es umfasst:

- 🔔 **In-App Notifications** mit Real-time Updates
- 📧 **Email-Benachrichtigungen** an alle Admins
- 📊 **Dashboard Badge** mit ungelesenen Zählern
- 🎯 **Prioritätssystem** für große Dateien

## Setup-Schritte

### 1. Datenbank-Migration ausführen

```bash
# Führe die Migrationen aus
supabase db push
```

Dies erstellt:
- `award_notifications` Tabelle
- Database Trigger für neue Uploads
- Views und Helper-Funktionen
- RLS Policies

### 2. Edge Function deployen

```bash
# Deploy die Email-Notification Edge Function
supabase functions deploy send-award-notification
```

### 3. Umgebungsvariablen setzen

In Supabase Dashboard unter Settings > Edge Functions > send-award-notification:

```env
RESEND_API_KEY=your_resend_api_key_here
PUBLIC_SITE_URL=https://yourdomain.com
```

### 4. Email-Provider (Resend) einrichten

1. Account bei [Resend.com](https://resend.com) erstellen
2. Domain verifizieren
3. API Key generieren
4. API Key in Supabase Edge Function Secrets speichern

### 5. Webhook konfigurieren (Alternative zu pg_net)

Falls pg_net nicht verfügbar ist, können Sie einen Database Webhook einrichten:

1. Gehe zu Supabase Dashboard > Database > Webhooks
2. Erstelle neuen Webhook:
   - **Name**: award-email-notification
   - **Table**: award_notifications
   - **Events**: INSERT
   - **URL**: `https://YOUR_PROJECT.supabase.co/functions/v1/send-award-notification`
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     Content-Type: application/json
     ```

## Funktionsweise

### Workflow

1. **User lädt Award-Video hoch** → Upload über AwardUploader Component
2. **Supabase Trigger aktiviert** → `handle_new_award_upload()` Function
3. **Notification erstellt** → Eintrag in `award_notifications` Tabelle
4. **Email-Trigger aktiviert** → Edge Function wird aufgerufen
5. **Emails werden versendet** → An alle Admins via Resend
6. **Real-time Update** → Dashboard zeigt neue Notification sofort
7. **Badge Update** → Ungelesene Zähler wird erhöht

### Components

#### Frontend
- **AwardNotifications.svelte**: Real-time Notification Component für Admins
- **AwardUploader.svelte**: Upload Component mit Fortschrittsanzeige
- **Award.svelte**: Award Dashboard mit Einreichungsübersicht

#### Backend
- **award_notifications Table**: Speichert alle Notifications
- **handle_new_award_upload() Trigger**: Erstellt Notifications bei neuen Uploads
- **send-award-notification Edge Function**: Versendet Emails via Resend
- **Real-time Subscriptions**: Live-Updates über Supabase Realtime

## Features

### In-App Notifications
- 🔔 Bell-Icon mit ungelesenen Zähler
- Real-time Updates ohne Page-Refresh
- Prioritätssystem (Normal, Hoch, Dringend)
- Markieren als gelesen/archiviert
- Direktlink zu Sanity Studio

### Email-Benachrichtigungen
- HTML-formatierte Emails mit modernem Design
- Submission-Details (Name, Email, Datei)
- One-Click Link zu Sanity Studio
- Fallback Plain-Text Version
- Automatisches Retry bei Fehlern

### Admin Dashboard
- Notification Badge in der Navigationsleiste
- Dropdown mit letzten 20 Notifications
- Quick Actions (Ansehen, Als gelesen markieren)
- Archivierungsfunktion
- Zeit-relative Anzeige ("Vor 5 Minuten")

## Testing

### Test-Upload simulieren

```sql
-- Simuliere einen Award-Upload in Supabase SQL Editor
INSERT INTO public.media_uploads (
  user_id,
  original_filename,
  file_type,
  file_size,
  status,
  metadata
) VALUES (
  auth.uid(), -- Deine User ID
  'test-video.mp4',
  'video/mp4',
  50000000, -- 50MB
  'pending',
  jsonb_build_object(
    'upload_type', 'award',
    'mime_type', 'video/mp4'
  )
);
```

### Email-Test

```bash
# Teste die Edge Function manuell
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-award-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "test-id",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "fileName": "test-video.mp4",
    "fileType": "video/mp4",
    "submittedAt": "2024-01-01T12:00:00Z"
  }'
```

## Troubleshooting

### Emails werden nicht versendet
1. Prüfe Resend API Key in Edge Function Secrets
2. Verifiziere Domain in Resend Dashboard
3. Check Edge Function Logs: `supabase functions logs send-award-notification`

### Real-time Updates funktionieren nicht
1. Prüfe Supabase Realtime ist aktiviert für `award_notifications` Tabelle
2. Browser Console auf WebSocket-Fehler prüfen
3. Stelle sicher, dass User als Admin authentifiziert ist

### Notifications werden nicht erstellt
1. Prüfe `media_uploads` hat `metadata->upload_type = 'award'`
2. Check Database Trigger ist aktiv: 
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_award_upload_created';
   ```
3. Prüfe RLS Policies sind korrekt

## Best Practices

1. **Prioritäten nutzen**: Große Dateien (>100MB) werden automatisch als "Hoch" markiert
2. **Regelmäßig archivieren**: Alte Notifications archivieren für bessere Performance
3. **Email-Limits beachten**: Resend hat Limits (100 emails/day im Free Tier)
4. **Monitoring einrichten**: Überwache Edge Function Logs und Email-Bounce-Rate
5. **Fallback planen**: Alternative Benachrichtigungswege (Slack, Discord) als Backup

## Sicherheit

- Nur Admins können Notifications sehen (RLS Policy)
- Service Role Key nur in Edge Functions verwenden
- Email-Adressen nicht in Frontend-Logs ausgeben
- Rate Limiting für Upload-Endpoints implementieren

## Erweiterungsmöglichkeiten

- **Push Notifications**: Browser/Mobile Push hinzufügen
- **Slack/Discord Integration**: Webhooks zu Team-Channels
- **SMS Notifications**: Für kritische Uploads
- **Batch Processing**: Sammeln und versenden von Digest-Emails
- **Analytics**: Tracking von Response-Zeiten und Bearbeitungsdauer
- **Auto-Assignment**: Automatische Zuweisung an verfügbare Jury-Mitglieder