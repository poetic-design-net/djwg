import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import Logger from '$lib/services/logger';

export async function GET(event: RequestEvent) {
  const testType = event.url.searchParams.get('type') || 'info';
  const delay = parseInt(event.url.searchParams.get('delay') || '0', 10);
  
  try {
    // Simuliere verschiedene Szenarien
    switch (testType) {
      case 'slow':
        // Simuliere langsame Antwort
        await new Promise(resolve => setTimeout(resolve, delay || 2000));
        Logger.info('Slow response test', {
          delay: delay || 2000,
          endpoint: '/api/test-logging'
        });
        break;

      case 'error':
        // Simuliere einen Fehler
        throw new Error('Test error');

      case 'supabase':
        // Teste Supabase Connection
        const { error } = await event.locals.supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (error) throw error;
        Logger.info('Supabase connection test successful');
        break;

      default:
        // Standard Info-Log
        Logger.info('Test logging endpoint called', {
          type: testType,
          timestamp: new Date().toISOString()
        });
    }

    return json({
      success: true,
      message: `Logging test (${testType}) completed successfully`
    });

  } catch (error) {
    Logger.error('Test logging error', {
      type: testType,
      endpoint: '/api/test-logging'
    }, error instanceof Error ? error : new Error(String(error)));

    return json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}