<script setup>
import { RouterLink } from 'vue-router'
import Tag from 'primevue/tag'

defineProps({
  titleKey: { type: String, required: true },
  folder: { type: String, required: true },
})
</script>

<template>
  <section class="page-content">
    <p class="eyebrow">{{ $t('common.workspace') }}</p>
    <h1>{{ $t(titleKey) }}</h1>
    <Tag :value="$t('common.pending')" severity="secondary" />
    <div class="placeholder-panel">
      <span class="placeholder-icon"><i class="pi pi-code" aria-hidden="true"></i></span>
      <h2>{{ $t('placeholder.title') }}</h2>
      <p>{{ $t('placeholder.description') }}</p>
      <code>src/bounded-contexts/{{ folder }}/</code>
      <p class="placeholder-tip">{{ $t('placeholder.hint') }}</p>
      <RouterLink to="/home" class="back-link">
        <i class="pi pi-arrow-left" aria-hidden="true"></i>{{ $t('common.back') }}
      </RouterLink>
    </div>
  </section>
</template>