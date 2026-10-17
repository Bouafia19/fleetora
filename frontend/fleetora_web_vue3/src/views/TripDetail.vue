<template>
  <div class="fl-trip-detail-page py-6">
    <v-container class="max-w-3xl">
      <!-- Loading State -->
      <div class="text-center py-16" v-if="loadingInitial">
        <v-progress-circular indeterminate color="primary" size="48" width="4"></v-progress-circular>
        <div class="text-subtitle-2 text-slate-500 mt-4">Loading shipment details...</div>
      </div>

      <!-- Empty State -->
      <v-card v-else-if="!currentTrip" class="elevation-1 rounded-2xl pa-12 text-center bg-white border-slate">
        <v-avatar color="primary-50" size="64" class="mb-4">
          <v-icon icon="mdi-routes" color="primary" size="36"></v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold text-slate-900 mb-1">No Active Shipment Found</div>
        <div class="text-body-2 text-slate-500 mb-6 max-w-sm mx-auto">
          You don't have any pending or active freight deliveries at the moment.
        </div>
        <v-btn
          color="primary"
          rounded="lg"
          size="large"
          class="font-weight-bold px-6"
          prepend-icon="mdi-plus"
          to="/map"
        >
          Book a New Shipment
        </v-btn>
      </v-card>

      <!-- Main Trip Tracking View -->
      <div v-else>
        <!-- Header Card with Status -->
        <v-card class="elevation-2 rounded-2xl pa-6 mb-6 bg-white border-slate">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-overline font-weight-bold text-primary line-height-1">SHIPMENT TRACKING</div>
              <div class="text-h6 font-weight-bold text-slate-900">
                Trip #{{ (currentTrip._id || '').slice(-6).toUpperCase() }}
              </div>
            </div>
            <v-chip
              :color="currentTrip.finished ? 'success' : (currentTrip.status === 'accepted' ? 'info' : 'warning')"
              variant="flat"
              class="font-weight-bold px-3"
            >
              <v-icon :icon="currentTrip.finished ? 'mdi-check-circle' : 'mdi-truck-fast'" start size="small"></v-icon>
              {{ currentTrip.finished ? 'Completed' : (currentTrip.status === 'accepted' ? 'Driver Assigned' : (currentTrip.status || 'Active')) }}
            </v-chip>
          </div>

          <v-divider class="my-4 opacity-20"></v-divider>

          <!-- Driver Profile Section -->
          <div class="d-flex align-center justify-space-between flex-wrap gap-4 pa-4 rounded-xl fl-driver-card">
            <div class="d-flex align-center">
              <v-avatar size="52" class="elevation-2 me-4 border-primary">
                <v-img :src="avatar" alt="Transporter"></v-img>
              </v-avatar>
              <div>
                <div class="d-flex align-center">
                  <div class="text-subtitle-1 font-weight-bold text-slate-900">
                    {{ currentTrip.transporterId ? `${currentTrip.transporterId.firstName} ${currentTrip.transporterId.lastName || ''}` : 'Assigning Driver...' }}
                  </div>
                  <v-icon v-if="currentTrip.transporterId" icon="mdi-check-decagram" color="primary" size="18" class="ms-1"></v-icon>
                </div>
                <div class="text-body-2 text-slate-600">
                  {{ currentTrip.transporterId ? formatPhoneNumber(currentTrip.transporterId.phone) : 'Verification in progress' }}
                </div>
              </div>
            </div>

            <!-- Call Driver Quick Action -->
            <v-btn
              v-if="currentTrip.transporterId?.phone"
              :href="'tel:' + currentTrip.transporterId.phone"
              color="primary"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-phone"
              class="font-weight-medium"
              aria-label="Call assigned transporter"
            >
              Call Driver
            </v-btn>
          </div>

          <!-- Trip Rating (When Finished) -->
          <v-expand-transition>
            <div v-if="currentTrip.finished" class="mt-5 pa-4 rounded-xl bg-slate-50 text-center border-slate">
              <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">Rate Your Experience</div>
              <v-rating
                v-model="trips.trip.rating"
                active-color="amber-darken-1"
                color="slate-300"
                hover
                @update:modelValue="stateUpdate"
              ></v-rating>
              <div class="text-caption text-slate-500 mt-1">Rating: {{ currentTrip.rating || 5 }}/5 stars</div>
            </div>
          </v-expand-transition>
        </v-card>

        <!-- Route & Timeline Card -->
        <v-card class="elevation-2 rounded-2xl pa-6 mb-6 bg-white border-slate">
          <div class="text-subtitle-1 font-weight-bold text-slate-900 mb-4">Shipment Waypoints</div>

          <v-timeline align="start" side="end" density="comfortable" class="pa-0">
            <v-timeline-item dot-color="success" size="small">
              <template v-slot:icon>
                <v-icon icon="mdi-record-circle" size="14" color="white"></v-icon>
              </template>
              <div class="text-caption text-slate-400 font-weight-bold text-uppercase">Pickup Location</div>
              <div class="text-body-1 font-weight-medium text-slate-800">
                {{ currentTrip.from || 'Origin point' }}
              </div>
            </v-timeline-item>

            <v-timeline-item dot-color="error" size="small">
              <template v-slot:icon>
                <v-icon icon="mdi-flag-checkered" size="14" color="white"></v-icon>
              </template>
              <div class="text-caption text-slate-400 font-weight-bold text-uppercase">Destination</div>
              <div class="text-body-1 font-weight-medium text-slate-800">
                {{ currentTrip.to || 'Delivery point' }}
              </div>
            </v-timeline-item>
          </v-timeline>

          <v-divider class="my-4 opacity-20"></v-divider>

          <!-- Price & Financial Details -->
          <div class="d-flex align-center justify-space-between pt-2">
            <div>
              <div class="text-caption text-slate-500">Total Billed (HT)</div>
              <div class="text-h5 font-weight-bold text-primary">
                {{ formatNumber(currentTrip.price) }}
              </div>
            </div>
            <v-chip color="slate-200" variant="flat" class="text-slate-700 font-weight-semibold">
              Cash on Delivery / Direct
            </v-chip>
          </div>
        </v-card>

        <!-- Active Trip Actions (Cancellation) -->
        <v-card v-if="!currentTrip.finished && currentTrip.status === 'accepted'" class="elevation-1 rounded-2xl pa-5 bg-white border-slate">
          <v-alert
            v-if="error"
            variant="tonal"
            type="error"
            rounded="xl"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <div class="d-flex align-center justify-space-between flex-wrap gap-3">
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-800">Need to cancel?</div>
              <div class="text-caption text-slate-500">You can cancel before the driver starts the journey.</div>
            </div>
            <v-btn
              color="error"
              variant="tonal"
              rounded="lg"
              @click="dialogCancel = true"
              :loading="loading"
              prepend-icon="mdi-close-circle"
              class="font-weight-medium"
              aria-label="Request shipment cancellation"
            >
              Cancel Shipment
            </v-btn>
          </div>
        </v-card>

        <!-- Cancellation Confirmation Dialog -->
        <v-dialog v-model="dialogCancel" max-width="440px" persistent>
          <v-card class="rounded-2xl pa-5 bg-white">
            <div class="text-center mb-3">
              <v-avatar color="error-lighten-4" size="56" class="mb-3">
                <v-icon icon="mdi-alert-circle-outline" color="error" size="32"></v-icon>
              </v-avatar>
              <div class="text-h6 font-weight-bold text-slate-900">Cancel Shipment?</div>
              <div class="text-body-2 text-slate-500 mt-1">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </div>
            </div>

            <v-select
              v-model="reason"
              :items="['Change of plans', 'Driver requested cancellation', 'Found another transporter', 'Mistake in address', 'Other reason']"
              label="Reason for cancellation (optional)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
            ></v-select>

            <div class="d-flex align-center gap-3">
              <v-btn
                variant="tonal"
                color="slate-600"
                rounded="xl"
                block
                class="flex-grow-1"
                @click="dialogCancel = false"
              >
                Keep Booking
              </v-btn>
              <v-btn
                color="error"
                variant="flat"
                rounded="xl"
                block
                class="flex-grow-1 font-weight-bold"
                :loading="loading"
                @click="confirmAndCancel"
              >
                Yes, Cancel
              </v-btn>
            </div>
          </v-card>
        </v-dialog>
      </div>
    </v-container>
  </div>
</template>

<script setup>
    import { onMounted, ref, computed } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useTripsStore } from '@/stores/trips'

    const { locale } = useI18n()
    const trips = useTripsStore()

    const loadingInitial = ref(true)
    let id = ref(null),
        messages = ref([]),
        reason = ref('Change of plans'),
        error = ref(''),
        ls = ref(false),
        loading = ref(false),
        loadingMaps = ref(false),
        showArrow = ref(true),
        dialog = ref(false),
        dialogCancel = ref(false),
        myLatLng = ref(null),
        avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

    const currentTrip = computed(() => {
        return trips.getTrip || (trips.trips && trips.trips.length > 0 ? trips.trips[0] : null)
    })
       
    const confirmAndCancel = () => {
      dialogCancel.value = false
      submit()
    }

    const submit = () => {
      if (!currentTrip.value) return
      loading.value = true
      error.value = ''
      if(trips.getSocket && currentTrip.value.transporterId?.room){
          trips.socket.emit('clientResponse', 'cancellation', currentTrip.value.transporterId.room)
      }
      
      trips.checkAnnulationOfTrip({id: currentTrip.value._id, reason: reason.value})
      .catch((err) => {
        error.value = err.message || 'Failed to cancel shipment'
      })
      .finally(() => {
        loading.value = false
      })
    }
    
    const formatNumber = (value) => {
        return new Intl.NumberFormat(locale.value || 'fr', { style: 'currency', currency: 'DZD' }).format(value || 0)
    }

    const formatPhoneNumber = (value) => {
        let cleaned = ('' + value).replace(/\D/g, '')
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/)

        if (match) {
            return '(+' + match[1] + ') ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5]
        }

        return value
    }

    const stateUpdate = () => {
        if (!currentTrip.value) return
        let obj = {
            _id: currentTrip.value._id,
            rating: trips.trip.rating
        }
        trips.updateTrip(obj)
    }

    onMounted(async () => {
        loadingInitial.value = true
        try {
            if (!trips.getTrip) {
                await trips.fetchTrips()
            }
        } catch (e) {
            console.error('Error fetching trips in TripDetail:', e)
        } finally {
            loadingInitial.value = false
        }

        if (currentTrip.value) {
            messages.value[0] = {
                location: currentTrip.value.from,
                color: 'success'
            }
            messages.value[1] = {
                location: currentTrip.value.to,
                color: 'orange'
            }
        }
    })
       
   
</script>

<style scoped>
.fl-trip-detail-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}
.max-w-3xl {
  max-width: 760px;
  margin: 0 auto;
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.border-primary {
  border: 2px solid #0EA5E9;
}
.fl-driver-card {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
}
.bg-slate-50 {
  background-color: #F8FAFC;
}
.line-height-1 {
  line-height: 1.2;
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
</style>