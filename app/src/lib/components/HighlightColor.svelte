<script lang="ts">
  export let value: { value: string };
  export let children: any;
</script>

<span style="background: {value.value}">{children}</span>