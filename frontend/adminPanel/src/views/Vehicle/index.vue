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
                <v-icon color="white">mdi-truck-fast</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-slate-800">{{ $t('Vehicles') }} Fleet Categories</div>
                <div class="text-caption text-grey">Configure vehicle types, freight tariffs per km, and minimum fees</div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search vehicle type..."
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              style="max-width: 280px;"
              class="me-3"
            ></v-text-field>

            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              @click="openNewDialog"
              v-if="$can('create', 'Vehicles')"
            >
              <v-icon class="me-1">mdi-plus</v-icon>
              Add Vehicle Type
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Vehicles Data Table -->
      <v-card class="rounded-2xl elevation-1 border overflow-hidden" variant="flat">
        <v-data-table
          :headers="headers"
          :items="vehiclesList"
          :loading="loadingTab"
          :search="search"
          hover
          class="elevation-0"
        >
          <template #item.photo="{ item }">
            <div class="py-2">
              <v-avatar rounded="lg" size="56" class="elevation-1 border bg-grey-lighten-4">
                <v-img :src="item.photo" cover>
                  <template #placeholder>
                    <v-icon color="grey">mdi-truck</v-icon>
                  </template>
                </v-img>
              </v-avatar>
            </div>
          </template>

          <template #item.name="{ item }">
            <div class="font-weight-bold text-body-1 text-slate-800">{{ item.name }}</div>
            <div class="text-caption text-grey">Order Priority: {{ item.order || 1 }}</div>
          </template>

          <template #item.priceKm="{ item }">
            <div class="font-weight-bold text-primary">{{ formatNumber(item.priceKm) }} / km</div>
          </template>

          <template #item.minimum="{ item }">
            <div class="font-weight-medium text-slate-700">{{ formatNumber(item.minimum) }}</div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-end">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="primary"
                aria-label="Edit Vehicle"
                @click="editItem(item)"
                v-if="$can('update', 'Vehicles')"
              ></v-btn>
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                color="error"
                aria-label="Delete Vehicle"
                @click="deleteItem(item)"
                v-if="$can('delete', 'Vehicles')"
              ></v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="pa-10 text-center">
              <v-avatar color="pink-lighten-5" size="64" class="mb-3">
                <v-icon color="pink-lighten-2" size="36">mdi-truck-outline</v-icon>
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold text-slate-700">No Vehicle Categories Found</div>
              <div class="text-caption text-grey mb-4">No vehicle types match your search criteria.</div>
              <v-btn color="primary" variant="outlined" size="small" rounded="lg" @click="loadVehicles">
                <v-icon class="me-1">mdi-refresh</v-icon> Refresh Vehicles
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Create / Edit Dialog -->
      <v-dialog v-model="dialog" max-width="580px" scrollable>
        <v-card class="rounded-xl overflow-hidden">
          <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="white" class="me-2">{{ isEditing ? 'mdi-truck-edit' : 'mdi-truck-plus' }}</v-icon>
              <span>{{ isEditing ? 'Edit Vehicle Category' : 'New Fleet Category' }}</span>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
          </v-card-title>

          <v-card-text class="pa-5">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Category Name (e.g., Camion 5T, Fourgon)"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.priceKm"
                  label="Tariff per Kilometer (DZD)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.minimum"
                  label="Base Minimum Charge (DZD)"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedItem.order"
                  label="Display Order"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.photo"
                  label="Image Asset Path"
                  placeholder="/trucks/1.jpeg"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-if="editedItem.photo" class="text-center">
                <div class="text-caption text-grey mb-1">Image Preview:</div>
                <v-img :src="editedItem.photo" max-height="120" contain class="border rounded-lg"></v-img>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="bg-grey-lighten-4 pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="grey-darken-1" rounded="lg" @click="close">Cancel</v-btn>
            <v-btn variant="flat" color="primary" rounded="lg" :loading="loading" @click="save">
              Save Category
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
          <div class="text-h6 font-weight-bold mb-2">Delete Vehicle Category?</div>
          <div class="text-body-2 text-grey mb-4">
            Are you sure you want to remove this vehicle category from the system?
          </div>
          <div class="d-flex justify-center gap-3">
            <v-btn variant="outlined" rounded="lg" @click="dialogDelete = false">Cancel</v-btn>
            <v-btn color="error" variant="flat" rounded="lg" @click="confirmDelete">Delete</v-btn>
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
import { useVehiclesStore } from '@/stores/vehicles'

const { locale } = useI18n()
const vehiclesStore = useVehiclesStore()

const search = ref('')
const loadingTab = ref(false)
const loading = ref(false)
const err = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const isEditing = ref(false)
const selectedVehicleId = ref(null)

const headers = [
  { title: 'Vehicle Visual', key: 'photo', sortable: false },
  { title: 'Category & Name', key: 'name' },
  { title: 'Rate / KM', key: 'priceKm' },
  { title: 'Base Minimum Fare', key: 'minimum' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const editedItem = ref({
  _id: null,
  name: '',
  priceKm: 0,
  minimum: 0,
  order: 1,
  photo: '/trucks/1.jpeg'
})

const vehiclesList = computed(() => vehiclesStore.getVehicles || [])

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value || 'fr', { style: 'currency', currency: 'DZD' }).format(value || 0)
}

const loadVehicles = async () => {
  loadingTab.value = true
  err.value = ''
  try {
    await vehiclesStore.fetchVehicles()
  } catch (error) {
    err.value = error.message
  } finally {
    loadingTab.value = false
  }
}

const openNewDialog = () => {
  isEditing.value = false
  editedItem.value = {
    _id: null,
    name: '',
    priceKm: 60,
    minimum: 2500,
    order: (vehiclesList.value.length || 0) + 1,
    photo: '/trucks/1.jpeg'
  }
  dialog.value = true
}

const editItem = (item) => {
  isEditing.value = true
  editedItem.value = { ...item }
  dialog.value = true
}

const deleteItem = (item) => {
  selectedVehicleId.value = item._id
  dialogDelete.value = true
}

const confirmDelete = async () => {
  try {
    await vehiclesStore.deleteVehicles(selectedVehicleId.value)
    dialogDelete.value = false
    await loadVehicles()
  } catch (error) {
    err.value = error.message
  }
}

const close = () => {
  dialog.value = false
}

const save = async () => {
  loading.value = true
  err.value = ''
  try {
    if (isEditing.value) {
      await vehiclesStore.editVehicles(editedItem.value)
    } else {
      await vehiclesStore.addVehicles(editedItem.value)
    }
    dialog.value = false
    await loadVehicles()
  } catch (error) {
    err.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVehicles()
})
</script>