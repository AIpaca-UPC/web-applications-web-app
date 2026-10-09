<script setup>
import { useI18n } from 'vue-i18n';
import {useRoute, useRouter} from "vue-router";
const { t } = useI18n();
const route = useRoute();
const unavailableRoute = route.path;
</script>

<template>
  <section class="pt-6 p-4 md:p-5">
    <div class="flex flex-column gap-3">
      <h1 class="text-4x1 font-bold text-color">{{ t('page-not-found.title')}}</h1>
      <p class="m-0 line-height-3 text-color-secondary">
        {{ t('page-not-found.content', {'unavailable -route': unavailableRoute})}}</p>
      <router-link to="/home" class="text-primary font-medium">
        {{ t('page-not-found.go-home') }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>

</style>