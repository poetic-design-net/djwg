<script lang="ts">
  export let seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  
  export let fallback = {
    title: 'DJ Workshop Germany',
    description: 'Professionelle DJ Workshops in Deutschland',
    image: 'assets/home_hero.jpg'
  };
</script>

<svelte:head>
  <title>{seo?.metaTitle || fallback.title}</title>
  <meta name="description" content={seo?.metaDescription || fallback.description} />
  
  <!-- Open Graph -->
  <meta property="og:title" content={seo?.metaTitle || fallback.title} />
  <meta property="og:description" content={seo?.metaDescription || fallback.description} />
  <meta property="og:image" content={seo?.ogImage || fallback.image} />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo?.metaTitle || fallback.title} />
  <meta name="twitter:description" content={seo?.metaDescription || fallback.description} />
  <meta name="twitter:image" content={seo?.ogImage || fallback.image} />
</svelte:head> 