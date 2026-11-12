<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import LanguageSwitcher from './language-switcher.vue'
import FooterContent from './footer-content.vue'
import {modulesForRole} from '../../domain/module-catalog.js'
import {computed} from "vue";
import accessProfileStore from "@/shared/application/access-profile.store.js";

const route = useRoute()
const router = useRouter()
const accessProfile = accessProfileStore()

/** Returns to the access screen so another experience can be reviewed. */
async function changeRole() {
  accessProfile.clearProfile()
  await router.push({ name: 'access' })
}

const modules = computed(() => modulesForRole(accessProfile.role))

const activeModuleId = computed(() => {
  const matches = modules.value.filter(
      (module) => route.path === module.path || route.path.startsWith(`${module.path}/`),
  )
  if (matches.length === 0) return null
  return matches.reduce((longest, module) =>
      module.path.length > longest.path.length ? module : longest,
  ).id
})
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :aria-label="$t('nav.navigation')">
      <RouterLink to="/home" class="brand" aria-label="Rumbo">
        <img class="logo" src="../../../../public/assets/rumbo-logo.png" alt="Logo"><span>Rumbo</span>
      </RouterLink>
      <div class="sidebar-note">{{ $t('common.project') }}</div>
      <nav class="sidebar-nav" :aria-label="$t('nav.navigation')">
        <RouterLink v-if="!accessProfile.isTutor" to="/home" class="nav-item" active-class="active">
          <i class="pi pi-home" aria-hidden="true"></i>{{ $t('nav.dashboard') }}
        </RouterLink>
        <div class="nav-section-title">{{ $t('nav.workspaces') }}</div>
        <RouterLink
            v-for="module in modules"
            :key="module.id"
            :to="module.path"
            class="nav-item"
            :class="{ active: activeModuleId === module.id }"
        >
          <i class="pi" :class="module.icon" aria-hidden="true"></i>
          {{ $t(module.titleKey) }}
        </RouterLink>
      </nav>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <span class="topbar-caption">{{ $t('common.workspace') }}</span>
        <div class="topbar-actions">
          <LanguageSwitcher />
          <div v-if="accessProfile.descriptor" class="topbar-profile">
            <pv-avatar :icon="`pi ${accessProfile.descriptor.icon}`" shape="circle" size="small" />
            <span class="topbar-profile-text">
              <strong>{{ $t(accessProfile.descriptor.labelKey) }}</strong>
              <small>{{ $t('access.eyebrow') }}</small>
            </span>
            <pv-button
                icon="pi pi-sign-out"
                :label="$t('access.exit')"
                severity="secondary"
                outlined
                size="small"
                @click="changeRole"
            />
          </div>
        </div>
      </header>
      <main id="main-content" class="content">
        <RouterView />
      </main>
      <FooterContent />
    </div>
  </div>
</template>

<style scoped>
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-profile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.4rem 0.3rem 0.55rem;
  border: 1px solid var(--rumbo-border);
  border-radius: 999px;
  background: var(--rumbo-surface);
}

.topbar-profile-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.topbar-profile-text strong {
  font-size: 0.85rem;
  color: var(--rumbo-green-900);
}

.topbar-profile-text small {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: var(--rumbo-muted);
}
</style>