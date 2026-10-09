<script setup>
import { useI18n } from "vue-i18n"
const { t } = useI18n()
</script>

<template>
  <footer class="absolute bottom-0 left-0 bottom-0 w-full border-none bg-primary
mt-4 border-round-md shadow-1 p-3">
    <div class="flex flex-column align-items-center justify-content-center
gap-2 text-center text-white">
      <p class="m-0 text-sm font-medium">Copyright 2026. ACME Studios</p>
      <p class="m-0 text-sm font-medium">{{ t('authoring-phrase.intro') }} <i></i>
        {{ t('authoring-phrase.use')}}
        <a
          href="https://primevue.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white font-bold no-underline hover:text-blue-100">Primevue</a>
        {{ t('authoring-phrase.author', {brand: 'ACME'}) }}
      </p>
    </div>
  </footer>

</template>

<style scoped>

</style>