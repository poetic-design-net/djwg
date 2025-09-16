<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  interface WeeztixStatus {
    status: {
      configured: boolean;
      authenticated: boolean;
      tokenExpired: boolean;
      lastTokenUpdate: string | null;
    };
    config: {
      clientIdConfigured: boolean;
      clientSecretConfigured: boolean;
      webhookSecretConfigured: boolean;
      badgeIdConfigured: boolean;
      shopGuidConfigured: boolean;
      redirectUriConfigured: boolean;
    };
    oauth: {
      hasToken: boolean;
      tokenExpired: boolean;
      tokenCreated: string | null;
      tokenExpires: string | null;
      userInfo: any;
    };
    webhooks: {
      registered: boolean;
      list: any[];
      expectedUrl: string;
    };
    recentOrders: any[];
  }

  let status: WeeztixStatus | null = null;
  let loading = true;
  let error: string | null = null;
  let testResult: any = null;
  let testEmail = 'test@example.com';
  let claimCode = '';
  let claimResult: any = null;

  onMount(async () => {
    await loadStatus();

    // Check if we just completed OAuth
    if ($page.url.searchParams.get('weeztix') === 'connected') {
      await loadStatus();
    }
  });

  async function loadStatus() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/weeztix/status');
      if (response.ok) {
        status = await response.json();
      } else {
        error = 'Failed to load status';
      }
    } catch (err) {
      error = 'Error loading status: ' + err;
    } finally {
      loading = false;
    }
  }

  async function startOAuth() {
    window.location.href = '/api/weeztix/authorize';
  }

  async function registerWebhook() {
    try {
      const response = await fetch('/api/weeztix/register-webhook', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        alert('Webhook registered successfully!');
        await loadStatus(); // Reload to show new webhook
      } else {
        alert('Failed to register webhook: ' + (result.error || result.details));
        console.error('Webhook registration failed:', result);
      }
    } catch (err) {
      alert('Error registering webhook: ' + err);
      console.error('Webhook registration error:', err);
    }
  }

  async function testWebhook() {
    try {
      const response = await fetch('/api/weeztix/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          firstname: 'Test',
          lastname: 'User',
          status: 'completed'
        })
      });

      testResult = await response.json();
    } catch (err) {
      testResult = { error: 'Test failed: ' + err };
    }
  }

  async function claimTicket() {
    try {
      const response = await fetch('/api/weeztix/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimCode })
      });

      claimResult = await response.json();
      if (claimResult.success) {
        claimCode = '';
      }
    } catch (err) {
      claimResult = { error: 'Claim failed: ' + err };
    }
  }

  async function checkUnclaimed() {
    try {
      const response = await fetch('/api/weeztix/claim');
      claimResult = await response.json();
    } catch (err) {
      claimResult = { error: 'Check failed: ' + err };
    }
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8">Weeztix Integration Management</h1>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      {error}
    </div>
  {:else if status}
    <!-- Status Overview -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Integration Status</h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-4 rounded-lg {status.status.configured ? 'bg-green-50' : 'bg-yellow-50'}">
          <div class="text-2xl mb-2">{status.status.configured ? '✅' : '⚠️'}</div>
          <div class="text-sm font-medium">Configuration</div>
          <div class="text-xs text-gray-600">{status.status.configured ? 'Complete' : 'Incomplete'}</div>
        </div>

        <div class="text-center p-4 rounded-lg {status.status.authenticated ? 'bg-green-50' : 'bg-red-50'}">
          <div class="text-2xl mb-2">{status.status.authenticated ? '🔐' : '🔓'}</div>
          <div class="text-sm font-medium">Authentication</div>
          <div class="text-xs text-gray-600">{status.status.authenticated ? 'Connected' : 'Not Connected'}</div>
        </div>

        <div class="text-center p-4 rounded-lg {status.webhooks.registered ? 'bg-green-50' : 'bg-yellow-50'}">
          <div class="text-2xl mb-2">{status.webhooks.registered ? '🔔' : '🔕'}</div>
          <div class="text-sm font-medium">Webhooks</div>
          <div class="text-xs text-gray-600">{status.webhooks.registered ? 'Registered' : 'Not Registered'}</div>
        </div>

        <div class="text-center p-4 rounded-lg bg-blue-50">
          <div class="text-2xl mb-2">📦</div>
          <div class="text-sm font-medium">Recent Orders</div>
          <div class="text-xs text-gray-600">{status.recentOrders.length} orders</div>
        </div>
      </div>

      <!-- OAuth Section -->
      <div class="border-t pt-4">
        <h3 class="font-medium mb-3">OAuth Authentication</h3>

        {#if !status.status.authenticated}
          <button
            on:click={startOAuth}
            class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            🔐 Connect with Weeztix
          </button>
          <p class="text-sm text-gray-600 mt-2">
            Click to authorize this application with Weeztix
          </p>
        {:else}
          <div class="bg-green-50 p-4 rounded">
            <p class="text-green-800 font-medium">✅ Connected to Weeztix</p>
            {#if status.oauth.tokenExpires}
              <p class="text-sm text-gray-600 mt-1">
                Token expires: {new Date(status.oauth.tokenExpires).toLocaleString()}
              </p>
            {/if}
            {#if status.oauth.userInfo}
              <p class="text-sm text-gray-600">
                User: {status.oauth.userInfo.name || status.oauth.userInfo.email}
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Configuration Details -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Configuration Status</h2>

      <div class="space-y-2">
        {#each Object.entries(status.config) as [key, value]}
          <div class="flex items-center justify-between py-2 border-b">
            <span class="text-sm font-medium">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
            <span class="{value ? 'text-green-600' : 'text-red-600'}">
              {value ? '✅ Configured' : '❌ Missing'}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Webhook Information -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Webhook Configuration</h2>

      <div class="bg-gray-50 p-4 rounded mb-4">
        <p class="text-sm font-medium mb-2">Expected Webhook URL:</p>
        <code class="bg-white px-3 py-1 rounded border text-xs">
          {status.webhooks.expectedUrl}
        </code>
      </div>

      {#if status.webhooks.list.length > 0}
        <div class="space-y-2">
          <p class="text-sm font-medium">Registered Webhooks:</p>
          {#each status.webhooks.list as webhook}
            <div class="bg-gray-50 p-3 rounded">
              <p class="text-sm">{webhook.url}</p>
              <p class="text-xs text-gray-600">Events: {webhook.events?.join(', ')}</p>
            </div>
          {/each}
        </div>
      {:else}
        <div class="space-y-4">
          <p class="text-gray-600">No webhooks registered yet</p>
          {#if status.status.authenticated}
            <button
              on:click={registerWebhook}
              class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              📮 Register Webhook
            </button>
            <p class="text-xs text-gray-500">
              This will register the webhook URL with Weeztix to receive order notifications
            </p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Test Webhook (Development Only) -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Test Webhook</h2>

      <div class="flex gap-4 mb-4">
        <input
          type="email"
          bind:value={testEmail}
          placeholder="test@example.com"
          class="flex-1 px-3 py-2 border rounded"
        />
        <button
          on:click={testWebhook}
          class="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Send Test Webhook
        </button>
      </div>

      {#if testResult}
        <div class="bg-gray-50 p-4 rounded">
          <pre class="text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      {/if}
    </div>

    <!-- Claim Ticket -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Claim Ticket</h2>

      <div class="flex gap-4 mb-4">
        <input
          type="text"
          bind:value={claimCode}
          placeholder="WZ-XXXX-XXXX"
          class="flex-1 px-3 py-2 border rounded uppercase"
        />
        <button
          on:click={claimTicket}
          class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Claim Ticket
        </button>
      </div>

      <button
        on:click={checkUnclaimed}
        class="text-blue-600 hover:underline text-sm"
      >
        Check for unclaimed tickets with your email
      </button>

      {#if claimResult}
        <div class="mt-4 p-4 rounded {claimResult.success ? 'bg-green-50 text-green-800' : 'bg-gray-50'}">
          <pre class="text-xs overflow-auto">{JSON.stringify(claimResult, null, 2)}</pre>
        </div>
      {/if}
    </div>

    <!-- Recent Orders -->
    {#if status.recentOrders.length > 0}
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Orders</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">Order ID</th>
                <th class="text-left py-2">Email</th>
                <th class="text-left py-2">Badge</th>
                <th class="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {#each status.recentOrders as order}
                <tr class="border-b">
                  <td class="py-2 font-mono text-xs">{order.order_guid}</td>
                  <td class="py-2">{order.user_email}</td>
                  <td class="py-2">
                    {order.badge_assigned ? '✅ Assigned' : '⏳ Pending'}
                  </td>
                  <td class="py-2 text-xs">
                    {new Date(order.created_at).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}

  <div class="mt-8 text-center">
    <button
      on:click={loadStatus}
      class="text-blue-600 hover:underline"
    >
      🔄 Refresh Status
    </button>
  </div>
</div>