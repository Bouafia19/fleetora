<template>
  <base-layout>
    <v-container fluid class="pa-4 pa-md-6">
      <v-alert
        v-if="err"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ $t(err) || err }}
      </v-alert>

      <v-card class="elevation-2 rounded-lg">
        <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
          <v-icon icon="mdi-bell-ring" color="primary" class="mr-2" />
          <v-toolbar-title class="text-h6 font-weight-bold">{{ $t('Announcements') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-dialog v-model="dialog" max-width="700px">
            <template #activator="{ props }">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                variant="elevated"
                v-bind="props"
                v-if="$can('create', 'Notifications')"
              >
                {{ $t('New') || 'New Announcement' }}
              </v-btn>
            </template>

            <v-card class="rounded-lg">
              <v-card-title class="bg-primary text-white pa-4">
                <span class="text-h6">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-text-field
                  v-model="editedItem.title"
                  label="Title"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-text-field>

                <v-select
                  v-model="editedItem.topic"
                  :items="topics"
                  label="Select Topic"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-select>

                <v-textarea
                  v-model="editedItem.body"
                  label="Body"
                  variant="outlined"
                  density="compact"
                  rows="5"
                  auto-grow
                ></v-textarea>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-4 bg-surface-variant d-flex justify-end">
                <v-btn variant="outlined" color="error" @click="close">Cancel</v-btn>
                <v-btn variant="elevated" color="primary" :loading="loading" @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="450px">
            <v-card class="rounded-lg">
              <v-card-title class="text-h6 pa-4">Are you sure you want to delete this announcement?</v-card-title>
              <v-card-actions class="pa-4 d-flex justify-end">
                <v-btn variant="outlined" color="grey" @click="closeDelete">Cancel</v-btn>
                <v-btn variant="elevated" color="error" @click="deleteItemConfirm">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>

        <v-data-table
          :headers="filterHeaders"
          :items="announcements"
          :loading="loadingTab"
          item-value="_id"
          class="elevation-0"
        >
          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="editItem(item)"
              v-if="$can('update', 'Notifications')"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteItem(item)"
              v-if="$can('delete', 'Notifications')"
            />
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis">
              <v-btn color="primary" variant="outlined" @click="initialize">Reset</v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useNotificationsStore } from '@/stores/notifications'

export default {
  name: 'NotificationView',
  components: {
    'base-layout': BaseLayout
  },
  data: () => ({
    topics: ['client', 'transporter'],
    dialog: false,
    dialogDelete: false,
    headers: [
      { title: 'Title', key: 'title' },
      { title: 'Topic', key: 'topic' },
      { title: 'Body', key: 'body' },
      { title: 'Actions', key: 'actions', sortable: false }
    ],
    err: '',
    loadingTab: false,
    editedIndex: -1,
    editedId: null,
    editedItem: {
      title: '',
      body: '',
      topic: ''
    },
    defaultItem: {
      title: '',
      body: '',
      topic: ''
    },
    loading: false
  }),
  computed: {
    announcementsStore() {
      return useAnnouncementsStore()
    },
    notificationsStore() {
      return useNotificationsStore()
    },
    announcements() {
      return this.announcementsStore.announcements || []
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Announcement' : 'Edit Announcement'
    },
    filterHeaders() {
      if (!this.$can('update', 'Notifications') && !this.$can('delete', 'Notifications')) {
        return this.headers.filter((e) => e.key !== 'actions')
      }
      return this.headers
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loadingTab = true
      try {
        await this.announcementsStore.fetchAnnouncements()
      } finally {
        this.loadingTab = false
      }
    },
    editItem(item) {
      this.editedIndex = this.announcements.indexOf(item)
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
        await this.announcementsStore.deleteAnnouncements(this.editedId)
        await this.initialize()
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
      this.loading = true
      try {
        if (this.editedIndex > -1) {
          await this.announcementsStore.editAnnouncements(this.editedItem)
          await this.notificationsStore.sendNotifications(this.editedItem)
        } else {
          await this.announcementsStore.addAnnouncements(this.editedItem)
          await this.notificationsStore.sendNotifications(this.editedItem)
        }
        this.close()
        await this.initialize()
      } catch (e) {
        this.err = e.message || 'Error saving announcement'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>