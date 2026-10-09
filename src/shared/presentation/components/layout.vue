<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from "./language-switcher.vue";
import FooterContent from "./footer-content.vue";
const { t } = useI18n();
const drawer = ref(false);
const toggleDrawer = () => {
  drawer.value = !drawer.value;
}

const items = [
  { label: 'option.home', to: '/home'},
  { label: 'option.about', to: '/about'},
];

</script>

<template>
  <pv-toast></pv-toast>
  <pv-confirm-dialog></pv-confirm-dialog>
  <header class="absolute top-0 left-0 w-full">
    <pv-toolbar class="bg-primary">
      <template #start>
        <pv-button class="p-button-text" icon="pi pi-bars"
                   @click="toggleDrawer" />
        <h3>Acme Learning Center</h3>
      </template>
      <template #end>
        <div>
          <pv-button v-for="item in items" :key="item.label"
                     as-child v-slot="slotProps">
            <router-link :to="item.to" :class="slotProps['class']">
              {{ t(item.label) }}</router-link>
          </pv-button>
        </div>
        <language-switcher />
      </template>
    </pv-toolbar>
    <pv-drawer v-model:visible="drawer" />
  </header>
  <main class="mt-7">
    <router-view />
  </main>
  <footer-content />
</template>

<style scoped>

</style>