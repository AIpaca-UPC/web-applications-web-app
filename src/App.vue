<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n({ useScope: 'global' })
watch(locale, (value) => {
  document.documentElement.lang = value
  localStorage.setItem('rumbo-language', value)
}, { immediate: true })
</script>

<template>
  <RouterView />
</template>