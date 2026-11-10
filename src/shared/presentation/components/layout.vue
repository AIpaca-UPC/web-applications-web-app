<script setup>
import { RouterLink, RouterView } from 'vue-router'
import LanguageSwitcher from './language-switcher.vue'
import FooterContent from './footer-content.vue'
import { moduleCatalog } from '../../domain/module-catalog.js'
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :aria-label="$t('nav.navigation')">
      <RouterLink to="/home" class="brand" aria-label="Rumbo">
        <img class="logo" src="../../../../public/assets/rumbo-logo.png" alt="Logo"><span>Rumbo</span>
      </RouterLink>
      <div class="sidebar-note">{{ $t('common.project') }}</div>
      <nav class="sidebar-nav" :aria-label="$t('nav.navigation')">
        <RouterLink to="/home" class="nav-item" active-class="active">
          <i class="pi pi-home" aria-hidden="true"></i>{{ $t('nav.dashboard') }}
        </RouterLink>
        <div class="nav-section-title">{{ $t('nav.workspaces') }}</div>
        <RouterLink
            v-for="module in moduleCatalog"
            :key="module.id"
            :to="module.path"
            class="nav-item"
            active-class="active"
        >
          <i class="pi" :class="module.icon" aria-hidden="true"></i>
          {{ $t(module.titleKey) }}
        </RouterLink>
      </nav>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span class="topbar-caption">{{ $t('common.workspace') }}</span>
        <LanguageSwitcher />
      </header>
      <main id="main-content" class="content">
        <RouterView />
      </main>
      <FooterContent />
    </div>
  </div>
</template>