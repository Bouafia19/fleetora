<template>
  <div class="search-trips-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <div class="search-input-wrapper flex-1">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search by city, address, or carrier..."
          variant="solo-filled"
          flat
          density="compact"
          rounded="lg"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="search-bar"
        ></v-text-field>
      </div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Loading State -->
      <div v-if="loadingTab" class="text-center py-12">
        <v-progress-circular indeterminate color="#00366F" size="44"></v-progress-circular>
        <p class="text-body-2 text-slate-500 mt-3">Loading trip history...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTrips.length === 0" class="empty-search text-center py-12">
        <div class="empty-icon-circle mx-auto mb-3">
          <v-icon color="#94A3B8" size="40">mdi-clipboard-text-search-outline</v-icon>
        </div>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">
          {{ searchQuery ? 'No Matching Deliveries' : ($t('noRecords') || 'No Trips Found') }}
        </h3>
        <p class="text-body-2 text-slate-500 mb-0">
          {{ searchQuery ? 'Try adjusting your search terms.' : 'Completed and planned logistics dispatches will appear here.' }}
        </p>
      </div>

      <!-- Trip Cards List -->
      <div v-else class="trips-cards-list">
        <v-card
          v-for="trip in filteredTrips"
          :key="trip._id"
          class="trip-history-card mb-3 pa-4"
          elevation="1"
          @click="handleClick(trip)"
        >
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="d-flex align-center">
              <v-avatar size="28" color="#E0F2FE" class="mr-2">
                <v-icon color="#00366F" size="16">mdi-truck</v-icon>
              </v-avatar>
              <span class="text-caption font-weight-bold text-slate-700">
                {{ trip.transporterId ? `${trip.transporterId.firstName} ${trip.transporterId.lastName}` : 'Fleetora Carrier' }}
              </span>
            </div>
            <v-chip
              size="small"
              :color="getStatusColor(trip.status)"
              variant="flat"
              class="font-weight-bold text-white text-capitalize"
            >
              {{ getStatusLabel(trip.status) }}
            </v-chip>
          </div>

          <!-- Origin to Destination -->
          <div class="route-display mb-3">
            <div class="d-flex align-center mb-1">
              <span class="route-marker pickup mr-2"></span>
              <span class="text-body-2 text-slate-800 text-truncate">{{ trip.from || 'Origin' }}</span>
            </div>
            <div class="d-flex align-center">
              <span class="route-marker dropoff mr-2"></span>
              <span class="text-body-2 font-weight-medium text-slate-900 text-truncate">{{ trip.to || 'Destination' }}</span>
            </div>
          </div>

          <!-- Price & Date -->
          <div class="d-flex justify-space-between align-center pt-2 border-t">
            <span class="text-caption text-slate-400">
              {{ formatDate(trip.createdAt) }}
            </span>
            <span class="text-subtitle-1 font-weight-bold text-slate-900">
              {{ formatNumber(trip.price) }}
            </span>
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const trips = useTripsStore()
const router = useRouter()

const loadingTab = ref(true)
const searchQuery = ref('')

const filteredTrips = computed(() => {
  const list = trips.getFinishedTrips || []
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(item => {
    const fromMatch = item.from?.toLowerCase().includes(q)
    const toMatch = item.to?.toLowerCase().includes(q)
    const driverMatch = item.transporterId &&
      (`${item.transporterId.firstName} ${item.transporterId.lastName}`).toLowerCase().includes(q)
    return fromMatch || toMatch || driverMatch
  })
})

const getStatusColor = (status) => {
  switch (status) {
    case 'started': return '#0EA5E9'
    case 'canceled': return '#EF4444'
    case 'planned': return '#8B5CF6'
    case 'finished': return '#10B981'
    default: return '#64748B'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'started': return t('InProgress') || 'In Progress'
    case 'canceled': return t('Canceled') || 'Canceled'
    case 'planned': return t('Planned') || 'Planned'
    case 'finished': return t('Finished') || 'Completed'
    default: return status || 'Unknown'
  }
}

const formatNumber = (val) => {
  if (!val) return '0 DZD'
  return new Intl.NumberFormat(locale.value || 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(val)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

const handleClick = (item) => {
  trips.trip = item
  router.push({ name: 'TripDetail' })
}

onMounted(() => {
  trips.fetchTrips().finally(() => {
    loadingTab.value = false
  })
})
</script>

<style scoped>
.search-trips-view {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 24px);
}

.top-nav {
  padding: 12px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.empty-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #F1F5F9;
}

.trip-history-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.trip-history-card:active {
  transform: scale(0.99);
}

.route-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.route-marker.pickup {
  background: #10B981;
}

.route-marker.dropoff {
  background: #00366F;
}

.border-t {
  border-top: 1px solid #F1F5F9;
}

.text-slate-400 {
  color: #94A3B8;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}

.flex-1 {
  flex: 1;
}
</style>