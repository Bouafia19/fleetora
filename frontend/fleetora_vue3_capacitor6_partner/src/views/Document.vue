<template>
  <div class="document-upload-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="#00366F"
        @click="$router.go(-1)"
        class="back-btn"
        aria-label="Back"
      ></v-btn>
      <div class="page-title">
        <span class="font-weight-bold text-slate-800 text-capitalize">
          {{ formatDocTitle(users.getTitle) }}
        </span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="#00366F" size="48"></v-progress-circular>
        <p class="text-body-2 text-slate-500 mt-3">Uploading document to secure vault...</p>
      </div>

      <div v-else>
        <!-- Document Frame Card -->
        <v-card class="doc-frame-card pa-4 mb-4 text-center" elevation="1">
          <!-- Document Status Badge -->
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-caption font-weight-bold text-slate-500 text-uppercase">DOCUMENT SCAN</span>
            <v-chip
              size="small"
              :color="users.getPhoto || photo ? 'success' : 'warning'"
              variant="flat"
              class="font-weight-bold text-white"
            >
              <v-icon start size="14" class="mr-1">
                {{ (users.getPhoto || photo) ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ (users.getPhoto || photo) ? 'Uploaded' : 'Action Required' }}
            </v-chip>
          </div>

          <!-- Document Preview Area -->
          <div class="doc-preview-area mb-3">
            <v-img
              v-if="photo || users.getPhoto"
              :src="photo || users.getPhoto"
              aspect-ratio="1.4"
              cover
              class="rounded-lg shadow-sm"
            ></v-img>
            <div v-else class="doc-placeholder-guide d-flex flex-column align-center justify-center py-8">
              <v-icon color="#94A3B8" size="48" class="mb-2">mdi-camera-metering-center</v-icon>
              <span class="text-subtitle-2 font-weight-bold text-slate-700">Scan or Upload Document</span>
              <span class="text-caption text-slate-400 mt-1 px-4">
                Ensure all 4 corners and text are sharp, readable, and free of glare.
              </span>
            </div>
          </div>

          <!-- Error Alert -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-3"
          >
            {{ $t(err) || err }}
          </v-alert>

          <!-- Camera Trigger Component -->
          <div class="camera-actions mb-2">
            <use-camera @cameraUpload="uploadImage($event)" pageTitle="document" />
          </div>
        </v-card>

        <!-- Submit & Done Button -->
        <v-btn
          color="#00366F"
          block
          size="large"
          rounded="lg"
          elevation="2"
          class="text-none font-weight-bold text-white"
          @click="$router.go(-1)"
        >
          <v-icon start class="mr-2">mdi-check</v-icon>
          {{ $t('submit') || 'Save & Continue' }}
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import UseCamera from '@/components/UseCamera.vue'

const users = useUsersStore()

const err = ref('')
const loading = ref(false)
const photo = ref(null)

const formatDocTitle = (title) => {
  if (!title) return 'Document Verification'
  return title
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const uploadImage = async (img64) => {
  loading.value = true
  err.value = ''
  try {
    await users.uploadPartnerImages({
      [users.getTitle]: img64,
      name: users.getTitle
    })
    photo.value = img64
    users.photo = img64
    if (!users.images) users.images = {}
    users.images[users.getTitle] = img64
  } catch (error) {
    err.value = error.message || 'Failed to upload document'
    console.log('error update document', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (users.photo) {
    photo.value = users.photo
  }
})
</script>

<style scoped>
.document-upload-view {
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

.doc-frame-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.doc-preview-area {
  background: #F1F5F9;
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-slate-400 {
  color: #94A3B8;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-800 {
  color: #1E293B;
}
</style>