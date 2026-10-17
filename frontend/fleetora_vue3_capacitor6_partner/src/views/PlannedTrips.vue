<template>
  <div class="fl-planned-trips-page pa-4 pb-12">
    <div class="max-w-lg mx-auto">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-primary text-uppercase line-height-1">Carrier Schedule</div>
          <div class="text-h6 font-weight-bold text-slate-900">{{ $t('plannedTrips') || 'Planned Trips' }}</div>
        </div>
        <v-chip v-if="trips.plannedTrips?.length" color="primary" variant="flat" size="small" class="font-weight-bold">
          {{ trips.plannedTrips.length }} scheduled
        </v-chip>
      </div>

      <!-- Search Input -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Filter by city or client..."
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="xl"
        class="mb-4 bg-white"
        hide-details
      ></v-text-field>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="trips.plannedTrips || []"
        @click:row="editItem"
        disable-sort
        hide-default-footer
        :loading="loading && !trips.plannedTrips"
        :search="search"
        class="elevation-2 rounded-2xl border-slate bg-white overflow-hidden"
      >
        <template v-slot:[`item.clientId`]="{ item }">
          <div class="font-weight-medium text-slate-900" v-if="item.clientId">
            {{ item.clientId.firstName + ' ' + item.clientId.lastName }}
          </div>
          <div v-else class="text-slate-400">Direct Client</div>
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold text-primary">{{ formatNumber(item.price) }}</span>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center">
            <v-avatar color="primary-50" size="48" class="mb-3">
              <v-icon icon="mdi-calendar-blank-outline" color="primary" size="24"></v-icon>
            </v-avatar>
            <div class="text-subtitle-2 font-weight-bold text-slate-800">{{ $t('noRecords') || 'No Planned Trips' }}</div>
            <div class="text-caption text-slate-500">Upcoming scheduled shipments will be displayed here.</div>
          </div>
        </template>
      </v-data-table>

      <!-- Trip Detail Modal -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card class="rounded-2xl bg-white border-slate overflow-hidden">
          <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
            <div>
              <span class="text-caption opacity-80 text-uppercase">Scheduled Load</span>
              <div class="text-subtitle-1 font-weight-bold">
                {{ formatNumber(editedItem.price) }}
              </div>
            </div>
            <v-chip size="small" color="white" variant="flat" class="text-primary font-weight-bold">
              {{ editedItem.transporterId ? 'Assigned' : 'Open' }}
            </v-chip>
          </div>

          <v-card-text class="pa-4">
            <div class="mb-3">
              <span class="text-caption font-weight-bold text-slate-400">PLANNED DEPARTURE</span>
              <div class="text-body-2 font-weight-semibold text-slate-900">{{ formatDate(editedItem.start) }}</div>
            </div>

            <v-divider class="my-3 opacity-20"></v-divider>

            <!-- Route Timeline -->
            <div class="d-flex flex-column gap-2 mb-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-circle-medium" color="success" size="20" class="me-2"></v-icon>
                <div>
                  <span class="text-caption text-slate-400">From: </span>
                  <span class="text-body-2 font-weight-medium text-slate-800">{{ editedItem.from }}</span>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-icon icon="mdi-map-marker" color="error" size="18" class="me-2"></v-icon>
                <div>
                  <span class="text-caption text-slate-400">To: </span>
                  <span class="text-body-2 font-weight-medium text-slate-800">{{ editedItem.to }}</span>
                </div>
              </div>
            </div>

            <!-- Client Info -->
            <div v-if="editedItem.clientId" class="pa-3 rounded-xl bg-slate-50 border-slate mb-3">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-1">CLIENT CONTACT</span>
              <div class="text-body-2 font-weight-bold text-slate-900">
                {{ editedItem.clientId.lastName + ' ' + editedItem.clientId.firstName }}
              </div>
              <div class="text-caption text-slate-600">
                {{ formatPhoneNumber(editedItem.clientId.phone) }}
              </div>
            </div>

            <!-- Merchandise Info -->
            <div v-if="editedItem.marchandise" class="pa-3 rounded-xl bg-slate-50 border-slate">
              <span class="text-caption font-weight-bold text-slate-400 d-block mb-1">CARGO SPECIFICATIONS</span>
              <div class="d-flex flex-wrap gap-3 text-caption text-slate-700">
                <div>Weight: <strong>{{ editedItem.marchandise.weight || 'Standard' }}</strong></div>
                <div>Type: <strong>{{ editedItem.marchandise.type || 'General Freight' }}</strong></div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0 d-flex gap-2">
            <v-btn
              variant="tonal"
              color="slate-600"
              rounded="xl"
              class="flex-grow-1"
              @click="dialog = false"
            >
              Close
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              rounded="xl"
              class="flex-grow-1 font-weight-bold"
              v-if="!editedItem.transporterId"
              @click="accept(editedItem)"
              :loading="loading"
            >
              Accept Load
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              rounded="xl"
              class="flex-grow-1 font-weight-bold"
              v-if="editedItem.transporterId"
              @click="startTrip(editedItem)"
              :loading="loading"
            >
              Start Trip
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from "@/stores/auth"
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const router = useRouter()
const trips = useTripsStore()
const auth = useAuthStore()

const dialog = ref(false)
const headers = ref([
  { text: 'Client', align: 'start', sortable: false, value: 'clientId' },
  { text: 'Origin', value: 'from' },
  { text: 'Destination', value: 'to' },
  { text: 'Price (DZD)', value: 'price' }
])
const editedIndex = ref(-1)
const editedItem = ref({})
const defaultItem = ref({})
const loading = ref(false)
const search = ref('')

watch(dialog, (diaNew) => {
  if (!diaNew) close()
})

onMounted(() => {
  trips.getTripsByVehicleId().finally(() => {
    loading.value = false
  })
  setTimeout(() => {
    loading.value = false
  }, 1500)
})

const formatDate = (value) => {
  return value ? moment(value).locale(locale.value || 'fr').format('dddd, MMMM Do YYYY, h:mm a') : ''
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value || 'fr-FR', { style: 'currency', currency: 'DZD' }).format(value || 0)
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

const editItem = (e, { item }) => {
  editedIndex.value = (trips.getPlannedTrips || []).indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

const close = () => {
  dialog.value = false
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value)
    editedIndex.value = -1
  })
}

const accept = (trip) => {
  loading.value = true
  auth.getLSUserInfo().then(async (ls) => {
    try {
      trip.transporterId = ls?.user?._id
      trips.updateTrip(trip).then(() => {
        loading.value = false
        trips.getTripsByVehicleId()
        dialog.value = false
      })
    } catch (error) {
      loading.value = false
    }
  }).catch(() => {
    loading.value = false
  })
}

const startTrip = (trip) => {
  loading.value = true
  try {
    let data = {
      _id: trip._id,
      clientId: trip.clientId,
      transporterId: trip.transporterId,
      vehicleId: trip.vehicleId,
      price: trip.price,
      from: trip.from,
      to: trip.to,
      finished: trip.finished,
      rating: trip.rating,
      start: trip.start,
      status: "started",
      cancellation: { ...trip.cancellation }
    }
    trip.status = "started"
    trips.updateTrip(trip).then(() => {
      trips.setLSCurrentTrip(JSON.stringify(data)).then(() => {
        loading.value = false
        trips.trip = data
        router.push({ name: 'TripDetail' })
      })
    })
  } catch (error) {
    loading.value = false
  }
}
</script>

<style scoped>
.fl-planned-trips-page {
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

.text-slate-800 {
  color: #1E293B;
}

.text-slate-700 {
  color: #334155;
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

.line-height-1 {
  line-height: 1.1;
}
</style>