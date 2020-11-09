<template>
  <div class="p-3 rounded flex flex-row items-center justify-center">
    <i class="hi-inbox text-gray-400 text-2xl mr-3" />
    <slot name="message">
      <p class="text-center text-gray-400 font-semibold">Sembra che non ci siano ancora dati da analizzare.</p>
    </slot>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>