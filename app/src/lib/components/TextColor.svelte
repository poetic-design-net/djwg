<script lang="ts">
  export let value: { value: string };
  export let children: any;
</script>

<span style="color: {value.value}">{children}</span>