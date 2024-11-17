<script lang="ts">

import Herostart from '../components/hero/start.svelte';
import Cards from '../components/Cards.svelte';
import Intro from '../components/Intro.svelte';
import Testimonials from '../components/Testimonials.svelte';
import Pricing from '../components/Pricing.svelte';
import Newsletter from '../components/Newsletter.svelte';
import Logos from '../components/Logos.svelte';
</script>

<section class="relative overflow-hidden">

	<Herostart />

</section>

<section class="relative pt-20 overflow-hidden">
	<Intro />
</section>

<section class="pt-48 pb-20">
<Cards />
</section>

<section class="relative pt-36 overflow-hidden">	
	<Pricing />
</section>

<section class="relative pt-36 overflow-hidden">	
	<Logos />
</section>



<section class="relative py-36 overflow-hidden">	
	<Testimonials />
</section>



<section class="relative pt-36 overflow-hidden">	
	<Newsletter />
</section>