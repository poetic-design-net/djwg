<script lang="ts">
  import { onMount } from 'svelte';
  
  type LogLevel = 'info' | 'warn' | 'error';
  
  interface LogEntry {
    level: LogLevel;
    message: string;
    stack?: string;
    route_id?: string;
    created_at: string;
    context?: Record<string, unknown>;
  }

  interface PageData {
    stats: {
      last7Days: Record<string, Record<LogLevel, number>>;
      last30Days: Record<string, Record<LogLevel, number>>;
    };
    recentLogs: LogEntry[];
  }
  
  export let data: PageData;
  let selectedTimeRange = '7days';
  let selectedCategory: CategoryFilter = 'all';
  
  const levelColors: Record<LogLevel, string> = {
    info: 'bg-blue-100 text-blue-800',
    warn: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  type ErrorCategory = 'nullCheck' | 'network' | 'auth' | 'validation' | 'other';
  
  interface CategoryConfig {
    name: string;
    pattern: RegExp;
  }

  // Fehler-Kategorien definieren
  const errorCategories: Record<ErrorCategory, CategoryConfig> = {
    nullCheck: {
      name: 'Null/Undefined Fehler',
      pattern: /(cannot read property|undefined is not|null is not|cannot read properties of null)/i
    },
    network: {
      name: 'Netzwerk Fehler',
      pattern: /(network|fetch|api|timeout|connection|supabase)/i
    },
    auth: {
      name: 'Authentifizierung',
      pattern: /(unauthorized|forbidden|auth|permission|access denied)/i
    },
    validation: {
      name: 'Validierung',
      pattern: /(invalid|validation|required|must be|expected)/i
    },
    other: {
      name: 'Sonstige',
      pattern: /.*/
    }
  };

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatLogLevel(level: LogLevel): string {
    return levelColors[level] + ' inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  }

  function isLogLevel(level: string): level is LogLevel {
    return ['info', 'warn', 'error'].includes(level);
  }

  type CategoryFilter = ErrorCategory | 'all';
  
  function getErrorCategory(log: LogEntry): ErrorCategory {
    if (log.level !== 'error') return 'other';
    
    const message = (log.message + ' ' + (log.stack || '')).toLowerCase();
    
    const category = (Object.entries(errorCategories) as [ErrorCategory, CategoryConfig][])
      .find(([_, { pattern }]) => pattern.test(message))?.[0];
    
    return category || 'other';
  }

  function getCategoryStats(logs: LogEntry[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      const category = getErrorCategory(log);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  $: statsData = selectedTimeRange === '7days' ? data.stats.last7Days : data.stats.last30Days;
  
  $: totalErrors = data.recentLogs.length;
  
  $: errorsByLevel = data.recentLogs.reduce((acc: Record<LogLevel, number>, log: LogEntry) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, { info: 0, warn: 0, error: 0 });

  $: categoryStats = getCategoryStats(data.recentLogs);

  $: filteredLogs = selectedCategory === 'all' 
    ? data.recentLogs 
    : data.recentLogs.filter(log => getErrorCategory(log) === selectedCategory);
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Error Logs Dashboard</h1>

  <!-- Statistik-Übersicht -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-2">Gesamte Logs</h3>
      <p class="text-3xl font-bold">{totalErrors}</p>
    </div>
    {#each Object.entries(errorsByLevel) as [level, count]}
      {#if isLogLevel(level)}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-2">
            <span class={formatLogLevel(level)}>{level}</span>
          </h3>
          <p class="text-3xl font-bold">{count}</p>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Fehler-Kategorien -->
  <div class="bg-white rounded-lg shadow p-6 mb-8">
    <h3 class="text-lg font-semibold mb-4">Fehler nach Kategorien</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each Object.entries(errorCategories) as [category, {name}]}
        <div class="border rounded p-4">
          <h4 class="font-medium text-sm text-gray-500">{name}</h4>
          <p class="text-2xl font-bold">{categoryStats[category] || 0}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Filter -->
  <div class="flex flex-wrap gap-4 mb-8">
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700 mb-2">Zeitraum</label>
      <select
        bind:value={selectedTimeRange}
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="7days">Letzte 7 Tage</option>
        <option value="30days">Letzte 30 Tage</option>
      </select>
    </div>
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
      <select
        bind:value={selectedCategory}
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="all">Alle Kategorien</option>
        {#each Object.entries(errorCategories) as [category, {name}]}
          <option value={category}>{name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Error Log Tabelle -->
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zeitpunkt
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategorie
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nachricht
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Route
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredLogs as log}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(log.created_at)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={formatLogLevel(log.level)}>
                  {log.level}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {errorCategories[getErrorCategory(log)].name}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {log.message}
                {#if log.stack}
                  <details class="mt-2">
                    <summary class="text-sm text-gray-500 cursor-pointer">Stack Trace</summary>
                    <pre class="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{log.stack}</pre>
                  </details>
                {/if}
                {#if log.context}
                  <details class="mt-2">
                    <summary class="text-sm text-gray-500 cursor-pointer">Context</summary>
                    <pre class="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(log.context, null, 2)}</pre>
                  </details>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {log.route_id || '-'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>