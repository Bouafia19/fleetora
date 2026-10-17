<template>
  <div>
    <!-- Floating Responsive Install Banner -->
    <transition name="slide-up">
      <div 
        v-if="shouldShowBanner" 
        class="fl-install-banner-wrapper"
        role="region" 
        aria-label="Install Fleetora Application"
      >
        <v-card class="fl-install-card elevation-4 pa-4 rounded-xl border-slate">
          <div class="d-flex align-center">
            <!-- New GPS Brand Icon -->
            <div class="fl-icon-container me-3 flex-shrink-0">
              <img 
                src="/brand/fleetora-gps-icon.svg" 
                alt="Fleetora GPS Icon" 
                class="fl-brand-icon"
                width="46"
                height="46"
              />
            </div>

            <!-- Content -->
            <div class="flex-grow-1 overflow-hidden me-2">
              <div class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold text-slate-900 leading-tight">
                  Install Fleetora
                </span>
                <v-chip size="x-small" color="primary" variant="tonal" class="ms-2 px-1 font-weight-bold" style="font-size: 0.6rem;">
                  APP
                </v-chip>
              </div>
              <div class="text-caption text-slate-500 text-truncate mt-1">
                Fast freight dispatch & live tracking app
              </div>
            </div>

            <!-- Dismiss Button -->
            <v-btn
              icon="mdi-close"
              variant="text"
              size="x-small"
              color="slate-400"
              class="ms-1"
              aria-label="Dismiss install prompt"
              @click="dismissBanner"
            ></v-btn>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex align-center justify-end gap-2 mt-3 pt-2 border-t border-opacity-10">
            <v-btn
              variant="text"
              density="comfortable"
              size="small"
              color="slate-600"
              class="text-none font-weight-medium px-3"
              @click="dismissBanner"
            >
              Not now
            </v-btn>

            <v-btn
              color="primary"
              density="comfortable"
              size="small"
              prepend-icon="mdi-download"
              class="text-none font-weight-bold px-4 elevation-1 rounded-lg"
              @click="handleInstallClick"
            >
              Install
            </v-btn>
          </div>
        </v-card>
      </div>
    </transition>

    <!-- Platform-Specific Installation Guide Modal -->
    <v-dialog v-model="showGuideModal" max-width="480">
      <v-card class="pa-6 rounded-2xl">
        <div class="text-center mb-4">
          <img 
            src="/brand/fleetora-gps-icon.svg" 
            alt="Fleetora GPS" 
            width="64" 
            height="64"
            class="elevation-2 rounded-xl mb-3"
          />
          <div class="text-h6 font-weight-bold text-slate-900">Install Fleetora</div>
          <div class="text-caption text-slate-500">
            Enterprise Freight & Smart Logistics Platform
          </div>
        </div>

        <v-divider class="mb-4"></v-divider>

        <!-- iOS Instructions -->
        <div v-if="platform === 'ios'" class="fl-guide-steps">
          <div class="text-body-2 font-weight-medium text-slate-800 mb-3">
            To install Fleetora on your iPhone or iPad:
          </div>

          <div class="d-flex align-start mb-3">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              1
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Tap the <strong>Share</strong> button <v-icon icon="mdi-export-variant" color="accent" size="18"></v-icon> at the bottom of Safari.
            </div>
          </div>

          <div class="d-flex align-start mb-3">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              2
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Scroll down and select <strong>Add to Home Screen</strong> <v-icon icon="mdi-plus-box-outline" color="primary" size="18"></v-icon>.
            </div>
          </div>

          <div class="d-flex align-start">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              3
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Tap <strong>Add</strong> in the top right to launch Fleetora directly from your home screen.
            </div>
          </div>
        </div>

        <!-- Android / Desktop Fallback Instructions -->
        <div v-else class="fl-guide-steps">
          <div class="text-body-2 font-weight-medium text-slate-800 mb-3">
            To install Fleetora as an application:
          </div>

          <div class="d-flex align-start mb-3">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              1
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Open your browser menu (<strong>⋮</strong> or <strong>⋯</strong>) or check the browser address bar.
            </div>
          </div>

          <div class="d-flex align-start mb-3">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              2
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Select <strong>Install Fleetora</strong> or <strong>Install app</strong>.
            </div>
          </div>

          <div class="d-flex align-start">
            <v-avatar color="primary-50" size="32" class="me-3 flex-shrink-0 text-primary font-weight-bold">
              3
            </v-avatar>
            <div class="text-body-2 text-slate-700">
              Fleetora will launch in standalone window mode without browser bars.
            </div>
          </div>
        </div>

        <div class="mt-6 pt-2">
          <v-btn
            block
            color="primary"
            class="text-none font-weight-bold rounded-lg"
            @click="showGuideModal = false"
          >
            Got it
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const {
  isInstalled,
  shouldShowBanner,
  showGuideModal,
  platform,
  initPwa,
  promptInstall,
  dismissBanner
} = usePwaInstall()

onMounted(() => {
  initPwa()
})

const handleInstallClick = async () => {
  await promptInstall()
}
</script>

<style scoped>
.fl-install-banner-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 400px;
  width: calc(100vw - 32px);
}

.fl-install-card {
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 25px -5px rgba(0, 54, 111, 0.15), 0 8px 10px -6px rgba(0, 54, 111, 0.1) !important;
}

.fl-brand-icon {
  display: block;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 54, 111, 0.2);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

@media (max-width: 600px) {
  .fl-install-banner-wrapper {
    bottom: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>
