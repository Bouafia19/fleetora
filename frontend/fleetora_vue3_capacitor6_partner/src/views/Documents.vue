<template>
  <div class="fl-documents-page pa-4 pb-12">
    <div class="max-w-lg mx-auto">
      <v-card class="elevation-2 rounded-2xl pa-5 bg-white border-slate">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-avatar color="primary-50" size="40" class="me-3">
              <v-icon icon="mdi-shield-check-outline" color="primary" size="22"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption font-weight-bold text-primary text-uppercase line-height-1">Carrier Compliance</div>
              <div class="text-h6 font-weight-bold text-slate-900">{{ $t('documentTitle') || 'Vehicle & Driver Documents' }}</div>
            </div>
          </div>

          <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
            KYC Audit
          </v-chip>
        </div>

        <p class="text-body-2 text-slate-500 mb-4">
          {{ $t('documentParagraph') || 'Upload required administrative documents to activate full load dispatch access across Algerian territory.' }}
        </p>

        <!-- Completion Progress Bar -->
        <div class="mb-4 pa-3 rounded-xl bg-slate-50 border-slate">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-slate-700">Verification Readiness</span>
            <v-chip size="x-small" :color="show ? 'success' : 'primary'" variant="flat" class="font-weight-bold">
              {{ counter }} / {{ array.length || 5 }} Completed
            </v-chip>
          </div>
          <v-progress-linear
            color="primary"
            rounded="pill"
            height="8"
            :model-value="(counter / (array.length || 1)) * 100"
          ></v-progress-linear>
        </div>

        <!-- Loading State -->
        <div v-if="!users.images" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="40" width="3"></v-progress-circular>
          <div class="text-caption text-slate-500 mt-2">Checking document status...</div>
        </div>

        <!-- Document Items List -->
        <v-list v-else density="comfortable" class="pa-0 mb-4">
          <v-card
            v-for="(item, index) in array" 
            :key="index"
            variant="outlined"
            rounded="xl"
            class="mb-2 fl-doc-card border-slate"
            role="button"
            tabindex="0"
            :aria-label="`Manage ${$t(item.title)}`"
            @click="getRoute(item)"
            @keydown.enter="getRoute(item)"
          >
            <div class="d-flex align-center justify-space-between pa-3">
              <div class="d-flex align-center">
                <v-avatar :color="item.done ? 'emerald-lighten-4' : 'primary-50'" size="38" class="me-3">
                  <v-icon :color="item.done ? 'success' : 'primary'" size="20">
                    {{ item.done ? 'mdi-check-circle' : 'mdi-file-upload-outline' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold text-slate-900">{{ $t(item.title) }}</div>
                  <div class="text-caption" :class="item.done ? 'text-success' : 'text-slate-400'">
                    {{ item.done ? 'Verified & On File' : 'Pending Upload' }}
                  </div>
                </div>
              </div>

              <div class="d-flex align-center">
                <v-chip
                  size="x-small"
                  :color="item.done ? 'success' : 'amber-darken-1'"
                  variant="tonal"
                  class="font-weight-bold me-2"
                >
                  {{ item.done ? 'Completed' : 'Action Required' }}
                </v-chip>
                <v-icon icon="mdi-chevron-right" size="18" color="slate-400" class="fl-mirror-rtl"></v-icon>
              </div>
            </div>
          </v-card>
        </v-list>

        <!-- Error Alert -->
        <v-fade-transition>
          <v-alert
            v-if="err"
            variant="tonal"
            type="error"
            rounded="xl"
            density="comfortable"
            class="mb-4 text-caption"
            closable
            @click:close="err = ''"
          >
            {{ $t(err) || err }}
          </v-alert>
        </v-fade-transition>

        <!-- Submit For Review Button -->
        <v-btn
          v-if="show"
          color="primary"
          block
          size="large"
          rounded="xl"
          class="font-weight-bold elevation-2"
          :loading="loading"
          @click="submit"
          aria-label="Submit documents for KYC review"
        >
          <v-icon icon="mdi-send-check" start></v-icon>
          {{ $t('submit') || 'Submit All for Compliance Approval' }}
        </v-btn>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

const users = useUsersStore()
const auth = useAuthStore()
const router = useRouter()

const items = ref([
  { id: 1, title: 'grayCard', done: false },
  { id: 2, title: 'commercialRegister', done: false },
  { id: 3, title: 'transportCard', done: false },
  { id: 4, title: 'trafficPermit', done: false },
  { id: 5, title: 'id', done: false }
])

const user = ref(null)
const loading = ref(false)
const show = ref(false)
const counter = ref(0)
const err = ref('')
const array = ref([])

const getRoute = (item) => {
  users.photo = users.images?.[item.title]
  users.title = item.title
  router.push({ name: 'Document' })
}

const submit = () => {
  loading.value = true
  users.updateUserProfile({ fileStatus: 'pending' }).then(() => {
    router.push({ name: 'Pending' })
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

const updateUi = () => {
  auth.getLSUserInfo().then((ls) => {
    counter.value = 0
    if (!users.images) return
    const keys = Object.keys(users.images)
    keys.forEach(key => {
      items.value.forEach(e => {
        if (key === e.title) {
          e.done = true
          if (!ls?.user?.legal) {
            counter.value = counter.value + 1
            if (counter.value >= 3) {
              show.value = true
            }
          } else if (ls?.user?.legal) {
            counter.value = counter.value + 1
            if (counter.value >= 5) {
              show.value = true
            }
          }
        }
      })
    })
  })
}

onMounted(() => {
  auth.getLSUserInfo().then((ls) => {
    user.value = ls?.user
    if (!user.value?.legal) {
      let array1 = items.value.filter(e => e.title !== 'commercialRegister')
      array.value = array1.filter(e => e.title !== 'transportCard')
    } else {
      array.value = items.value
    }
  })
  if (users.images) {
    updateUi()
  }
  users.loadPartnerPhotos().then(() => {
    updateUi()
  })
})
</script>

<style scoped>
.fl-documents-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-lg {
  max-width: 520px;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.bg-slate-50 {
  background-color: #F8FAFC;
}

.text-slate-900 {
  color: #0F172A;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-400 {
  color: #94A3B8;
}

.line-height-1 {
  line-height: 1.1;
}

.emerald-lighten-4 {
  background-color: #D1FAE5;
}

.fl-doc-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.fl-doc-card:hover {
  transform: translateY(-2px);
  border-color: #00366F;
}

.fl-mirror-rtl {
  transition: transform 0.2s ease;
}

[dir="rtl"] .fl-mirror-rtl {
  transform: scaleX(-1);
}
</style>