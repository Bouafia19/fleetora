<template>
  <BaseLayout>
    <v-container fluid class="pa-6">
      <!-- Loading State -->
      <div v-if="loadingPage" class="d-flex justify-center align-center" style="height: 60vh;">
        <div class="text-center">
          <v-progress-circular indeterminate color="primary" size="56" class="mb-4"></v-progress-circular>
          <div class="text-body-1 font-weight-medium text-grey">Loading Fleetora Analytics...</div>
        </div>
      </div>

      <div v-else>
        <!-- KPI Cards Grid -->
        <v-row class="mb-4 g-3">
          <v-col
            v-for="item in items"
            :key="item.title"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <v-card
              class="rounded-2xl pa-4 h-100 kpi-card border"
              variant="flat"
              :to="item.to"
              :style="{ borderTop: `3px solid ${item.color}` }"
            >
              <div class="d-flex align-center justify-space-between mb-3">
                <v-avatar :color="item.bgColor" size="42" rounded="lg">
                  <v-icon :color="item.color" size="22">{{ item.icon }}</v-icon>
                </v-avatar>
                <v-icon size="16" color="slate-400">mdi-arrow-top-right</v-icon>
              </div>

              <div class="text-caption font-weight-bold text-uppercase text-slate-500 mb-1 tracking-wide">
                {{ $t(item.title) }}
              </div>
              <div class="text-h4 font-weight-bold text-slate-800">
                {{ item.count }}
              </div>
              <div v-if="item.totalAmount" class="text-caption font-weight-bold text-emerald-600 mt-1 d-flex align-center">
                <v-icon size="x-small" color="success" class="me-1">mdi-cash-multiple</v-icon>
                {{ formatNumber(item.totalAmount) }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Timeline Filters -->
        <v-card class="pa-3 rounded-2xl mb-6 border d-flex align-center justify-space-between flex-wrap gap-2" variant="flat">
          <div class="d-flex align-center ms-2">
            <v-avatar color="primary" size="32" rounded="lg" class="me-2">
              <v-icon color="white" size="18">mdi-calendar-clock</v-icon>
            </v-avatar>
            <div>
              <span class="text-subtitle-2 font-weight-bold text-slate-800">Analytics Range</span>
              <span class="text-caption text-slate-400 ms-2 d-none d-sm-inline">Filter freight & revenue timeline</span>
            </div>
          </div>

          <v-btn-toggle
            v-model="selection"
            mandatory
            color="primary"
            variant="tonal"
            rounded="lg"
            density="comfortable"
          >
            <v-btn value="one_month" @click="updateData('one_month')">
              {{ $t('oneMonth') }}
            </v-btn>
            <v-btn value="six_months" @click="updateData('six_months')">
              {{ $t('sixMonths') }}
            </v-btn>
            <v-btn value="one_year" @click="updateData('one_year')">
              {{ $t('oneYear') }}
            </v-btn>
            <v-btn value="all" @click="updateData('all')">
              {{ $t('ALL') }}
            </v-btn>
          </v-btn-toggle>
        </v-card>

        <!-- Charts Section -->
        <v-row class="mb-4">
          <!-- Main Area Chart: Freight Revenue & Volume -->
          <v-col cols="12">
            <v-card class="pa-5 rounded-2xl elevation-1 border" variant="flat">
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <div class="text-h6 font-weight-bold text-slate-800">Trip Revenue & Freight Volume</div>
                  <div class="text-caption text-grey">Historical progression across selected timeline</div>
                </div>
                <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
                  DZD Currency
                </v-chip>
              </div>

              <div style="min-height: 350px;">
                <apexchart
                  type="area"
                  height="350"
                  :options="tripsOptions"
                  :series="tripsSeries"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Donut Breakdown Charts -->
        <v-row>
          <!-- Trip Status Breakdown -->
          <v-col cols="12" md="4">
            <v-card class="pa-5 rounded-2xl elevation-1 border h-100" variant="flat">
              <div class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">Trips by Status</div>
              <div class="text-caption text-grey mb-4">Finished, canceled, started, planned</div>
              <div class="d-flex justify-center" style="min-height: 280px;">
                <apexchart
                  type="donut"
                  width="100%"
                  height="280"
                  :options="tripsStatusOptions"
                  :series="tripsStatusSeries"
                />
              </div>
            </v-card>
          </v-col>

          <!-- User Roles Distribution -->
          <v-col cols="12" md="4">
            <v-card class="pa-5 rounded-2xl elevation-1 border h-100" variant="flat">
              <div class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">User Network</div>
              <div class="text-caption text-grey mb-4">Shippers, Transporters & Back-office</div>
              <div class="d-flex justify-center" style="min-height: 280px;">
                <apexchart
                  type="donut"
                  width="100%"
                  height="280"
                  :options="usersRoleOptions"
                  :series="usersRoleSeries"
                />
              </div>
            </v-card>
          </v-col>

          <!-- Cancellation Breakdown -->
          <v-col cols="12" md="4">
            <v-card class="pa-5 rounded-2xl elevation-1 border h-100" variant="flat">
              <div class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">Cancellations by Actor</div>
              <div class="text-caption text-grey mb-4">Client vs Transporter vs Admin</div>
              <div class="d-flex justify-center" style="min-height: 280px;">
                <apexchart
                  type="donut"
                  width="100%"
                  height="280"
                  :options="cancellationByOptions"
                  :series="cancellationBySeries"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </BaseLayout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import moment from 'moment'
import axios from 'axios'

export default {
  components: {
    BaseLayout
  },
  data: () => ({
    loadingPage: true,
    selection: 'all',
    trips: [],
    items: [
      { title: 'TripsInProgress', icon: 'mdi-truck-delivery-outline', to: '/trips', color: '#0284C7', bgColor: '#E0F2FE', count: 0, totalAmount: 0 },
      { title: 'TripsCanceled', icon: 'mdi-close-circle-outline', to: '/trips', color: '#EF4444', bgColor: '#FEE2E2', count: 0, totalAmount: 0 },
      { title: 'TripsFinished', icon: 'mdi-check-decagram-outline', to: '/trips', color: '#10B981', bgColor: '#D1FAE5', count: 0, totalAmount: 0 },
      { title: 'Clients', icon: 'mdi-account-group-outline', to: '/users', color: '#6366F1', bgColor: '#EEF2FF', count: 0, totalAmount: 0 },
      { title: 'Transporters', icon: 'mdi-truck-fast-outline', to: '/users', color: '#F59E0B', bgColor: '#FEF3C7', count: 0, totalAmount: 0 },
      { title: 'Administrators', icon: 'mdi-shield-crown-outline', to: '/users', color: '#0F766E', bgColor: '#CCFBF1', count: 0, totalAmount: 0 },
    ],
    tripsOptions: {
      chart: {
        id: 'vuechart-trips',
        toolbar: { show: false },
        fontFamily: 'inherit'
      },
      colors: ['#0D47A1'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100]
        }
      },
      xaxis: {
        categories: []
      },
      dataLabels: { enabled: false },
      tooltip: {
        y: {
          formatter: (val) => `${val} DZD`
        }
      }
    },
    tripsSeries: [{
      name: 'Revenue',
      data: []
    }],
    tripsStatusOptions: {
      chart: { id: 'vuechart-tripsStates', fontFamily: 'inherit' },
      colors: ['#10B981', '#EF4444', '#0284C7', '#F59E0B'],
      labels: [],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true }
    },
    tripsStatusSeries: [],
    usersRoleOptions: {
      chart: { id: 'vuechart-usersStates', fontFamily: 'inherit' },
      colors: ['#6366F1', '#F59E0B', '#0F766E'],
      labels: [],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true }
    },
    usersRoleSeries: [],
    cancellationByOptions: {
      chart: { id: 'vuechart-cancellationBy', fontFamily: 'inherit' },
      colors: ['#F43F5E', '#FB923C', '#A855F7', '#94A3B8'],
      labels: [],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true }
    },
    cancellationBySeries: []
  }),
  methods: {
    async init() {
      await Promise.all([this.loadTrips(), this.loadUsers()])
      this.loadingPage = false
    },
    async loadTrips() {
      const user = JSON.parse(localStorage.getItem('userInfo'))
      if (!user) return
      try {
        const response = await axios.get('api/trips', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
        const tripsItems = response.data || []
        this.trips = tripsItems

        const finishedTrips = tripsItems.filter(i => i.status === 'finished')
        this.items[2].count = finishedTrips.length
        this.items[2].totalAmount = finishedTrips.reduce((prev, cur) => prev + (cur.price || 0), 0)

        this.items[0].count = tripsItems.filter(i => i.status === 'started' || i.status === 'accepted').length
        this.items[1].count = tripsItems.filter(i => i.status === 'canceled').length

        const categories = []
        const data = []
        const states = []
        const cancellationBy = []

        finishedTrips.forEach(i => {
          categories.push(this.formatDate(i.start || i.createdAt))
          data.push(i.price || 0)
        })

        tripsItems.forEach(i => states.push(i.status || 'planned'))
        const by = tripsItems.filter(i => i.cancellation?.by)
        by.forEach(i => cancellationBy.push(i.cancellation.by))

        this.tripsOptions = {
          ...this.tripsOptions,
          xaxis: { categories }
        }
        this.tripsSeries = [{ name: 'Revenue', data }]

        const counts = {}
        states.forEach(x => counts[x] = (counts[x] || 0) + 1)
        this.tripsStatusOptions = { ...this.tripsStatusOptions, labels: Object.keys(counts) }
        this.tripsStatusSeries = Object.values(counts)

        const cancelCounts = {}
        cancellationBy.forEach(x => cancelCounts[x] = (cancelCounts[x] || 0) + 1)
        this.cancellationByOptions = { ...this.cancellationByOptions, labels: Object.keys(cancelCounts) }
        this.cancellationBySeries = Object.values(cancelCounts)
      } catch (err) {
        console.error('Error loading trips analytics:', err)
      }
    },
    async loadUsers() {
      const user = JSON.parse(localStorage.getItem('userInfo'))
      if (!user) return
      try {
        const response = await axios.get('api/users', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
        const usersItems = response.data || []

        this.items[3].count = usersItems.filter(i => i.role === 'client').length
        this.items[4].count = usersItems.filter(i => i.role === 'transporter').length
        this.items[5].count = usersItems.filter(i => i.role === 'administrator').length

        const states = []
        usersItems.forEach(i => states.push(i.role))
        const counts = {}
        states.forEach(x => counts[x] = (counts[x] || 0) + 1)
        this.usersRoleOptions = { ...this.usersRoleOptions, labels: Object.keys(counts) }
        this.usersRoleSeries = Object.values(counts)
      } catch (err) {
        console.error('Error loading users analytics:', err)
      }
    },
    formatDate(value) {
      return moment(value).locale(this.$i18n.locale).format("DD MMM YYYY")
    },
    formatNumber(value) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: 'DZD' }).format(value || 0)
    },
    filterTrips(firstDay, lastDay) {
      let filtered = this.trips.filter(i => i.status === 'finished')
      if (firstDay) {
        filtered = filtered.filter(i => new Date(i.start || i.createdAt) >= firstDay && new Date(i.start || i.createdAt) <= lastDay)
      }
      const categories = filtered.map(i => this.formatDate(i.start || i.createdAt))
      const data = filtered.map(i => i.price || 0)

      this.tripsOptions = {
        ...this.tripsOptions,
        xaxis: { categories }
      }
      this.tripsSeries = [{ name: 'Revenue', data }]
    },
    updateData(timeline) {
      this.selection = timeline
      const now = new Date()
      switch (timeline) {
        case 'one_month':
          this.filterTrips(new Date(now.getFullYear(), now.getMonth() - 1, 1), now)
          break
        case 'six_months':
          this.filterTrips(new Date(now.getFullYear(), now.getMonth() - 6, 1), now)
          break
        case 'one_year':
          this.filterTrips(new Date(now.getFullYear() - 1, now.getMonth(), 1), now)
          break
        case 'all':
        default:
          this.filterTrips(null, now)
          break
      }
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  border-color: #e2e8f0;
  background-color: #ffffff;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08) !important;
}
.tracking-wide {
  letter-spacing: 0.05em;
}
</style>