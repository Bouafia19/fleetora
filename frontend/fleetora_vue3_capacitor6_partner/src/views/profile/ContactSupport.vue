<template>
  <div class="partner-support-view">
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
        <span class="font-weight-bold text-slate-800">{{ $t('contactSupport') || 'Carrier Dispatch Desk' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-6" style="max-width: 480px;">
      <!-- Hero Support Header -->
      <div class="support-hero text-center mb-6">
        <div class="support-icon-circle mb-3">
          <v-icon color="#00366F" size="36">mdi-radio-tower</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">Carrier Dispatch Control</h1>
        <p class="text-body-2 text-slate-500 mb-2">
          Real-time driver support, route guidance, and roadside cargo assistance.
        </p>
        <v-chip size="small" color="success" variant="flat" class="font-weight-medium">
          <v-icon start size="14" class="mr-1">mdi-circle</v-icon>
          Dispatch Tower Active
        </v-chip>
      </div>

      <!-- Action Cards -->
      <div class="support-cards-list mb-6">
        <!-- Emergency Hotline Card -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="call">
          <div class="d-flex align-center">
            <div class="channel-icon-bg emergency mr-4">
              <v-icon color="#EF4444" size="24">mdi-phone-alert</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Emergency Dispatch Hotline</div>
              <div class="text-caption text-slate-500">+213 662 24 44 35 (24/7 Priority)</div>
            </div>
            <v-btn color="#EF4444" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Call Now
            </v-btn>
          </div>
        </v-card>

        <!-- Carrier Relations Email -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="sendEmail">
          <div class="d-flex align-center">
            <div class="channel-icon-bg email mr-4">
              <v-icon color="#0EA5E9" size="24">mdi-email-outline</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Carrier Relations Desk</div>
              <div class="text-caption text-slate-500">partners@fleetora.com</div>
            </div>
            <v-btn color="#0EA5E9" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Email
            </v-btn>
          </div>
        </v-card>

        <!-- WhatsApp Dispatch Channel -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="openWhatsApp">
          <div class="d-flex align-center">
            <div class="channel-icon-bg whatsapp mr-4">
              <v-icon color="#10B981" size="24">mdi-whatsapp</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">WhatsApp Driver Desk</div>
              <div class="text-caption text-slate-500">Fast assistance on cargo route</div>
            </div>
            <v-btn color="#10B981" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Chat
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Carrier Guidelines FAQ -->
      <v-card class="faq-card pa-5" elevation="1">
        <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-3">Carrier Guidelines & FAQs</h3>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            title="What should I do if a customer cancels at pickup?"
            text="If a customer cancels after you have already traveled to the pickup destination, Fleetora credits your account with a cancellation compensation fee automatically."
          ></v-expansion-panel>
          <v-expansion-panel
            title="When are trip earnings deposited into my wallet?"
            text="Immediately upon delivery confirmation and digital signature by the recipient, your fare is credited to your partner wallet."
          ></v-expansion-panel>
          <v-expansion-panel
            title="How do I change my registered vehicle type?"
            text="Contact the carrier relations desk with your updated vehicle registration (carte grise) and insurance documents for expedited vehicle re-classification."
          ></v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { CallNumber } from '@awesome-cordova-plugins/call-number'
import { Capacitor } from '@capacitor/core'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/tabs')
  }
}

const call = () => {
  if (Capacitor.isNativePlatform()) {
    CallNumber.callNumber('+213662244435', true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err))
  } else {
    window.location.href = 'tel:+213662244435'
  }
}

const sendEmail = () => {
  window.location.href = 'mailto:partners@fleetora.com?subject=Fleetora%20Carrier%20Assistance'
}

const openWhatsApp = () => {
  window.open('https://wa.me/213662244435?text=Hello%20Fleetora%20Carrier%20Desk', '_blank')
}
</script>

<style scoped>
.partner-support-view {
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

.support-icon-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #E0F2FE;
}

.contact-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.contact-card:active {
  transform: scale(0.98);
}

.channel-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.channel-icon-bg.emergency {
  background: #FEE2E2;
}

.channel-icon-bg.email {
  background: #F0F9FF;
}

.channel-icon-bg.whatsapp {
  background: #ECFDF5;
}

.faq-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
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

.flex-1 {
  flex: 1;
}
</style>