<script setup>
import { useI18n } from 'vue-i18n'
import SelectButton from 'primevue/selectbutton'

const { locale } = useI18n({ useScope: 'global' })
const languages = [
  { label: 'EN', value: 'en-US' },
  { label: 'ES', value: 'es-419' },
]
</script>

<template>
  <div class="language-switcher">
    <span class="sr-only" id="language-label">{{ $t('common.language') }}</span>
    <SelectButton
      v-model="locale"
      :options="languages"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      :aria-label="$t('common.language')"
      size="small"
    />
  </div>
</template>
