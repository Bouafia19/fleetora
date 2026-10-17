<template>
  <BaseLayout>
    <v-container fluid class="pa-6">
      <div class="mb-4" v-if="err">
        <v-alert type="error" variant="tonal" closable>
          {{ err }}
        </v-alert>
      </div>

      <!-- Header & Action Bar -->
      <v-card class="pa-5 mb-6 rounded-2xl elevation-1 border" variant="flat">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="44" rounded="lg" class="me-3">
                <v-icon color="white">mdi-routes-clock</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-slate-800">{{ $t('Trips') }} Management</div>
                <div class="text-caption text-grey">Monitor, dispatch, and review cargo freight bookings</div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search origin, destination, client, driver..."
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              style="max-width: 320px;"
              class="me-3"
            ></v-text-field>

            <v-btn
              color="primary"
              variant="tonal"
              rounded="lg"
              @click="loadTrips"
              :loading="loadingTab"
            >
              <v-icon class="me-1">mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Trips Data Table -->
      <v-card class="rounded-2xl elevation-1 border overflow-hidden" variant="flat">
        <v-data-table
          :headers="headers"
          :items="tripsList"
          :loading="loadingTab"
          :search="search"
          hover
          class="elevation-0"
        >
          <template #item.transporterId="{ item }">
            <div v-if="item.transporterId" class="d-flex align-center py-2">
              <v-avatar color="amber-lighten-4" size="32" class="me-2">
                <v-icon color="amber-darken-3" size="small">mdi-truck</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium text-body-2">{{ item.transporterId.firstName }} {{ item.transporterId.lastName }}</div>
                <div class="text-caption text-grey">{{ item.transporterId.phone }}</div>
              </div>
            </div>
            <v-chip v-else size="x-small" color="grey" variant="tonal">Unassigned</v-chip>
          </template>

          <template #item.clientId="{ item }">
            <div v-if="item.clientId" class="d-flex align-center py-2">
              <v-avatar color="indigo-lighten-4" size="32" class="me-2">
                <v-icon color="indigo-darken-3" size="small">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium text-body-2">{{ item.clientId.firstName }} {{ item.clientId.lastName }}</div>
                <div class="text-caption text-grey">{{ item.clientId.phone }}</div>
              </div>
            </div>
            <span v-else class="text-grey">—</span>
          </template>

          <template #item.vehicleId="{ item }">
            <v-chip size="small" variant="outlined" color="primary" class="font-weight-medium">
              {{ item.vehicleId ? item.vehicleId.name : 'Standard' }}
            </v-chip>
          </template>

          <template #item.route="{ item }">
            <div class="py-1">
              <div class="d-flex align-center text-caption font-weight-medium text-slate-800">
                <v-icon size="x-small" color="success" class="me-1">mdi-circle-medium</v-icon>
                {{ item.from || 'Origin' }}
              </div>
              <div class="d-flex align-center text-caption text-grey">
                <v-icon size="x-small" color="error" class="me-1">mdi-map-marker</v-icon>
                {{ item.to || 'Destination' }}
              </div>
            </div>
          </template>

          <template #item.price="{ item }">
            <div class="font-weight-bold text-primary">
              {{ formatNumber(item.price) }}
            </div>
            <div v-if="item.distance" class="text-caption text-grey">
              {{ item.distance }} km
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              class="text-uppercase font-weight-bold"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-end">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="primary"
                aria-label="Edit Trip"
                @click="editItem(item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                color="error"
                aria-label="Delete Trip"
                @click="deleteItem(item)"
                v-if="$can('delete', 'Trips')"
              ></v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="pa-10 text-center">
              <v-avatar color="blue-grey-lighten-5" size="64" class="mb-3">
                <v-icon color="blue-grey-lighten-2" size="36">mdi-routes</v-icon>
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold text-slate-700">No Trips Found</div>
              <div class="text-caption text-grey mb-4">No freight shipments match your search criteria or are currently dispatched.</div>
              <v-btn color="primary" variant="outlined" size="small" rounded="lg" @click="loadTrips">
                <v-icon class="me-1">mdi-refresh</v-icon> Refresh Trips
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Edit Trip Dialog -->
      <v-dialog v-model="dialog" max-width="700px" scrollable>
        <v-card class="rounded-xl overflow-hidden">
          <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="white" class="me-2">mdi-routes</v-icon>
              <span>Trip Details & Dispatch Status</span>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
          </v-card-title>

          <v-card-text class="pa-5">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.from"
                  label="Origin Location"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-map-marker-radius"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.to"
                  label="Destination Location"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-map-marker-check"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.price"
                  label="Total Fare (DZD)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-cash"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.status"
                  :items="['planned', 'started', 'accepted', 'finished', 'canceled']"
                  label="Trip Status"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-progress-check"
                ></v-select>
              </v-col>

              <v-col cols="12" v-if="editedItem.status === 'canceled'">
                <v-select
                  v-model="editedItem.cancellationBy"
                  :items="['client', 'transporter', 'administrator', 'default']"
                  label="Canceled By"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
                <v-textarea
                  v-model="editedItem.cancellationReason"
                  label="Cancellation Reason"
                  rows="2"
                  variant="outlined"
                  density="comfortable"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="bg-grey-lighten-4 pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="grey-darken-1" rounded="lg" @click="close">Cancel</v-btn>
            <v-btn variant="flat" color="primary" rounded="lg" :loading="loading" @click="save">
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="dialogDelete" max-width="480px">
        <v-card class="rounded-xl pa-5 text-center">
          <v-avatar color="red-lighten-4" size="64" class="mx-auto mb-3">
            <v-icon color="error" size="32">mdi-delete-alert</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold mb-2">Delete Trip Record?</div>
          <div class="text-body-2 text-grey mb-4">
            Are you sure you want to delete this trip record? This operation cannot be undone.
          </div>
          <div class="d-flex justify-center gap-3">
            <v-btn variant="outlined" rounded="lg" @click="dialogDelete = false">Cancel</v-btn>
            <v-btn color="error" variant="flat" rounded="lg" @click="confirmDelete">Confirm Delete</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseLayout from '@/components/BaseLayout.vue'
import { useTripsStore } from '@/stores/trips'

const { locale } = useI18n()
const tripsStore = useTripsStore()

const search = ref('')
const loadingTab = ref(false)
const loading = ref(false)
const err = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const selectedTripId = ref(null)

const headers = [
  { title: 'Driver / Transporter', key: 'transporterId' },
  { title: 'Customer / Client', key: 'clientId' },
  { title: 'Vehicle Type', key: 'vehicleId' },
  { title: 'Route', key: 'route' },
  { title: 'Price & Distance', key: 'price' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const editedItem = ref({
  _id: null,
  from: '',
  to: '',
  price: 0,
  status: 'planned',
  cancellationBy: 'default',
  cancellationReason: ''
})

const tripsList = computed(() => tripsStore.getTrips || [])

const getStatusColor = (status) => {
  switch (status) {
    case 'finished': return 'success'
    case 'started':
    case 'accepted': return 'info'
    case 'planned': return 'primary'
    case 'canceled': return 'error'
    default: return 'grey'
  }
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value || 'fr', { style: 'currency', currency: 'DZD' }).format(value || 0)
}

const loadTrips = async () => {
  loadingTab.value = true
  err.value = ''
  try {
    await tripsStore.fetchTrips()
  } catch (error) {
    err.value = error.message || 'Failed to load trips'
  } finally {
    loadingTab.value = false
  }
}

const editItem = (item) => {
  editedItem.value = {
    _id: item._id,
    from: item.from,
    to: item.to,
    price: item.price,
    status: item.status,
    cancellationBy: item.cancellation?.by || 'default',
    cancellationReason: item.cancellation?.reason || ''
  }
  dialog.value = true
}

const deleteItem = (item) => {
  selectedTripId.value = item._id
  dialogDelete.value = true
}

const confirmDelete = async () => {
  try {
    await tripsStore.deleteTrips(selectedTripId.value)
    dialogDelete.value = false
    await loadTrips()
  } catch (error) {
    err.value = error.message
  }
}

const close = () => {
  dialog.value = false
}

const save = async () => {
  loading.value = true
  try {
    await tripsStore.editTrips({
      _id: editedItem.value._id,
      from: editedItem.value.from,
      to: editedItem.value.to,
      price: editedItem.value.price,
      status: editedItem.value.status,
      cancellation: {
        by: editedItem.value.cancellationBy,
        reason: editedItem.value.cancellationReason
      }
    })
    dialog.value = false
    await loadTrips()
  } catch (error) {
    err.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTrips()
})
</script>