import { ref, computed } from 'vue'

// Reactive singleton state
const deferredPrompt = ref(null)
const isInstalled = ref(false)
const isInstallable = ref(false)
const isDismissed = ref(false)
const showGuideModal = ref(false)
const platform = ref('unknown') // 'android', 'ios', 'desktop', 'unknown'
let isInitialized = false

const checkInstallationStatus = () => {
  if (typeof window === 'undefined') return false

  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))

  isInstalled.value = Boolean(isStandalone)
  return isInstalled.value
}

const detectPlatform = () => {
  if (typeof window === 'undefined') return 'unknown'
  const ua = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios'
  }
  if (/android/.test(ua)) {
    return 'android'
  }
  if (/windows|macintosh|linux/.test(ua) && !/mobile/.test(ua)) {
    return 'desktop'
  }
  return 'unknown'
}

// Check dismissal state from localStorage
const checkDismissal = () => {
  if (typeof window === 'undefined') return false
  const dismissedTime = localStorage.getItem('fleetora_pwa_dismissed')
  if (dismissedTime) {
    const elapsed = Date.now() - parseInt(dismissedTime, 10)
    // 3 days cooldown for the floating banner
    if (elapsed < 3 * 24 * 60 * 60 * 1000) {
      isDismissed.value = true
      return true
    }
  }
  isDismissed.value = false
  return false
}

export function usePwaInstall() {
  const initPwa = () => {
    if (typeof window === 'undefined' || isInitialized) return
    isInitialized = true

    platform.value = detectPlatform()
    checkInstallationStatus()
    checkDismissal()

    // Listen for display-mode changes
    try {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        isInstalled.value = e.matches
      })
    } catch (_) {}

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      deferredPrompt.value = e
      isInstallable.value = true

      // Avoid suppressing browser's native install experience unnecessarily
      // Only preventDefault when our custom prompt banner is actively eligible to be displayed
      if (!isDismissed.value && (platform.value === 'android' || platform.value === 'desktop')) {
        try {
          e.preventDefault()
        } catch (_) {}
      }
    })

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isInstallable.value = false
      isInstalled.value = true
      isDismissed.value = true
      localStorage.removeItem('fleetora_pwa_dismissed')
    })
  }

  const promptInstall = async () => {
    if (deferredPrompt.value) {
      try {
        await deferredPrompt.value.prompt()
        const userChoice = await deferredPrompt.value.userChoice
        if (userChoice && userChoice.outcome === 'accepted') {
          isInstalled.value = true
          isInstallable.value = false
        }
        deferredPrompt.value = null
        return userChoice?.outcome || 'dismissed'
      } catch (err) {
        console.warn('Failed to invoke native install prompt:', err)
        showGuideModal.value = true
        return 'guide'
      }
    } else {
      // Show manual installation guide if browser doesn't support automatic prompt
      showGuideModal.value = true
      return 'guide'
    }
  }

  const dismissBanner = () => {
    isDismissed.value = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('fleetora_pwa_dismissed', Date.now().toString())
    }
  }

  // Show banner if not installed, not dismissed, and (installable OR mobile browser needing guide)
  const shouldShowBanner = computed(() => {
    if (isInstalled.value || isDismissed.value) return false
    return isInstallable.value || platform.value === 'ios' || platform.value === 'android'
  })

  // Can show install action in header/drawer anytime if not already installed
  const canShowHeaderButton = computed(() => {
    return !isInstalled.value
  })

  return {
    deferredPrompt,
    isInstalled,
    isInstallable,
    isDismissed,
    showGuideModal,
    platform,
    shouldShowBanner,
    canShowHeaderButton,
    initPwa,
    promptInstall,
    dismissBanner
  }
}
