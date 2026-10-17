<template>
  <div class="fl-profile-page pa-4">
    <div v-if="users.getUser">
      <!-- User Profile Header Card -->
      <v-card class="elevation-2 rounded-2xl pa-5 bg-white border-slate mb-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="60" class="elevation-2 border-primary me-4">
              <v-img :src="photo || avatar" alt="Profile"></v-img>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-subtitle-1 font-weight-bold text-slate-900 text-truncate">
                {{ users.getUser.firstName + ' ' + users.getUser.lastName }}
              </div>
              <div class="text-caption text-slate-500 text-truncate">
                {{ users.getUser.email || users.getUser.phone }}
              </div>
              <v-chip size="x-small" color="primary" variant="flat" class="mt-1 font-weight-bold">
                Verified Account
              </v-chip>
            </div>
          </div>

          <v-btn
            icon="mdi-pencil-outline"
            size="small"
            variant="tonal"
            color="primary"
            aria-label="Edit Profile"
            @click="$router.push({ path: `/updateProfile` })"
            title="Edit profile"
          ></v-btn>
        </div>

        <v-divider class="my-4 opacity-20"></v-divider>

        <!-- Balance / Credit Row -->
        <div class="d-flex align-center justify-space-between pa-3 rounded-xl bg-slate-50 border-slate">
          <div class="d-flex align-center">
            <v-avatar color="primary-50" size="36" class="me-3">
              <v-icon icon="mdi-wallet-outline" color="primary" size="20"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-slate-500">Fleetora Credit</div>
              <div class="text-subtitle-2 font-weight-bold text-slate-900">0.00 DZD</div>
            </div>
          </div>
          <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">
            Active
          </v-chip>
        </div>
      </v-card>

      <!-- Settings & Options List -->
      <v-card class="elevation-2 rounded-2xl pa-2 bg-white border-slate">
        <v-list density="comfortable">
          <template v-for="(item, index) in items" :key="index">
            <v-list-item
              @click="generateRoutes(item)"
              rounded="lg"
              class="my-1"
            >
              <template v-slot:prepend>
                <v-avatar size="36" :color="item.color === 'error' ? 'error-lighten-4' : 'primary-50'" class="me-3">
                  <v-icon :icon="item.icon" :color="item.color === 'error' ? 'error' : 'primary'" size="20"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title :class="['text-body-2 font-weight-medium', item.color === 'error' ? 'text-error' : 'text-slate-800']">
                {{ $t(item.title) }}
              </v-list-item-title>

              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" size="18" color="slate-400" class="fl-mirror-rtl"></v-icon>
              </template>
            </v-list-item>
            <v-divider v-if="index < items.length - 1" class="my-1 opacity-20"></v-divider>
          </template>
        </v-list>
      </v-card>
    </div>

    <div v-else class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="44" width="4"></v-progress-circular>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const users = useUsersStore()
const router = useRouter()
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
    
const items = ref([
  { title: 'notifications', icon: 'mdi-bell-ring-outline', color: 'primary', action: 'getNotifications' },
  { title: 'contactSupport', icon: 'mdi-face-agent', color: 'primary', action: 'getContactSupport' },
  { title: 'termsConditions', icon: 'mdi-shield-check-outline', color: 'primary', action: 'getTermsConditionsPage' },
  { title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out' },
])

const err = ref('')
const photo = ref(null)

const getTermsConditionsPage = () => {
  router.push({ path: `/terms&conditions` })
}

const getNotifications = () => {
  router.push({ path: `/notifications` })
}

const getContactSupport = () => {
  router.push({ path: `/contactSupport` })
}

const auth_sign_out = async () => {
  auth.account_sign_out()
}

const generateRoutes = (item) => {
  switch (item.action) {
    case 'auth_sign_out':
      auth_sign_out()
      break
    case 'getTermsConditionsPage':
      getTermsConditionsPage()
      break
    case 'getNotifications':
      getNotifications()
      break
    case 'getContactSupport':
      getContactSupport()
      break
  }
}

onMounted(() => {
  users.fetchUser()
})
</script>

<style scoped>
.fl-profile-page {
  min-height: calc(100vh - 120px);
  background-color: #F8FAFC;
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.border-primary {
  border: 2px solid #0EA5E9;
}
.bg-slate-50 {
  background-color: #F8FAFC;
}
.text-slate-900 {
  color: #0F172A;
}
.text-slate-800 {
  color: #1E293B;
}
.text-slate-500 {
  color: #64748B;
}
.text-slate-400 {
  color: #94A3B8;
}
</style>