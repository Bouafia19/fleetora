<template>
  <BaseLayout>
    <v-container fluid class="pa-6">
      <!-- Welcome Header -->
      <v-card class="pa-6 mb-6 rounded-2xl bg-gradient-fleetora text-white elevation-2">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="text-overline letter-spacing-1 text-cyan-accent-2">FLEETORA MOBILITY CONTROL</div>
            <div class="text-h4 font-weight-bold mb-2">Smart Freight Operations Platform</div>
            <div class="text-body-1 text-blue-grey-lighten-4">
              Real-time dispatch, fleet tracking, cargo trip lifecycle management, and driver compliance verification.
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-end">
            <v-btn
              color="cyan-accent-3"
              variant="flat"
              rounded="lg"
              class="text-none font-weight-bold text-slate-900"
              to="/dashboard"
            >
              <v-icon class="me-2">mdi-chart-line</v-icon>
              View Analytics Dashboard
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Modules Navigation Grid -->
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          lg="3"
          v-for="item in items"
          :key="item.title"
          v-show="['Home', 'About'].includes(item.title) ? true : $can('read', item.title)"
        >
          <v-card
            class="h-100 rounded-xl pa-5 d-flex flex-column justify-space-between transition-card"
            variant="outlined"
            hover
          >
            <div>
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="item.bgColor" size="52" rounded="xl" class="elevation-1">
                  <v-icon :color="item.iconColor" size="28">{{ item.icon }}</v-icon>
                </v-avatar>
                <v-chip size="x-small" :color="item.iconColor" variant="tonal" class="font-weight-bold text-uppercase">
                  {{ $t(item.model) }}
                </v-chip>
              </div>

              <div class="text-h6 font-weight-bold mb-1 text-slate-800">
                {{ $t(item.title) }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mb-4">
                {{ $t(item.description) }}
              </div>
            </div>

            <v-card-actions class="pa-0 pt-3 border-t">
              <v-btn
                block
                rounded="lg"
                variant="tonal"
                :color="item.iconColor"
                :to="item.to"
                :disabled="item.title === 'Home'"
                class="text-none font-weight-bold"
              >
                Access Module
                <v-icon end size="small">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </BaseLayout>
</template>

<script setup>
import BaseLayout from '@/components/BaseLayout.vue'

const items = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard', model: 'component', description: 'CompDash', iconColor: '#0284C7', bgColor: '#E0F2FE' },
  { title: 'Trips', icon: 'mdi-routes-clock', to: '/trips', model: 'trip', description: 'ModTrip', iconColor: '#059669', bgColor: '#D1FAE5' },
  { title: 'Vehicles', icon: 'mdi-truck-fast-outline', to: '/vehicles', model: 'Vehicle', description: 'ModVehicle', iconColor: '#D97706', bgColor: '#FEF3C7' },
  { title: 'Users', icon: 'mdi-account-group-outline', to: '/users', model: 'User', description: 'ModUser', iconColor: '#7C3AED', bgColor: '#EDE9FE' },
  { title: 'Billing', icon: 'mdi-receipt-text-outline', to: '/billing', model: 'Billing', description: 'ModBilling', iconColor: '#2563EB', bgColor: '#DBEAFE' },
  { title: 'Notifications', icon: 'mdi-bell-badge-outline', to: '/notifications', model: 'Notification', description: 'ModNotification', iconColor: '#DC2626', bgColor: '#FEE2E2' },
  { title: 'TermsConditions', icon: 'mdi-file-document-outline', to: '/terms&conditions', model: 'Term', description: 'ModTerm', iconColor: '#0D9488', bgColor: '#CCFBF1' },
  { title: 'Roles', icon: 'mdi-shield-key-outline', to: '/roles', model: 'Roles', description: 'ModRole', iconColor: '#4F46E5', bgColor: '#EEF2FF' },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/setting', model: 'component', description: 'CompSetting', iconColor: '#475569', bgColor: '#F1F5F9' },
  { title: 'About', icon: 'mdi-information-outline', to: '/about', model: 'component', description: 'About Us', iconColor: '#9333EA', bgColor: '#F3E8FF' }
]
</script>

<style scoped>
.bg-gradient-fleetora {
  background: linear-gradient(135deg, #0b192c 0%, #0d47a1 50%, #1565c0 100%);
}
.letter-spacing-1 {
  letter-spacing: 0.1em;
}
.transition-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-color: #e2e8f0;
}
.transition-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(13, 71, 161, 0.15) !important;
}
</style>