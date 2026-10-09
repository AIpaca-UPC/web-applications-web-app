<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found-page">
    <h1>404</h1>
    <p>{{ $t('notFound.description') }}</p>
    <RouterLink to="/home" class="back-link">{{ $t('common.back') }}</RouterLink>
  </main>
</template>
