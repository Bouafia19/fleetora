<template>
  <div class="fl-trip-detail-page pa-4 pb-12">
    <div class="max-w-md mx-auto">
      <!-- Loading State -->
      <div v-if="!currentTrip" class="text-center py-16">
        <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-3"></v-progress-circular>
        <div class="text-subtitle-2 font-weight-bold text-slate-800">Loading Shipment Status...</div>
      </div>

      <div v-else>
        <!-- Status Card -->
        <v-card class="elevation-2 rounded-2xl pa-4 bg-white border-slate mb-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-avatar color="primary-50" size="40" class="me-3">
                <v-icon icon="mdi-truck-check-outline" color="primary" size="22"></v-icon>
              </v-avatar>
              <div>
                <span class="text-caption text-slate-400 font-weight-bold">SHIPMENT ID</span>
                <div class="text-subtitle-1 font-weight-bold text-slate-900">
                  #{{ (currentTrip._id || 'FL-78902').slice(-6).toUpperCase() }}
                </div>
              </div>
            </div>

            <v-chip
              :color="currentTrip.finished ? 'success' : (currentTrip.status === 'accepted' ? 'primary' : 'warning')"
              variant="flat"
              class="font-weight-bold text-uppercase"
              size="small"
            >
              {{ currentTrip.finished ? 'Completed' : (currentTrip.status || 'Active') }}
            </v-chip>
          </div>

          <!-- Price & Payment Summary -->
          <div class="d-flex align-center justify-space-between pa-3 rounded-xl bg-slate-50 border-slate mt-2">
            <div>
              <span class="text-caption text-slate-500 d-block">Agreed Total Fare</span>
              <span class="text-h6 font-weight-bold text-primary">
                {{ formatNumber(currentTrip.price || 4500) }} <span class="text-caption text-slate-500">DZD</span>
              </span>
            </div>
            <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
              Pay on Delivery
            </v-chip>
          </div>
        </v-card>

        <!-- Carrier Info Card -->
        <v-card class="elevation-2 rounded-2xl pa-4 bg-white border-slate mb-4">
          <div class="text-overline font-weight-bold text-primary mb-2 line-height-1">ASSIGNED TRANSPORTER</div>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar size="48" class="elevation-1 border-light me-3">
                <v-img :src="avatar" alt="Driver"></v-img>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-slate-900">
                  {{ currentTrip.transporterId ? `${currentTrip.transporterId.firstName} ${currentTrip.transporterId.lastName || ''}` : 'Transporter In Dispatch' }}
                </div>
                <div class="text-caption text-slate-500">
                  {{ currentTrip.transporterId ? formatPhoneNumber(currentTrip.transporterId.phone) : 'Assigning driver nearby' }}
                </div>
              </div>
            </div>

            <v-btn
              v-if="currentTrip.transporterId"
              icon="mdi-phone"
              variant="tonal"
              color="success"
              size="small"
              :href="`tel:${currentTrip.transporterId.phone}`"
              aria-label="Call Transporter"
            ></v-btn>
          </div>

          <!-- Driver Rating if completed -->
          <div v-if="currentTrip.finished" class="text-center mt-4 pt-3 border-t-slate">
            <div class="text-caption font-weight-bold text-slate-600 mb-1">Rate Carrier Service</div>
            <v-rating
              v-model="currentTrip.rating"
              active-color="amber"
              color="slate-300"
              density="compact"
              @update:modelValue="stateUpdate"
            ></v-rating>
          </div>
        </v-card>

        <!-- Route Timeline Card -->
        <v-card class="elevation-2 rounded-2xl pa-4 bg-white border-slate mb-4">
          <div class="text-overline font-weight-bold text-primary mb-2 line-height-1">SHIPMENT WAYPOINTS</div>
          <div class="d-flex flex-column gap-3 my-2">
            <div class="d-flex align-start">
              <v-icon icon="mdi-circle-medium" color="success" size="24" class="me-2 mt-n1"></v-icon>
              <div>
                <span class="text-caption font-weight-bold text-slate-400">PICKUP ADDRESS</span>
                <div class="text-body-2 font-weight-semibold text-slate-800">
                  {{ currentTrip.from || "Port d'Alger, Algiers" }}
                </div>
              </div>
            </div>

            <div class="d-flex align-start">
              <v-icon icon="mdi-flag-checkered" color="error" size="20" class="me-2 mt-n1"></v-icon>
              <div>
                <span class="text-caption font-weight-bold text-slate-400">DELIVERY DESTINATION</span>
                <div class="text-body-2 font-weight-semibold text-slate-800">
                  {{ currentTrip.to || "Zone Industrielle Oued Smar, Algiers" }}
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <!-- Cancel Shipment Action (if active) -->
        <div v-if="!currentTrip.finished && currentTrip.status !== 'canceled'" class="mt-4">
          <v-fade-transition>
            <v-alert
              v-if="error"
              variant="tonal"
              type="error"
              rounded="xl"
              class="mb-3 text-caption"
              closable
              @click:close="error = ''"
            >
              {{ error }}
            </v-alert>
          </v-fade-transition>

          <v-btn
            variant="tonal"
            color="error"
            rounded="xl"
            block
            size="large"
            class="font-weight-bold"
            :loading="loading"
            @click="cancelDialog = true"
          >
            Cancel Shipment Request
          </v-btn>
        </div>

        <!-- Cancel Confirmation Dialog -->
        <v-dialog v-model="cancelDialog" max-width="360px">
          <v-card class="rounded-2xl pa-5 bg-white text-center">
            <v-avatar color="error-lighten-4" size="52" class="mx-auto mb-3">
              <v-icon icon="mdi-alert-circle-outline" color="error" size="30"></v-icon>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">Cancel Shipment?</div>
            <p class="text-body-2 text-slate-600 mb-4">
              Are you sure you want to cancel this dispatch request? This cannot be undone.
            </p>
            <div class="d-flex align-center gap-2">
              <v-btn
                variant="tonal"
                color="slate-600"
                rounded="xl"
                class="flex-grow-1"
                @click="cancelDialog = false"
              >
                Keep Active
              </v-btn>
              <v-btn
                color="error"
                variant="flat"
                rounded="xl"
                class="flex-grow-1 font-weight-bold"
                :loading="loading"
                @click="submitCancel"
              >
                Yes, Cancel
              </v-btn>
            </div>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTripsStore } from '@/stores/trips'

const { locale } = useI18n()
const trips = useTripsStore()

const reason = ref('')
const error = ref('')
const loading = ref(false)
const cancelDialog = ref(false)
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

const currentTrip = computed(() => {
  return trips.getTrip || trips.trip || {
    _id: 'FL-908123',
    from: "Port d'Alger, Algiers",
    to: "Zone Industrielle Oued Smar, Algiers",
    price: 4800,
    status: 'in-dispatch',
    finished: false
  }
})

const submitCancel = () => {
  loading.value = true
  error.value = ''
  cancelDialog.value = false
  if (trips.getSocket && currentTrip.value?.transporterId?.room) {
    trips.socket.emit('clientResponse', 'cancellation', currentTrip.value.transporterId.room)
  }
  
  if (currentTrip.value?._id) {
    trips.checkAnnulationOfTrip({ id: currentTrip.value._id, reason: reason.value }).finally(() => {
      loading.value = false
    })
  } else {
    loading.value = false
  }
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value || 'fr-FR', { maximumFractionDigits: 0 }).format(value || 0)
}

const formatPhoneNumber = (value) => {
  if (!value) return ''
  let cleaned = ('' + value).replace(/\D/g, '')
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/)
  if (match) {
    return '(+' + match[1] + ') ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5]
  }
  return value
}

const stateUpdate = () => {
  if (!currentTrip.value?._id) return
  let obj = {
    _id: currentTrip.value._id,
    rating: currentTrip.value.rating
  }
  trips.updateTrip(obj)
}

onMounted(() => {
  if (!trips.getTrip) {
    trips.fetchTrips()
  }
})
</script>

<style scoped>
.fl-trip-detail-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-md {
  max-width: 440px;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.border-light {
  border: 2px solid #E2E8F0;
}

.border-t-slate {
  border-top: 1px solid #E2E8F0;
}

.line-height-1 {
  line-height: 1.1;
}

.text-slate-900 {
  color: #0F172A;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-600 {
  color: #475569;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-400 {
  color: #94A3B8;
}
</style>