<template>
  <v-data-table
    :headers="headers"
    :items="data || []"
    class="mt-4 elevation-1 rounded-lg"
    hide-default-footer
  >
    <template #item.clientId="{ item }">
      <span>{{ (item.clientId?.firstName || '') + ' ' + (item.clientId?.lastName || '') }}</span>
    </template>

    <template #item.price="{ item }">
      <span class="font-weight-medium">{{ formatNumber(item.price) }}</span>
    </template>

    <template #top>
      <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">{{ $t('Trips') }}</v-toolbar-title>
      </v-toolbar>
    </template>

    <template #no-data>
      <div class="pa-4 text-center text-medium-emphasis">
        {{ $t('noRecords') || 'No records' }}
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'TripsDataTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value || 0)
    }
  }
}
</script>