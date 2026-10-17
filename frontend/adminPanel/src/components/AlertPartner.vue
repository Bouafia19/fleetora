<template>
  <v-container fluid class="pa-0">
    <div class="mb-3" v-if="err">
      <v-alert type="error" variant="tonal" closable>
        {{ err }}
      </v-alert>
    </div>

    <!-- Partner KYC Review Data Table -->
    <v-card variant="outlined" class="rounded-xl overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="users || []"
        :loading="!users"
        hover
        class="elevation-0"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="32" class="me-2 text-white font-weight-bold">
              {{ item.firstName ? item.firstName.charAt(0) : 'U' }}
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-2">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption text-grey">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template #item.phone="{ item }">
          <span class="font-weight-medium">{{ item.phone }}</span>
        </template>

        <template #item.fileStatus="{ item }">
          <v-chip
            :color="getStatusColor(item.fileStatus)"
            size="small"
            class="text-uppercase font-weight-bold"
          >
            {{ item.fileStatus || 'Pending' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            rounded="lg"
            @click="editItem(item)"
          >
            <v-icon size="small" class="me-1">mdi-file-document-check</v-icon>
            Review KYC
          </v-btn>
        </template>

        <template #no-data>
          <div class="pa-6 text-center text-grey">
            <v-icon size="large" class="mb-2">mdi-check-decagram</v-icon>
            <div>No pending partner verifications at this time.</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Review Dialog -->
    <v-dialog v-model="dialog" max-width="950px" scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="white" class="me-2">mdi-account-check</v-icon>
            <span>Partner KYC Verification — {{ editedItem.firstName }} {{ editedItem.lastName }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- User Information Column -->
            <v-col cols="12" md="4">
              <v-card variant="tonal" color="primary" class="pa-4 rounded-xl mb-4">
                <div class="text-caption font-weight-bold text-uppercase mb-2">Driver Details</div>
                <div class="font-weight-bold text-body-1">{{ editedItem.firstName }} {{ editedItem.lastName }}</div>
                <div class="text-caption text-grey-darken-1 mb-2">{{ editedItem.email }}</div>
                <div class="text-body-2 mb-2"><v-icon size="small" class="me-1">mdi-phone</v-icon>{{ editedItem.phone }}</div>
                <div class="text-body-2"><v-icon size="small" class="me-1">mdi-identifier</v-icon>Code: {{ editedItem.codePartenaire || 'N/A' }}</div>
              </v-card>

              <v-select
                v-model="editedItem.fileStatus"
                :items="['created', 'pending', 'confirmed']"
                label="KYC Verification Decision"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-select>

              <v-switch
                v-model="editedItem.complete"
                label="Mark Profile as Complete"
                color="success"
                density="compact"
                hide-details
                class="mb-3"
              ></v-switch>

              <v-switch
                v-model="editedItem.activated"
                label="Activate Account"
                color="primary"
                density="compact"
                hide-details
              ></v-switch>
            </v-col>

            <!-- Documents Column with Vuetify 4 Window -->
            <v-col cols="12" md="8">
              <v-card variant="outlined" class="rounded-xl overflow-hidden">
                <v-tabs v-model="tab" bg-color="grey-lighten-4" color="primary" density="comfortable">
                  <v-tab v-for="doc in documents" :key="doc.id" :value="doc.id">
                    <v-icon size="small" :color="editedItem[doc.title] ? 'success' : 'grey'" class="me-1">
                      {{ editedItem[doc.title] ? 'mdi-check-circle' : 'mdi-alert-circle-outline' }}
                    </v-icon>
                    {{ doc.label }}
                  </v-tab>
                </v-tabs>

                <v-window v-model="tab" class="pa-4 bg-white">
                  <v-window-item v-for="doc in documents" :key="doc.id" :value="doc.id">
                    <div v-if="editedItem[doc.title]" class="text-center">
                      <v-img
                        :src="editedItem[doc.title]"
                        max-height="400"
                        contain
                        class="rounded-lg border bg-grey-lighten-5"
                      >
                        <template #placeholder>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                          </div>
                        </template>
                      </v-img>
                    </div>
                    <div v-else class="pa-10 text-center text-grey">
                      <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-file-image-outline</v-icon>
                      <div class="text-body-1 font-weight-medium">No document uploaded yet for {{ doc.label }}</div>
                    </div>
                  </v-window-item>
                </v-window>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="bg-grey-lighten-4 pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey-darken-1" rounded="lg" @click="close">Cancel</v-btn>
          <v-btn variant="flat" color="primary" rounded="lg" :loading="loading" @click="save">
            Save Verification Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

const usersStore = useUsersStore()

const dialog = ref(false)
const loading = ref(false)
const err = ref('')
const tab = ref(1)

const headers = [
  { title: 'Driver Name & Email', key: 'name', align: 'start' },
  { title: 'Phone', key: 'phone' },
  { title: 'Verification Status', key: 'fileStatus' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const documents = [
  { id: 1, title: 'id', label: 'National ID' },
  { id: 2, title: 'grayCard', label: 'Gray Card (Carte Grise)' },
  { id: 3, title: 'commercialRegister', label: 'Commercial Register' },
  { id: 4, title: 'transportCard', label: 'Transport Card' },
  { id: 5, title: 'trafficPermit', label: 'Traffic Permit' }
]

const editedItem = ref({
  _id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'transporter',
  fileStatus: 'pending',
  complete: false,
  activated: false,
  codePartenaire: ''
})

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const editItem = (item) => {
  editedItem.value = { ...item }
  dialog.value = true
}

const close = () => {
  dialog.value = false
}

const save = async () => {
  loading.value = true
  err.value = ''
  try {
    if (editedItem.value.fileStatus === 'confirmed') {
      editedItem.value.complete = true
    }
    await usersStore.editUsers({
      _id: editedItem.value._id,
      fileStatus: editedItem.value.fileStatus,
      complete: editedItem.value.complete,
      activated: editedItem.value.activated
    })
    await usersStore.fetchUsers()
    dialog.value = false
  } catch (error) {
    err.value = error.message || 'Error updating user verification'
  } finally {
    loading.value = false
  }
}
</script>