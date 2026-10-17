<template>
  <base-layout>
    <v-container fluid class="pa-4 pa-md-6">
      <v-card class="elevation-2 rounded-lg">
        <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
          <v-icon icon="mdi-shield-account" color="primary" class="mr-2" />
          <v-toolbar-title class="text-h6 font-weight-bold">{{ $t('Roles') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-dialog v-model="dialog" max-width="600px">
            <template #activator="{ props }">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                variant="elevated"
                v-bind="props"
                v-if="$can('create', 'Roles')"
              >
                {{ $t('New') || 'New Role' }}
              </v-btn>
            </template>

            <v-card class="rounded-lg">
              <v-card-title class="bg-primary text-white pa-4">
                <span class="text-h6">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Role Name"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-text-field>

                <v-select
                  v-model="editedItem.subject"
                  :items="subjects"
                  item-title="title"
                  item-value="title"
                  :label="$t('Subject')"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-select>

                <div class="text-subtitle-2 font-weight-bold mb-2">Permissions</div>
                <v-row dense>
                  <v-col cols="6" sm="3">
                    <v-checkbox
                      v-model="editedItem.actions.read"
                      label="Read"
                      density="compact"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-checkbox
                      v-model="editedItem.actions.create"
                      label="Create"
                      density="compact"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-checkbox
                      v-model="editedItem.actions.update"
                      label="Update"
                      density="compact"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-checkbox
                      v-model="editedItem.actions.delete"
                      label="Delete"
                      density="compact"
                      color="primary"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-4 bg-surface-variant d-flex justify-end">
                <v-btn variant="outlined" color="error" @click="close">Cancel</v-btn>
                <v-btn variant="elevated" color="primary" @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="450px">
            <v-card class="rounded-lg">
              <v-card-title class="text-h6 pa-4">Are you sure you want to delete this role?</v-card-title>
              <v-card-actions class="pa-4 d-flex justify-end">
                <v-btn variant="outlined" color="grey" @click="closeDelete">Cancel</v-btn>
                <v-btn variant="elevated" color="error" @click="deleteItemConfirm">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>

        <v-data-table
          :headers="filterHeaders"
          :items="roles"
          item-value="_id"
          class="elevation-0"
        >
          <template #item.actions.read="{ item }">
            <v-icon
              :icon="item.actions?.read ? 'mdi-check-circle' : 'mdi-close-circle-outline'"
              :color="item.actions?.read ? 'success' : 'grey-lighten-1'"
            />
          </template>

          <template #item.actions.create="{ item }">
            <v-icon
              :icon="item.actions?.create ? 'mdi-check-circle' : 'mdi-close-circle-outline'"
              :color="item.actions?.create ? 'success' : 'grey-lighten-1'"
            />
          </template>

          <template #item.actions.update="{ item }">
            <v-icon
              :icon="item.actions?.update ? 'mdi-check-circle' : 'mdi-close-circle-outline'"
              :color="item.actions?.update ? 'success' : 'grey-lighten-1'"
            />
          </template>

          <template #item.actions.delete="{ item }">
            <v-icon
              :icon="item.actions?.delete ? 'mdi-check-circle' : 'mdi-close-circle-outline'"
              :color="item.actions?.delete ? 'success' : 'grey-lighten-1'"
            />
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editItem(item)"
              v-if="$can('update', 'Roles')"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              v-if="$can('delete', 'Roles')"
            />
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis">
              {{ $t('noRecords') || 'No records found' }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import { useRolesStore } from '@/stores/roles'

export default {
  name: 'RolesView',
  components: {
    'base-layout': BaseLayout
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      { title: 'Role', key: 'name', sortable: false },
      { title: 'Subject', key: 'subject' },
      { title: 'Read', key: 'actions.read' },
      { title: 'Create', key: 'actions.create' },
      { title: 'Update', key: 'actions.update' },
      { title: 'Delete', key: 'actions.delete' },
      { title: 'Actions', key: 'actions', sortable: false }
    ],
    editedIndex: -1,
    editedId: null,
    editedItem: {
      name: '',
      subject: '',
      actions: {
        read: false,
        create: false,
        update: false,
        delete: false
      }
    },
    defaultItem: {
      name: '',
      subject: '',
      actions: {
        read: false,
        create: false,
        update: false,
        delete: false
      }
    },
    subjects: [
      { title: 'Dashboard' },
      { title: 'Trips' },
      { title: 'Vehicles' },
      { title: 'Users' },
      { title: 'Billing' },
      { title: 'Notifications' },
      { title: 'TermsConditions' },
      { title: 'Roles' },
      { title: 'Settings' }
    ]
  }),
  computed: {
    rolesStore() {
      return useRolesStore()
    },
    roles() {
      return this.rolesStore.roles || []
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Role' : 'Edit Role'
    },
    filterHeaders() {
      if (!this.$can('update', 'Roles') && !this.$can('delete', 'Roles')) {
        return this.headers.filter((e) => e.key !== 'actions')
      }
      return this.headers
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    initialize() {
      this.rolesStore.fetchRoles()
    },
    editItem(item) {
      this.editedIndex = this.roles.indexOf(item)
      this.editedId = item._id
      this.editedItem = JSON.parse(JSON.stringify(item))
      this.dialog = true
    },
    deleteItem(item) {
      this.editedId = item._id
      this.dialogDelete = true
    },
    async deleteItemConfirm() {
      if (this.editedId) {
        await this.rolesStore.deleteRoles(this.editedId)
      }
      this.closeDelete()
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = JSON.parse(JSON.stringify(this.defaultItem))
        this.editedIndex = -1
        this.editedId = null
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = JSON.parse(JSON.stringify(this.defaultItem))
        this.editedIndex = -1
        this.editedId = null
      })
    },
    async save() {
      if (this.editedIndex > -1) {
        await this.rolesStore.editRoles(this.editedItem)
      } else {
        await this.rolesStore.addRoles(this.editedItem)
      }
      this.close()
    }
  }
}
</script>