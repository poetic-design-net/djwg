-- Ermögliche Benutzern das Aktualisieren ihrer eigenen Benachrichtigungen
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ermögliche Benutzern das Löschen ihrer eigenen archivierten Benachrichtigungen
CREATE POLICY "Users can delete their archived notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id AND archived = true);