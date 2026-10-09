<script setup>
import { RouterLink } from 'vue-router'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { moduleCatalog } from '../../domain/module-catalog.js'
</script>

<template>
  <section class="page-content">
    <p class="eyebrow">{{ $t('home.eyebrow') }}</p>
    <h1>{{ $t('home.title') }}</h1>
    <p class="lead">{{ $t('home.description') }}</p>
    <div class="status-bar">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      {{ $t('home.ready') }}
    </div>
    <h2 class="section-heading">{{ $t('home.sectionsTitle') }}</h2>
    <div class="module-grid">
      <RouterLink v-for="module in moduleCatalog" :key="module.id" :to="module.path" class="module-link">
        <Card class="module-card">
          <template #content>
            <div class="module-card-top">
              <span class="module-icon"><i class="pi" :class="module.icon" aria-hidden="true"></i></span>
              <Tag :value="$t('common.pending')" severity="secondary" />
            </div>
            <h3>{{ $t(module.titleKey) }}</h3>
            <p>{{ $t('home.moduleDescription') }}</p>
            <span class="module-open">{{ $t('common.open') }} <i class="pi pi-arrow-right" aria-hidden="true"></i></span>
          </template>
        </Card>
      </RouterLink>
    </div>
  </section>
</template>
