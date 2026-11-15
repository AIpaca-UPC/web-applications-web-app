<script setup>
import {RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import LanguageSwitcher from './language-switcher.vue'
import FooterContent from './footer-content.vue'
import {modulesForRole} from '../../domain/module-catalog.js'
import {computed, ref, watch} from "vue";
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

/** @type {import('vue').Ref<boolean>} Whether the navigation drawer is open on a narrow screen. */
const isNavOpen = ref(false)

// Navigating is what the drawer is for, so opening a section closes it.
watch(() => route.path, () => { isNavOpen.value = false })

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
    <div
        v-if="isNavOpen"
        class="nav-backdrop"
        aria-hidden="true"
        @click="isNavOpen = false"
    ></div>

    <aside
        id="app-navigation"
        class="sidebar"
        :class="{ 'sidebar--open': isNavOpen }"
        :aria-label="$t('nav.navigation')"
    >
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
        <button
            type="button"
            class="nav-toggle"
            aria-controls="app-navigation"
            :aria-expanded="isNavOpen"
            :aria-label="$t('nav.navigation')"
            @click="isNavOpen = !isNavOpen"
        >
          <i class="pi" :class="isNavOpen ? 'pi-times' : 'pi-bars'" aria-hidden="true"></i>
        </button>
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
/* The drawer is a narrow-screen affordance only; the sidebar stays in place above it. */
.nav-toggle {
  display: none;
}

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

@media (max-width: 900px) {
  .nav-toggle {
    display: grid;
    place-items: center;
    flex: 0 0 2.5rem;
    height: 2.5rem;
    margin-right: 0.25rem;
    border: 1px solid var(--rumbo-border);
    border-radius: 0.7rem;
    background: var(--rumbo-surface);
    color: var(--rumbo-green-900);
    font-size: 1.1rem;
    cursor: pointer;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    width: min(17rem, 82vw);
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar--open {
    transform: translateX(0);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.35);
  }

  .nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(5, 32, 26, 0.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none;
  }
}
</style>