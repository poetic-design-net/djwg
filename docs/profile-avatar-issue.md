# Profilbild-Problem im Header

## Problem
Das Profilbild wird im Header nicht angezeigt, obwohl ein User eingeloggt ist. Die Debug-Logs zeigen:

1. Der User ist authentifiziert (`isAuthenticated: true`)
2. Das Profil ist nicht verfügbar (`hasProfile: false`)
3. Die Profildaten sind `undefined`

## Aktueller Status

### Datenbank
- Die `profiles` Tabelle existiert und hat die korrekten Spalten (id, username, full_name, avatar_url, etc.)
- Es gibt Beispieldaten in der Tabelle (aus profiles_rows.csv)
- Ein Trigger wurde hinzugefügt, der automatisch ein Profil erstellt, wenn sich ein neuer User registriert

### Berechtigungen
- Trigger-Funktion läuft mit `SECURITY DEFINER`
- Profiltabelle hat RLS (Row Level Security) aktiviert
- Policies:
  * `SELECT` für eigene Profile (user_id = auth.uid())
  * `UPDATE` für eigene Profile
  * `INSERT` durch den Trigger bei User-Erstellung

SQL für die Berechtigungen:
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Trigger für neue User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_public)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Komponenten
- Die HeaderAuth-Komponente ist vorbereitet, das Profilbild anzuzeigen
- Die Logik für das Fallback-Icon ist implementiert
- Die Komponente erwartet das Profil über Props

### Datenfluss
1. Layout-Server lädt das Profil aus Supabase
2. Layout-Komponente gibt die Daten an Header weiter
3. Header gibt das Profil an HeaderAuth weiter
4. HeaderAuth zeigt entweder das Profilbild oder das Standard-Icon

### Debug-Logs implementiert in
1. Layout-Server: Profil-Ladeprozess
2. Layout-Component: Empfangene Daten
3. Header-Komponente: Extrahierte Daten
4. HeaderAuth-Komponente: Verwendete Daten

## Nächste Schritte
1. Überprüfen, ob der Trigger für neue User funktioniert
2. Testen, ob die Profildaten korrekt aus der Datenbank geladen werden
3. Sicherstellen, dass die Daten korrekt durch die Komponenten-Hierarchie gereicht werden
4. Überprüfen der Berechtigungen für die Profiltabelle

## Aktuelle Debug-Logs
```
Layout Component: 
Object { hasUser: true, hasSession: true, hasProfile: false, profile: undefined, isAuthenticated: true }

Header Component Data: 
Object { data: {...}, headerSettings: undefined, hasType: false, hasLogo: false, hasAsset: false, hasUrl: false, fullLogo: undefined, hasProfile: false, profile: undefined }

HeaderAuth Component: 
Object { isAuthenticated: true, isMobile: false, hasProfile: false, profileData: null }
```

## Lösung
Das Problem wurde gelöst durch eine Änderung in der Art, wie die Profildaten geladen werden:

1. **Ursprüngliches Problem:**
   - Die Profildaten wurden im Layout-Server geladen und durch die Komponenten-Hierarchie gereicht
   - Im Dashboard funktionierte das Profilbild, weil dort die Daten client-seitig geladen wurden

2. **Implementierte Lösung:**
   - Die Header-Komponente lädt die Profildaten jetzt direkt client-seitig von Supabase
   - Verwendung der gleichen Ladestrategie wie im Dashboard
   - Profildaten werden mit `select('*')` geladen statt nur ausgewählter Felder

3. **Technische Details der Änderung:**
   ```typescript
   // Header.svelte
   let profile: any = null;

   const loadProfile = async () => {
     try {
       if (!user?.id || !supabase) return;

       const { data: profileData, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', user.id)
         .single();
       
       if (error) {
         console.error('Error loading profile in Header:', error);
         return;
       }

       profile = profileData;
     } catch (error) {
       console.error('Error in loadProfile:', error);
     }
   };

   $: {
     if (user?.id) loadProfile();
   }
   ```

4. **Warum es funktioniert:**
   - Client-seitiges Laden vermeidet potenzielle Probleme mit der Server-Session
   - Vollständige Profildaten werden geladen (`select('*')`)
   - Reaktive Aktualisierung wenn sich der User ändert
   - Gleiche Ladestrategie wie im Dashboard, wo es bereits funktionierte
   - Verwendung der OptimizedImage-Komponente für optimierte Bilddarstellung

5. **Zusätzliche Optimierung:**
   ```svelte
   <OptimizedImage
     image={profile.avatar_url}
     alt="Profilbild"
     className="h-6 w-6 rounded-full object-cover"
   />
   ```
   - Ersetzt das standard img-Element durch OptimizedImage
   - Bietet automatische Bildoptimierung und lazy loading
   - Unterstützt WebP-Format für moderne Browser
   - Verbesserte Performance durch optimierte Bildgrößen

## Vermutete Ursachen (Archiviert)
1. ~~Der Trigger erstellt möglicherweise keine Profile für bestehende User~~
2. ~~Die RLS-Policies könnten zu restriktiv sein~~
3. ✓ Die Profildaten wurden nicht optimal durch die Komponenten-Hierarchie gereicht
4. ~~Es könnte ein Problem mit der Supabase-Verbindung oder den Berechtigungen geben~~