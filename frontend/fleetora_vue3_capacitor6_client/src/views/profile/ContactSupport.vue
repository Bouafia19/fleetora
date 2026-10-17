<template>
  <div class="support-view">
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
        <span class="font-weight-bold text-slate-800">{{ $t('contactSupport') || 'Help & Support' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-6" style="max-width: 480px;">
      <!-- Hero Support Header -->
      <div class="support-hero text-center mb-6">
        <div class="support-icon-circle mb-3">
          <v-icon color="#00366F" size="36">mdi-headset</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">We're Here to Help</h1>
        <p class="text-body-2 text-slate-500 mb-2">
          Fleetora dispatch & customer assistance is active 24/7 across Algeria.
        </p>
        <v-chip size="small" color="success" variant="flat" class="font-weight-medium">
          <v-icon start size="14" class="mr-1">mdi-circle</v-icon>
          Dispatch Centers Online
        </v-chip>
      </div>

      <!-- Action Cards -->
      <div class="support-cards-list mb-6">
        <!-- Phone Call Card -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="call">
          <div class="d-flex align-center">
            <div class="channel-icon-bg phone mr-4">
              <v-icon color="#00366F" size="24">mdi-phone</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Direct Dispatch Hotline</div>
              <div class="text-caption text-slate-500">+213 662 24 44 35 (Toll-Free)</div>
            </div>
            <v-btn color="#00366F" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Call Now
            </v-btn>
          </div>
        </v-card>

        <!-- Email Support Card -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="sendEmail">
          <div class="d-flex align-center">
            <div class="channel-icon-bg email mr-4">
              <v-icon color="#0EA5E9" size="24">mdi-email-outline</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Email Support</div>
              <div class="text-caption text-slate-500">support@fleetora.com</div>
            </div>
            <v-btn color="#0EA5E9" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Email
            </v-btn>
          </div>
        </v-card>

        <!-- WhatsApp Support Card -->
        <v-card class="contact-card mb-3 pa-4" elevation="1" @click="openWhatsApp">
          <div class="d-flex align-center">
            <div class="channel-icon-bg whatsapp mr-4">
              <v-icon color="#10B981" size="24">mdi-whatsapp</v-icon>
            </div>
            <div class="flex-1">
              <div class="text-subtitle-2 font-weight-bold text-slate-900">WhatsApp Instant Chat</div>
              <div class="text-caption text-slate-500">Immediate priority response</div>
            </div>
            <v-btn color="#10B981" variant="tonal" rounded="pill" size="small" class="text-none font-weight-bold">
              Chat
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- FAQ Section -->
      <v-card class="faq-card pa-5" elevation="1">
        <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-3">Frequently Asked Questions</h3>
        <v-expansion-panels variant="accordion" class="custom-expansion">
          <v-expansion-panel
            title="How are transport rates calculated?"
            text="Rates are determined dynamically based on distance (km), vehicle payload capacity, and route conditions. All prices are calculated transparently before booking."
          ></v-expansion-panel>
          <v-expansion-panel
            title="Can I track my cargo live on the map?"
            text="Yes. Once a carrier accepts your request and starts the trip, you can monitor the driver's real-time GPS position until delivery."
          ></v-expansion-panel>
          <v-expansion-panel
            title="How do I get an official billing invoice?"
            text="Invoices are automatically generated upon trip completion and available directly in your trip history or dispatched to your registered email."
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
    router.push('/profile')
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
  window.location.href = 'mailto:support@fleetora.com?subject=Fleetora%20Customer%20Assistance'
}

const openWhatsApp = () => {
  window.open('https://wa.me/213662244435?text=Hello%20Fleetora%20Support', '_blank')
}
</script>

<style scoped>
.support-view {
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.channel-icon-bg.phone {
  background: #E0F2FE;
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