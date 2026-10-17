<template>
  <div class="partner-notifications-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="#00366F"
        @click="goBack"
        class="back-btn"
        aria-label="Back"
      ></v-btn>
      <div class="page-title">
        <span class="font-weight-bold text-slate-800">{{ $t('notifications') || 'Dispatch Bulletins' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Loading State -->
      <div v-if="!announcements.getAnnouncementsByTransporterId" class="text-center py-12">
        <v-progress-circular indeterminate color="#00366F" size="44"></v-progress-circular>
        <p class="text-body-2 text-slate-500 mt-3">Loading dispatch bulletins...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="announcements.getAnnouncementsByTransporterId.length === 0"
        class="empty-notifications text-center py-12"
      >
        <div class="empty-icon-circle mx-auto mb-3">
          <v-icon color="#94A3B8" size="40">mdi-bell-badge-outline</v-icon>
        </div>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">
          {{ $t('noRecords') || 'No Dispatch Bulletins' }}
        </h3>
        <p class="text-body-2 text-slate-500 mb-0">
          Important network notices, tariff updates, and route alerts will appear here.
        </p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list">
        <v-card
          v-for="item in announcements.getAnnouncementsByTransporterId"
          :key="item._id"
          class="bulletin-card mb-3 pa-4"
          elevation="1"
        >
          <div class="d-flex align-start">
            <div class="bulletin-icon-bg mr-3">
              <v-icon color="#00366F" size="20">mdi-radio-hand-held</v-icon>
            </div>
            <div class="flex-1">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-subtitle-2 font-weight-bold text-slate-900">{{ item.title }}</span>
                <span class="text-caption text-slate-400">{{ formatDate(item.createdAt) }}</span>
              </div>
              <p class="text-body-2 text-slate-600 mb-2">{{ item.body }}</p>
              <div class="d-flex align-center">
                <v-chip size="x-small" color="#00366F" variant="flat" class="font-weight-bold text-white">
                  Carrier Broadcast
                </v-chip>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'

const router = useRouter()
const announcements = useAnnouncementsStore()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/tabs')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent'
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Recent'
  }
}

onMounted(() => {
  announcements.fetchAnnouncementsByTransporterId()
})
</script>

<style scoped>
.partner-notifications-view {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 24px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.empty-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #F1F5F9;
}

.bulletin-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
}

.bulletin-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #E0F2FE;
  flex-shrink: 0;
}

.flex-1 {
  flex: 1;
}

.text-slate-400 {
  color: #94A3B8;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-600 {
  color: #475569;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>