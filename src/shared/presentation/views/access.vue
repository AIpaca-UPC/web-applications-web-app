<script setup>
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '../components/language-switcher.vue'
import { accessRoleCatalog } from '../../domain/access-role.js'
import accessProfileStore from '../../application/access-profile.store.js'

const route = useRoute()
const router = useRouter()
const accessProfile = accessProfileStore()

/**
 * Activates the chosen role and opens the experience it leads to.
 *
 * When the person reached this screen from a protected path, that path is honoured instead
 * of the landing path of the role, so a shared link still works after the role is chosen.
 *
 * @param {import('../../domain/access-role.js').AccessRoleDescriptor} descriptor - The role picked.
 */
async function chooseRole(descriptor) {
  if (!accessProfile.selectRole(descriptor.role)) return
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : null
  await router.push(requested ?? descriptor.landingPath)
}
</script>

<template>
  <div class="access-screen">
    <section class="access-brand">
      <RouterLink to="/access" class="access-logo" aria-label="Rumbo">
        <img src="../../../../public/assets/rumbo-logo.png" alt="">
        <span>Rumbo</span>
      </RouterLink>
      <p class="access-tagline">{{ $t('access.tagline') }}</p>
      <span class="access-orb access-orb--one" aria-hidden="true"></span>
      <span class="access-orb access-orb--two" aria-hidden="true"></span>
      <p class="access-copyright">{{ $t('access.copyright') }}</p>
    </section>

    <section class="access-panel">
      <div class="access-panel-top">
        <LanguageSwitcher />
      </div>

      <div class="access-panel-body">
        <p class="access-eyebrow">{{ $t('access.eyebrow') }}</p>
        <h1 class="access-title">{{ $t('access.title') }}</h1>
        <p class="access-description">{{ $t('access.description') }}</p>

        <ul class="access-roles">
          <li v-for="descriptor in accessRoleCatalog" :key="descriptor.role">
            <button type="button" class="access-role" @click="chooseRole(descriptor)">
              <span class="access-role-icon">
                <i class="pi" :class="descriptor.icon" aria-hidden="true"></i>
              </span>
              <span class="access-role-body">
                <span class="access-role-name">{{ $t(descriptor.labelKey) }}</span>
                <span class="access-role-description">{{ $t(descriptor.descriptionKey) }}</span>
              </span>
              <i class="pi pi-arrow-right access-role-arrow" aria-hidden="true"></i>
            </button>
          </li>
        </ul>

      </div>
    </section>
  </div>
</template>

<style scoped>
.access-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.access-brand {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem;
  background: var(--rumbo-green-900);
  color: #ffffff;
}

.access-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.15rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.access-logo img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.access-tagline {
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 700;
  line-height: 1.1;
}

.access-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.access-orb--one {
  width: 18rem;
  height: 18rem;
  top: -4rem;
  right: -5rem;
  background: rgba(61, 187, 159, 0.28);
}

.access-orb--two {
  width: 26rem;
  height: 26rem;
  bottom: -12rem;
  left: -8rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.access-copyright {
  position: relative;
  z-index: 1;
  margin: auto 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
}

.access-panel {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: var(--rumbo-surface);
}

.access-panel-top {
  display: flex;
  justify-content: flex-end;
}

.access-panel-body {
  margin: auto 0;
  max-width: 28rem;
  width: 100%;
  align-self: center;
}

.access-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--rumbo-teal);
}

.access-title {
  margin: 0.4rem 0 0;
  font-size: 1.8rem;
  color: var(--rumbo-green-900);
}

.access-description {
  margin: 0.6rem 0 0;
  color: var(--rumbo-muted);
  line-height: 1.55;
}

.access-roles {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.access-role {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border: 1px solid var(--rumbo-border);
  border-radius: 0.9rem;
  background: var(--rumbo-surface);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.access-role:hover,
.access-role:focus-visible {
  border-color: var(--rumbo-teal);
  background: var(--rumbo-teal-soft);
  transform: translateY(-1px);
}

.access-role-icon {
  flex: 0 0 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.7rem;
  background: var(--rumbo-green-900);
  color: #ffffff;
}

.access-role-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.access-role-name {
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.access-role-description {
  font-size: 0.86rem;
  color: var(--rumbo-muted);
  line-height: 1.45;
}

.access-role-arrow {
  color: var(--rumbo-teal);
}

.access-notice {
  margin: 1.5rem 0 0;
  font-size: 0.8rem;
  color: var(--rumbo-muted);
  line-height: 1.5;
}

@media (max-width: 860px) {
  .access-screen {
    grid-template-columns: 1fr;
  }

  .access-brand {
    padding: 2rem 1rem;
    min-height: 14rem;
  }

  .access-panel {
    padding: 1.5rem 1rem;
  }
}
</style>