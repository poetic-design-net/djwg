<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getContext } from 'svelte';
  import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
  import { toasts } from '$lib/stores/toast';
  import { fade, slide } from 'svelte/transition';
  
  export let user: any;
  export let isAdmin: boolean = false;
  
  const supabase = getContext<SupabaseClient>('supabase');
  
  interface AwardNotification {
    id: string;
    submission_id: string;
    user_name: string;
    user_email: string;
    file_name: string;
    file_type: string;
    file_size: number;
    status: 'unread' | 'read' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    read_at: string | null;
    email_sent: boolean;
    notification_data: any;
  }
  
  let notifications: AwardNotification[] = [];
  let unreadCount = 0;
  let loading = true;
  let channel: RealtimeChannel | null = null;
  let showNotifications = false;
  
  // Lade Award-Benachrichtigungen
  async function loadNotifications() {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('award_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      notifications = data || [];
      unreadCount = notifications.filter(n => n.status === 'unread').length;
    } catch (error) {
      console.error('Fehler beim Laden der Award-Benachrichtigungen:', error);
    } finally {
      loading = false;
    }
  }
  
  // Markiere Benachrichtigung als gelesen
  async function markAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .rpc('mark_award_notification_read', { p_notification_id: notificationId });
      
      if (error) throw error;
      
      // Update local state
      notifications = notifications.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'read' as const, read_at: new Date().toISOString() }
          : n
      );
      unreadCount = notifications.filter(n => n.status === 'unread').length;
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
      toasts.error('Fehler beim Aktualisieren der Benachrichtigung');
    }
  }
  
  // Markiere alle als gelesen
  async function markAllAsRead() {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_award_notifications_read');
      
      if (error) throw error;
      
      // Update local state
      notifications = notifications.map(n => ({
        ...n,
        status: 'read' as const,
        read_at: new Date().toISOString()
      }));
      unreadCount = 0;
      
      toasts.success('Alle Benachrichtigungen als gelesen markiert');
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
      toasts.error('Fehler beim Aktualisieren der Benachrichtigungen');
    }
  }
  
  // Archiviere Benachrichtigung
  async function archiveNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('award_notifications')
        .update({ status: 'archived' })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Remove from local state
      notifications = notifications.filter(n => n.id !== notificationId);
      unreadCount = notifications.filter(n => n.status === 'unread').length;
      
      toasts.success('Benachrichtigung archiviert');
    } catch (error) {
      console.error('Fehler beim Archivieren:', error);
      toasts.error('Fehler beim Archivieren der Benachrichtigung');
    }
  }
  
  // Formatiere Dateigröße
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Formatiere Zeitstempel
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Gerade eben';
    if (seconds < 3600) return `Vor ${Math.floor(seconds / 60)} Minuten`;
    if (seconds < 86400) return `Vor ${Math.floor(seconds / 3600)} Stunden`;
    if (seconds < 604800) return `Vor ${Math.floor(seconds / 86400)} Tagen`;
    
    return date.toLocaleDateString('de-DE');
  }
  
  // Prioritäts-Farben
  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'normal': return 'text-blue-500 bg-blue-500/10';
      case 'low': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  }
  
  // Setup Real-time Subscription
  function setupRealtimeSubscription() {
    if (!isAdmin) return;
    
    channel = supabase
      .channel('award-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'award_notifications'
        },
        (payload) => {
          const newNotification = payload.new as AwardNotification;
          
          // Add to notifications array
          notifications = [newNotification, ...notifications];
          unreadCount++;
          
          // Show toast notification
          toasts.success(`🏆 Neue Award-Einreichung von ${newNotification.user_name}`);
          
          // Play notification sound (optional)
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'award_notifications'
        },
        (payload) => {
          const updatedNotification = payload.new as AwardNotification;
          
          // Update in notifications array
          notifications = notifications.map(n => 
            n.id === updatedNotification.id ? updatedNotification : n
          );
          unreadCount = notifications.filter(n => n.status === 'unread').length;
        }
      )
      .subscribe();
  }
  
  // Play notification sound
  function playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }
  
  onMount(() => {
    if (isAdmin) {
      loadNotifications();
      setupRealtimeSubscription();
    }
  });
  
  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  });
</script>

{#if isAdmin}
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      on:click={() => showNotifications = !showNotifications}
      class="relative p-2 text-gray-400 hover:text-white transition-colors"
      title="Award-Benachrichtigungen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {#if unreadCount > 0}
        <span class="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-black text-xs font-medium rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      {/if}
    </button>
    
    <!-- Mobile Backdrop -->
    {#if showNotifications}
      <div 
        class="fixed inset-0 bg-black/50 z-40 sm:hidden"
        on:click={() => showNotifications = false}
      />
    {/if}
    
    <!-- Notification Dropdown -->
    {#if showNotifications}
      <div 
        transition:slide={{ duration: 200 }}
        class="fixed sm:absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-2 w-[calc(100%-1rem)] sm:w-96 max-w-[24rem] max-h-[50vh] sm:max-h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-gray-900 border-b border-gray-800 p-3 sm:p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-medium text-white flex items-center gap-2">
              <span class="text-sm sm:text-base">🏆</span>
              <span class="text-sm sm:text-base">Award-Einreichungen</span>
              {#if unreadCount > 0}
                <span class="text-xs sm:text-sm text-green-500">({unreadCount} neu)</span>
              {/if}
            </h3>
            
            <div class="flex items-center gap-2">
              {#if unreadCount > 0}
                <button
                  on:click={markAllAsRead}
                  class="text-xs text-green-500 hover:text-green-400 transition-colors"
                >
                  <span class="hidden sm:inline">Alle als gelesen markieren</span>
                  <span class="sm:hidden">Gelesen</span>
                </button>
              {/if}
              
              <!-- Mobile Close Button -->
              <button
                on:click={() => showNotifications = false}
                class="sm:hidden p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Schließen"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Notifications List -->
        <div class="divide-y divide-gray-800">
          {#if loading}
            <div class="p-8 text-center text-gray-400">
              <svg class="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Lade Benachrichtigungen...
            </div>
          {:else if notifications.length === 0}
            <div class="p-8 text-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Keine neuen Award-Einreichungen
            </div>
          {:else}
            {#each notifications as notification (notification.id)}
              <a
                href="/jury"
                class="block p-3 sm:p-4 hover:bg-gray-800/50 transition-colors {notification.status === 'unread' ? 'bg-gray-800/30' : ''}"
                transition:fade
                on:click={() => {
                  if (notification.status === 'unread') {
                    markAsRead(notification.id);
                  }
                  showNotifications = false;
                }}
              >
                <!-- Main Content -->
                <div class="flex items-start gap-3">
                  <!-- Unread Indicator -->
                  {#if notification.status === 'unread'}
                    <span class="h-2 w-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  {:else}
                    <span class="h-2 w-2 flex-shrink-0"></span>
                  {/if}
                  
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">
                      {notification.user_name}
                    </p>
                    <p class="text-xs text-gray-400 truncate">
                      {notification.file_name}
                    </p>
                  </div>
                  
                  <!-- Time -->
                  <span class="text-xs text-gray-500 flex-shrink-0">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                </div>
              </a>
            {/each}
          {/if}
        </div>
        
        <!-- Footer -->
        {#if notifications.length > 0}
          <div class="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-3">
            <a
              href="/jury"
              class="block text-center text-sm text-green-500 hover:text-green-400 transition-colors"
            >
              Alle Einreichungen anzeigen →
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}