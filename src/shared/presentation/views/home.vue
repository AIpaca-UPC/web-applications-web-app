<script setup>
import QuickActions from '@/bounded-contexts/alerting-and-incident-management/presentation/components/quick-actions.vue'
</script>

<template>
  <section class="page-content">
    <div class="home-actions">
      <QuickActions />
    </div>
  </section>
</template>

<style scoped>
.home-actions {
  margin-top: 2rem;
}
</style>