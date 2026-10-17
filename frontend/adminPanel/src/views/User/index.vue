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
                <v-icon color="white">mdi-account-group</v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-slate-800">{{ $t('Users') }} Directory</div>
                <div class="text-caption text-grey">Manage drivers, corporate clients, and back-office staff</div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-md-end align-center gap-3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search user by name, phone, email..."
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
              v-if="$can('create', 'Users')"
            >
              <v-icon class="me-1">mdi-plus</v-icon>
              Add User
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Users Data Table -->
      <v-card class="rounded-2xl elevation-1 border overflow-hidden" variant="flat">
        <v-data-table
          :headers="headers"
          :items="usersList"
          :loading="loadingTab"
          :search="search"
          hover
          class="elevation-0"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar :color="getRoleColor(item.role)" size="36" class="me-3 text-white font-weight-bold">
                {{ item.firstName ? item.firstName.charAt(0) : 'U' }}
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-2">{{ item.firstName }} {{ item.lastName }}</div>
                <div class="text-caption text-grey">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.role="{ item }">
            <v-chip
              :color="getRoleColor(item.role)"
              size="small"
              class="text-uppercase font-weight-bold"
            >
              {{ item.role }}
            </v-chip>
          </template>

          <template #item.activated="{ item }">
            <v-chip
              :color="item.activated ? 'success' : 'error'"
              size="small"
              variant="tonal"
              class="font-weight-medium"
            >
              {{ item.activated ? 'Active' : 'Disabled' }}
            </v-chip>
          </template>

          <template #item.vehicleId="{ item }">
            <span v-if="item.vehicleId && item.vehicleId.name" class="font-weight-medium text-body-2">
              {{ item.vehicleId.name }}
            </span>
            <span v-else class="text-grey">—</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center justify-end">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="primary"
                aria-label="Edit User"
                @click="editItem(item)"
                v-if="$can('update', 'Users')"
              ></v-btn>
              <v-btn
                :icon="item.activated ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                size="small"
                variant="text"
                :color="item.activated ? 'success' : 'warning'"
                :aria-label="item.activated ? 'Deactivate User' : 'Activate User'"
                @click="toggleActivation(item)"
                v-if="$can('update', 'Users')"
              ></v-btn>
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                color="error"
                aria-label="Delete User"
                @click="deleteItem(item)"
                v-if="$can('delete', 'Users')"
              ></v-btn>
            </div>
          </template>

          <template #no-data>
            <div class="pa-10 text-center">
              <v-avatar color="indigo-lighten-5" size="64" class="mb-3">
                <v-icon color="indigo-lighten-2" size="36">mdi-account-group-outline</v-icon>
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold text-slate-700">No Users Found</div>
              <div class="text-caption text-grey mb-4">No user accounts match your search filter criteria.</div>
              <v-btn color="primary" variant="outlined" size="small" rounded="lg" @click="loadUsers">
                <v-icon class="me-1">mdi-refresh</v-icon> Refresh Users
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Edit/Create User Dialog -->
      <v-dialog v-model="dialog" max-width="650px" scrollable>
        <v-card class="rounded-xl overflow-hidden">
          <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="white" class="me-2">{{ isEditing ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
              <span>{{ isEditing ? 'Edit User Profile' : 'Register New User' }}</span>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
          </v-card-title>

          <v-card-text class="pa-5">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.firstName"
                  label="First Name"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.lastName"
                  label="Last Name"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Phone Number"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" v-if="!isEditing">
                <v-text-field
                  v-model="editedItem.password"
                  label="Initial Password"
                  type="password"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.role"
                  :items="['administrator', 'client', 'transporter']"
                  label="User Role"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" v-if="editedItem.role === 'transporter'">
                <v-select
                  v-model="editedItem.vehicleId"
                  :items="vehiclesList"
                  item-title="name"
                  item-value="_id"
                  label="Assigned Vehicle"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" v-if="editedItem.role === 'transporter'">
                <v-select
                  v-model="editedItem.fileStatus"
                  :items="['created', 'pending', 'confirmed']"
                  label="KYC Document Status"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="editedItem.activated"
                  label="Account Active"
                  color="success"
                  density="compact"
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="bg-grey-lighten-4 pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="grey-darken-1" rounded="lg" @click="close">Cancel</v-btn>
            <v-btn variant="flat" color="primary" rounded="lg" :loading="loading" @click="save">
              Save User
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete User Dialog -->
      <v-dialog v-model="dialogDelete" max-width="480px">
        <v-card class="rounded-xl pa-5 text-center">
          <v-avatar color="red-lighten-4" size="64" class="mx-auto mb-3">
            <v-icon color="error" size="32">mdi-account-remove</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold mb-2">Delete User Account?</div>
          <div class="text-body-2 text-grey mb-4">
            Are you sure you want to remove this user from the system?
          </div>
          <div class="d-flex justify-center gap-3">
            <v-btn variant="outlined" rounded="lg" @click="dialogDelete = false">Cancel</v-btn>
            <v-btn color="error" variant="flat" rounded="lg" @click="confirmDelete">Delete User</v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseLayout from '@/components/BaseLayout.vue'
import { useUsersStore } from '@/stores/users'
import { useVehiclesStore } from '@/stores/vehicles'

const usersStore = useUsersStore()
const vehiclesStore = useVehiclesStore()

const search = ref('')
const loadingTab = ref(false)
const loading = ref(false)
const err = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const isEditing = ref(false)
const selectedUserId = ref(null)

const headers = [
  { title: 'User Details', key: 'name' },
  { title: 'Phone Number', key: 'phone' },
  { title: 'System Role', key: 'role' },
  { title: 'Status', key: 'activated' },
  { title: 'Vehicle Type', key: 'vehicleId' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const editedItem = ref({
  _id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'client',
  activated: true,
  vehicleId: null,
  fileStatus: 'confirmed'
})

const usersList = computed(() => usersStore.getUsers || [])
const vehiclesList = computed(() => vehiclesStore.getVehicles || [])

const getRoleColor = (role) => {
  switch (role) {
    case 'administrator': return 'primary'
    case 'transporter': return 'amber-darken-3'
    case 'client': return 'indigo'
    default: return 'grey'
  }
}

const loadData = async () => {
  loadingTab.value = true
  err.value = ''
  try {
    await Promise.all([
      usersStore.fetchUsers(),
      vehiclesStore.fetchVehicles()
    ])
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'client',
    activated: true,
    vehicleId: null,
    fileStatus: 'confirmed'
  }
  dialog.value = true
}

const editItem = (item) => {
  isEditing.value = true
  editedItem.value = {
    _id: item._id,
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
    phone: item.phone,
    role: item.role,
    activated: item.activated,
    vehicleId: item.vehicleId?._id || item.vehicleId,
    fileStatus: item.fileStatus || 'confirmed'
  }
  dialog.value = true
}

const toggleActivation = async (item) => {
  try {
    await usersStore.editUsers({
      _id: item._id,
      activated: !item.activated
    })
    await usersStore.fetchUsers()
  } catch (error) {
    err.value = error.message
  }
}

const deleteItem = (item) => {
  selectedUserId.value = item._id
  dialogDelete.value = true
}

const confirmDelete = async () => {
  try {
    await usersStore.deleteUsers(selectedUserId.value)
    dialogDelete.value = false
    await usersStore.fetchUsers()
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
      await usersStore.editUsers(editedItem.value)
    } else {
      await usersStore.addUsers(editedItem.value)
    }
    dialog.value = false
    await usersStore.fetchUsers()
  } catch (error) {
    err.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>