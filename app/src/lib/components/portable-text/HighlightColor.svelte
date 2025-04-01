<script lang="ts">
  export let portableText: {
    value: { value: string };
    plainTextContent: string;
  };
</script>

<span style="background-color: {portableText.value.value}">{portableText.plainTextContent}</span>