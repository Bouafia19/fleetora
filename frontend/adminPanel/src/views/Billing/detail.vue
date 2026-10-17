<template>
  <base-layout>
    <v-container fluid class="pa-4 pa-md-6">
      <invoice
        :trips="trips"
        ref="report"
        v-show="false"
        :transporter="transporter"
        :company="company"
        :billing="billing"
      />

      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" class="mr-2" @click="$router.push('/billing')" />
          <h1 class="text-h5 font-weight-bold">{{ $t('Billing') }} - {{ transporter ? (transporter.firstName + ' ' + transporter.lastName) : '' }}</h1>
        </div>
        <v-btn
          color="primary"
          variant="elevated"
          rounded="pill"
          prepend-icon="mdi-cash-check"
          @click="newBilling"
          :loading="loadingNewBilling"
          v-if="total > 0"
        >
          {{ $t('makePayment') || 'Make Payment' }}
        </v-btn>
      </div>

      <!-- Financial Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-card class="rounded-lg elevation-2 pa-4 bg-surface">
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
              {{ $t('total') || 'Total Trips Amount' }}
            </div>
            <div class="text-h5 font-weight-bold mt-1 text-primary">
              {{ formatNumber(subTotal) }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="rounded-lg elevation-2 pa-4 bg-surface">
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
              {{ $t('net') || 'Commission Due (5%)' }}
            </div>
            <div class="text-h5 font-weight-bold mt-1 text-success">
              {{ formatNumber(total) }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Active / Unpaid Trips Table -->
      <v-card class="elevation-2 rounded-lg mb-6">
        <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
          <v-icon icon="mdi-map-marker-distance" color="primary" class="mr-2" />
          <v-toolbar-title class="text-subtitle-1 font-weight-bold">{{ $t('Trips') }}</v-toolbar-title>
        </v-toolbar>

        <v-data-table
          :headers="tripsHeaders"
          :items="tripsByTransporterId"
          :loading="loadingTrips"
          hide-default-footer
          class="elevation-0"
        >
          <template #item.clientId="{ item }">
            <span>{{ (item.clientId?.firstName || '') + ' ' + (item.clientId?.lastName || '') }}</span>
          </template>

          <template #item.price="{ item }">
            <span class="font-weight-medium">{{ formatNumber(item.price) }}</span>
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis">
              {{ $t('noRecords') || 'No pending trips for billing' }}
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Billing History Table -->
      <v-card class="elevation-2 rounded-lg">
        <v-toolbar flat color="transparent" class="px-4 py-2 border-b">
          <v-icon icon="mdi-history" color="primary" class="mr-2" />
          <v-toolbar-title class="text-subtitle-1 font-weight-bold">{{ $t('BillingHistory') }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="$t('Search')"
            single-line
            hide-details
            variant="outlined"
            density="compact"
            style="max-width: 250px;"
          ></v-text-field>

          <!-- Dialog for payment / details -->
          <v-dialog v-model="dialog" max-width="800px">
            <v-card class="rounded-lg">
              <v-card-title class="bg-primary text-white pa-4">
                <span class="text-h6">{{ editedIndex > -1 ? 'Billing Details' : 'New Payment Record' }}</span>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      :model-value="computedDateFormatted"
                      :label="$t('Date')"
                      variant="outlined"
                      density="compact"
                      readonly
                      class="mb-3"
                    ></v-text-field>

                    <v-text-field
                      :model-value="formatNumber(editedItem.amount)"
                      :label="$t('Amount')"
                      variant="outlined"
                      density="compact"
                      readonly
                      class="mb-3"
                    ></v-text-field>

                    <v-textarea
                      v-model="editedItem.description"
                      :label="$t('Description')"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      auto-grow
                      :disabled="editedIndex > -1"
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" sm="6" class="d-flex align-center justify-center">
                    <v-avatar size="200" rounded="lg" class="border elevation-1" v-if="editedItem.photo">
                      <v-img :src="editedItem.photo" contain alt="Receipt Photo" />
                    </v-avatar>
                    <div v-else class="text-center pa-4 text-medium-emphasis border rounded-lg w-100">
                      <v-icon icon="mdi-image-off-outline" size="48" class="mb-2" />
                      <div>No receipt attachment</div>
                    </div>
                  </v-col>
                </v-row>

                <div v-if="editedItem.tripsIds && editedItem.tripsIds.length" class="mt-4">
                  <trips-dataTable
                    :data="editedItem.tripsIds"
                    :headers="tripsHeaders"
                  />
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-4 bg-surface-variant d-flex justify-end">
                <v-btn variant="outlined" color="error" @click="close">Cancel</v-btn>
                <v-btn variant="elevated" color="primary" @click="confirm">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>

        <v-data-table
          :headers="headers"
          :items="billings"
          :loading="loadingBillings"
          :search="search"
          item-value="_id"
          class="elevation-0"
        >
          <template #item.date="{ item }">
            <span>{{ formatDate(item.date) }}</span>
          </template>

          <template #item.amount="{ item }">
            <span class="font-weight-medium">{{ formatNumber(item.amount) }}</span>
          </template>

          <template #item.status="{ item }">
            <v-chip
              size="small"
              :color="item.status === 'confirmed' ? 'success' : 'warning'"
              variant="flat"
            >
              {{ item.status === 'confirmed' ? $t('confirmed') : $t('pending') }}
            </v-chip>
          </template>

          <template #item.detail="{ item }">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="getDetail(item)"
            >
              {{ $t('More') || 'Details' }}
            </v-btn>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-download"
              :loading="item.createloading"
              @click="printItem(item)"
              v-if="item.status === 'confirmed'"
            >
              {{ $t('Download') || 'PDF' }}
            </v-btn>
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-medium-emphasis">
              {{ $t('noRecords') || 'No billing history' }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import Invoice from '@/components/reports/Invoice.vue'
import TripsDataTable from '@/components/TripsDataTable.vue'
import moment from 'moment'
import axios from 'axios'
import { useBillingsStore } from '@/stores/billings'
import { useTripsStore } from '@/stores/trips'
import { useCompanyStore } from '@/stores/company'

export default {
  name: 'BillingDetailView',
  props: ['id'],
  components: {
    'base-layout': BaseLayout,
    invoice: Invoice,
    'trips-dataTable': TripsDataTable
  },
  data: () => ({
    headers: [
      { title: 'Date', key: 'date', sortable: true },
      { title: 'Description', key: 'description' },
      { title: 'Amount', key: 'amount', sortable: true },
      { title: 'Status', key: 'status' },
      { title: '', key: 'detail', sortable: false },
      { title: '', key: 'actions', sortable: false }
    ],
    tripsHeaders: [
      { title: 'Customer', key: 'clientId' },
      { title: 'From', key: 'from' },
      { title: 'To', key: 'to' },
      { title: 'Price', key: 'price' }
    ],
    search: '',
    loadingBillings: false,
    loadingTrips: false,
    loadingNewBilling: false,
    dialog: false,
    editedIndex: -1,
    editedItem: {},
    defaultItem: {
      photo: '',
      billingMethod: '',
      amount: 0,
      brutAmount: 0,
      date: null,
      description: '',
      tripsIds: []
    },
    transporter: null,
    trips: [],
    billing: null
  }),
  computed: {
    billingsStore() {
      return useBillingsStore()
    },
    tripsStore() {
      return useTripsStore()
    },
    companyStore() {
      return useCompanyStore()
    },
    billings() {
      return this.billingsStore.billings || []
    },
    tripsByTransporterId() {
      return this.tripsStore.tripsByTransporterId || []
    },
    company() {
      return this.companyStore.company || {}
    },
    subTotal() {
      return this.tripsByTransporterId.reduce((prev, cur) => prev + (cur.price || 0), 0)
    },
    total() {
      return parseFloat((this.subTotal * 5 / 100).toFixed(2))
    },
    computedDateFormatted() {
      return this.editedItem.date ? moment(this.editedItem.date).format('dddd, MMMM Do YYYY') : ''
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loadingBillings = true
      this.loadingTrips = true
      try {
        await Promise.all([
          this.billingsStore.fetchBillingsByTransporterId(this.id),
          this.tripsStore.fetchtripsByTransporterId(this.id),
          this.companyStore.fetchCompany(),
          this.fetchTransporter()
        ])
      } finally {
        this.loadingBillings = false
        this.loadingTrips = false
      }
    },
    async fetchTransporter() {
      try {
        const stored = localStorage.getItem('userInfo')
        const user = stored ? JSON.parse(stored) : null
        const token = user?.token
        const response = await axios.get(`api/users/${this.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (response.status === 200) {
          this.transporter = response.data
        }
      } catch (e) {
        console.error('Error fetching transporter profile:', e)
      }
    },
    newBilling() {
      this.editedIndex = -1
      this.editedItem = {
        ...this.defaultItem,
        tripsIds: [...this.tripsByTransporterId],
        amount: this.total,
        brutAmount: this.subTotal,
        date: Date.now(),
        transporterId: this.id,
        description: 'Payment for Fleetora commission'
      }
      this.dialog = true
    },
    getDetail(item) {
      this.editedIndex = this.billings.indexOf(item)
      this.editedItem = { ...item }
      this.dialog = true
    },
    close() {
      this.dialog = false
    },
    async confirm() {
      this.editedItem.status = 'confirmed'
      if (this.editedIndex > -1) {
        await this.billingsStore.editBillings(this.editedItem)
      } else {
        if (this.editedItem.tripsIds) {
          for (const trip of this.editedItem.tripsIds) {
            trip.paid = true
            await this.tripsStore.updateTrip(trip)
          }
        }
        await this.billingsStore.addBillings(this.editedItem)
      }
      this.dialog = false
      await this.initialize()
    },
    formatNumber(value) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value || 0)
    },
    formatDate(value) {
      return value ? moment(value).format('dddd, MMMM Do YYYY') : ''
    },
    printItem(item) {
      item.createloading = true
      this.trips = item.tripsIds || []
      this.billing = item
      setTimeout(() => {
        if (this.$refs.report) {
          this.$refs.report.generateReport()
        }
        item.createloading = false
      }, 1500)
    }
  }
}
</script>