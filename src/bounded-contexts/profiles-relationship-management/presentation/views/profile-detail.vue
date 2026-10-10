
<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';

import useProfilesStore from '../../application/profiles.store.js';
import { Tutor } from '../../domain/model/tutor.entity.js';
import { Driver } from '../../domain/model/driver.entity.js';

const route = useRoute();
const router = useRouter();
const store = useProfilesStore();

const profileId = computed(() => String(route.params.id));
const profile = ref(null);
const loading = ref(true);

/**
 * Resolves the profile's domain type.
 *
 * @returns {string} Profile type label.
 */
const profileType = computed(() => {
  if (profile.value instanceof Tutor) {
    return 'Tutor';
  }

  if (profile.value instanceof Driver) {
    return 'Conductor';
  }

  return 'Perfil';
});

/**
 * Returns the profile's initials.
 *
 * @returns {string} Profile initials.
 */
const initials = computed(() => {
  if (!profile.value) return '';

  return (
      profile.value.firstName.charAt(0) +
      profile.value.lastName.charAt(0)
  ).toUpperCase();
});

/**
 * Loads the profile from local state or the API.
 *
 * @param {string} id - Profile identifier.
 */
async function loadProfile(id) {
  loading.value = true;
  profile.value = null;

  try {
    const result = await store.getProfileById(id);

    if (profileId.value === id) {
      profile.value = result;
    }
  } finally {
    loading.value = false;
  }
}

watch(
    profileId,
    id => loadProfile(id),
    { immediate: true }
);

/**
 * Navigates to the profile editing page.
 */
function editProfile() {
  router.push({
    name: 'profiles-profile-edit',
    params: { id: profileId.value }
  });
}
</script>

<template>
  <section class="page">
    <div v-if="loading" class="loading-state">
      <Skeleton width="100%" height="12rem" />
    </div>

    <Message v-else-if="!profile" severity="warn">
      No se encontró el perfil solicitado.
    </Message>

    <template v-else>
      <header>
        <h1>
          Perfil del {{ profileType.toLowerCase() }}
        </h1>

        <p>Gestiona tu información personal.</p>
      </header>

      <Card class="profile-card">
        <template #title>
          <div class="card-header">
            <h2>Información del perfil</h2>

            <Button
                label="Editar"
                icon="pi pi-pencil"
                text
                @click="editProfile"
            />
          </div>
        </template>

        <template #content>
          <div class="profile-row">
            <div class="avatar">
              {{ initials }}
            </div>

            <div>
              <strong>{{ profile.fullName }}</strong>

              <p>
                <Tag
                    :value="profileType"
                    severity="info"
                />
              </p>
            </div>
          </div>

          <div class="profile-row">
            <div>
              <strong>Teléfono</strong>

              <p>
                {{ profile.phoneNumber ?? 'No registrado' }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </template>
  </section>
</template>

<style scoped>
.page {
  padding: 32px;
  max-width: 850px;
}

.page h1 {
  color: #0f172a;
}

.page header p {
  color: #66736f;
}

.profile-card {
  margin-top: 24px;
  border-radius: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid #e7ebe9;
}

.profile-row:last-child {
  border-bottom: 0;
}

.profile-row p {
  margin: 4px 0 0;
  color: #66736f;
}

.avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #f3d9a4;
  color: #12403d;
  font-weight: 700;
  flex-shrink: 0;
}

.loading-state {
  min-height: 180px;
}

@media (max-width: 640px) {
  .page {
    padding: 16px;
  }
}
</style>
