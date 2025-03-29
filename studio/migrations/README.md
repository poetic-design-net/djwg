# Ticket Migration

Diese Migration konvertiert die bestehenden Ticket-Features in das neue Format mit erweiterten Info-Texten.

## Voraussetzungen

1. **Token generieren:**
   - Öffnen Sie https://www.sanity.io/manage/project/kijh3dc6
   - API > Tokens > "Create new token"
   - Name: "Ticket Migration"
   - Permissions: "Editor"
   - Token kopieren!

2. **Dependencies installieren:**
   ```bash
   cd studio
   pnpm add -D tsx @types/node
   ```

3. **Migration ausführen:**
   ```bash
   # Token als Umgebungsvariable setzen
   export SANITY_AUTH_TOKEN="ihr-kopiertes-token"
   
   # Migration starten
   pnpm exec tsx migrations/tickets.ts
   ```

## Erwartetes Ergebnis

Die Migration:
- Lädt alle existierenden Tickets
- Konvertiert String-Features in Objekte mit `text` und `info`
- Behält existierende Feature-Objekte bei
- Führt alle Änderungen in einer Transaktion durch
- Zeigt den Fortschritt in der Konsole an

## Rollback

Falls nötig, können die Änderungen im Sanity Studio unter "History" rückgängig gemacht werden.