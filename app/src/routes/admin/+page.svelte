<script lang="ts">
  interface AdminLink {
    title: string;
    href: string;
    description: string;
  }

  const adminLinks: AdminLink[] = [
    {
      title: 'Error Logs',
      href: '/admin/error-logs',
      description: 'System Fehler und Warnungen überwachen'
    },
    {
      title: 'Benutzer',
      href: '/admin/users',
      description: 'Benutzerverwaltung und Berechtigungen'
    }
  ];
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each adminLinks as link}
      <a 
        href={link.href}
        class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <h2 class="text-xl font-semibold mb-2">{link.title}</h2>
        <p class="text-gray-600">{link.description}</p>
      </a>
    {/each}
  </div>
</div>