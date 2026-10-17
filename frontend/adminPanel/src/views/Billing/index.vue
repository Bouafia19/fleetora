<template>
  <base-layout>
    <v-container fluid class="pa-4 pa-md-6">
      <v-card class="elevation-2 rounded-lg">
        <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
          <v-icon icon="mdi-receipt" color="primary" class="mr-2" />
          <v-toolbar-title class="text-h6 font-weight-bold">{{ $t('Billing') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="$t('Search')"
            single-line
            hide-details
            variant="outlined"
            density="compact"
            class="max-w-xs"
            style="max-width: 280px;"
          ></v-text-field>
        </v-toolbar>

        <v-data-table
          :headers="headers"
          :items="transporters"
          :loading="loading"
          :search="search"
          hover
          class="elevation-0 clickable-rows"
          @click:row="handleRowClick"
        >
          <template #item.name="{ item }">
            <span class="font-weight-medium">{{ (item.firstName || '') + ' ' + (item.lastName || '') }}</span>
          </template>

          <template #item.vehicleId.name="{ item }">
            <v-chip size="small" color="primary" variant="tonal" v-if="item.vehicleId?.name">
              {{ item.vehicleId.name }}
            </v-chip>
            <span v-else class="text-caption text-medium-emphasis">-</span>
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
import { useUsersStore } from '@/stores/users'

export default {
  name: 'BillingIndexView',
  components: {
    'base-layout': BaseLayout
  },
  data: () => ({
    headers: [
      { title: 'Email', key: 'email', sortable: true },
      { title: 'Name', key: 'name', sortable: true },
      { title: 'Phone', key: 'phone', sortable: true },
      { title: 'Role', key: 'role', sortable: true },
      { title: 'Vehicle', key: 'vehicleId.name', sortable: true }
    ],
    search: '',
    loading: false
  }),
  computed: {
    usersStore() {
      return useUsersStore()
    },
    transporters() {
      return this.usersStore.transporters || []
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      try {
        await this.usersStore.fetchUsers()
      } finally {
        this.loading = false
      }
    },
    handleRowClick(event, row) {
      const item = row?.item || event
      if (item && item._id) {
        this.getDetails(item)
      }
    },
    getDetails(item) {
      this.$router.push({ name: 'Detail', params: { id: item._id } })
    }
  }
}
</script>

<style scoped>
.clickable-rows :deep(tr:hover) {
  cursor: pointer;
}
</style>