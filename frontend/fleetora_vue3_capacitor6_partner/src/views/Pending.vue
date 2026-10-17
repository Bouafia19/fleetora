<template>
  <div class="pending-approval-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <div class="brand-title">
        <span class="brand-text">FLEETORA</span>
        <span class="partner-badge ml-2">PARTNER</span>
      </div>
      <v-btn
        variant="text"
        color="#EF4444"
        size="small"
        class="text-none font-weight-bold"
        @click="auth_sign_out"
      >
        <v-icon start size="18">mdi-logout</v-icon>
        {{ $t('logout') || 'Sign Out' }}
      </v-btn>
    </div>

    <v-container class="px-4 py-8" style="max-width: 480px;">
      <!-- Main Status Card -->
      <v-card class="status-card pa-6 text-center mb-6" elevation="1">
        <div class="status-badge-wrapper mx-auto mb-4">
          <div class="pulse-ring"></div>
          <v-avatar color="#E0F2FE" size="76" class="status-avatar">
            <v-icon color="#00366F" size="40">mdi-shield-sync-outline</v-icon>
          </v-avatar>
        </div>

        <h1 class="text-h5 font-weight-bold text-slate-900 mb-2">
          {{ $t('pending') || 'Application Under Review' }}
        </h1>
        <p class="text-body-2 text-slate-500 mb-6">
          Our compliance & safety dispatch team is verifying your carrier documents and vehicle eligibility.
        </p>

        <!-- Progress Steps -->
        <div class="verification-steps text-start mb-6">
          <div class="step-item d-flex align-start mb-4">
            <div class="step-icon-dot done mr-3">
              <v-icon color="#FFFFFF" size="14">mdi-check</v-icon>
            </div>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-800">Registration & Documents</div>
              <div class="text-caption text-slate-500">All required KYC documents uploaded successfully</div>
            </div>
          </div>

          <div class="step-connector"></div>

          <div class="step-item d-flex align-start mb-4">
            <div class="step-icon-dot in-progress mr-3">
              <span class="inner-dot"></span>
            </div>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-800">Compliance Audit</div>
              <div class="text-caption text-slate-500">In review by Fleetora dispatch compliance</div>
            </div>
          </div>

          <div class="step-connector"></div>

          <div class="step-item d-flex align-start">
            <div class="step-icon-dot pending mr-3">
              <span class="inner-dot-pending"></span>
            </div>
            <div>
              <div class="text-subtitle-2 font-weight-medium text-slate-400">Account Activation</div>
              <div class="text-caption text-slate-400">Receive live freight loads and dispatch offers</div>
            </div>
          </div>
        </div>

        <!-- Refresh / Check Status Button -->
        <v-btn
          color="#00366F"
          block
          size="large"
          rounded="lg"
          elevation="2"
          class="text-none font-weight-bold text-white mb-3"
          :loading="checking"
          @click="checkStatus"
        >
          <v-icon start class="mr-2">mdi-refresh</v-icon>
          Check Verification Status
        </v-btn>

        <!-- Estimated Time Notice -->
        <div class="d-flex align-center justify-center text-caption text-slate-400">
          <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
          Estimated turnaround: 2 – 4 business hours
        </div>
      </v-card>

      <!-- Expedite / Support Card -->
      <v-card class="support-contact-card pa-4" elevation="1">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="#F0F9FF" size="40" class="mr-3">
              <v-icon color="#0EA5E9" size="22">mdi-phone-in-talk-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Need Immediate Activation?</div>
              <div class="text-caption text-slate-500">Contact carrier onboarding desk</div>
            </div>
          </div>
          <v-btn
            color="#0EA5E9"
            variant="tonal"
            size="small"
            rounded="pill"
            class="text-none font-weight-bold"
            href="tel:+213662244435"
          >
            Call Desk
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

const auth = useAuthStore()
const users = useUsersStore()
const router = useRouter()

const checking = ref(false)

const auth_sign_out = async () => {
  await auth.account_sign_out()
  router.push('/login')
}

const checkStatus = async () => {
  checking.value = true
  try {
    await users.fetchUser()
    await users.loadUser()
    if (users.user?.fileStatus === 'accepted' || users.user?.activated) {
      router.push('/tabs')
    }
  } catch (e) {
    console.log('Error refreshing status', e)
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  users.fetchUser().then(() => {
    users.loadUser()
    if (users.user?.fileStatus === 'accepted' || users.user?.activated) {
      router.push('/tabs')
    }
  })
})
</script>

<style scoped>
.pending-approval-view {
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

.brand-title {
  display: flex;
  align-items: center;
}

.brand-text {
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #00366F;
  font-size: 15px;
}

.partner-badge {
  background: #0EA5E9;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.status-card {
  background: #FFFFFF;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
}

.status-badge-wrapper {
  position: relative;
  display: inline-block;
}

.pulse-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 2px solid #0EA5E9;
  animation: pulse-ring 2s infinite;
  opacity: 0.6;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.verification-steps {
  position: relative;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
}

.step-item {
  position: relative;
  z-index: 1;
}

.step-icon-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-icon-dot.done {
  background: #10B981;
}

.step-icon-dot.in-progress {
  background: #E0F2FE;
  border: 2px solid #0EA5E9;
}

.step-icon-dot.pending {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
}

.inner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0EA5E9;
}

.inner-dot-pending {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94A3B8;
}

.support-contact-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
}

.text-slate-400 {
  color: #94A3B8;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>