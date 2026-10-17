<template>
  <div class="update-profile-view">
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
        <span class="font-weight-bold text-slate-800">{{ $t('profileUpdate') || 'Edit Profile' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-6" style="max-width: 480px;">
      <!-- Avatar & Photo Upload Section -->
      <div class="avatar-section text-center mb-6">
        <div class="avatar-wrapper">
          <v-avatar size="110" class="profile-avatar elevation-2">
            <v-img
              :src="photo || users.user.avatar || defaultAvatar"
              cover
              alt="Profile"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height bg-slate-100">
                  <v-icon color="#64748B" size="48">mdi-account</v-icon>
                </div>
              </template>
            </v-img>
          </v-avatar>
          <div class="camera-btn-wrapper">
            <use-camera @cameraUpload="uploadImage($event)" />
          </div>
        </div>
        <p class="text-caption text-slate-500 mt-2 mb-0">Tap camera icon to update photo</p>
      </div>

      <v-card class="form-card pa-6" elevation="1">
        <form @submit.prevent="submit">
          <!-- Language Selector -->
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('cl') || 'Application Language' }}</label>
            <v-select
              v-model="$i18n.locale"
              :items="locals"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-translate"
              hide-details
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="$t(item.raw.title)"></v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <span class="font-weight-medium text-slate-800">{{ $t(item.title) }}</span>
              </template>
            </v-select>
          </div>

          <!-- First Name -->
          <div class="mb-3">
            <label class="input-label mb-2 d-block">{{ $t('firstName') || 'First Name' }}</label>
            <v-text-field
              v-model="users.user.firstName"
              placeholder="First Name"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-account-outline"
              hide-details
              required
            ></v-text-field>
          </div>

          <!-- Last Name -->
          <div class="mb-3">
            <label class="input-label mb-2 d-block">{{ $t('lastName') || 'Last Name' }}</label>
            <v-text-field
              v-model="users.user.lastName"
              placeholder="Last Name"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-account-outline"
              hide-details
              required
            ></v-text-field>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('email') || 'Email Address' }}</label>
            <v-text-field
              v-model="users.user.email"
              placeholder="Email"
              type="email"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-email-outline"
              hide-details
              required
            ></v-text-field>
          </div>

          <!-- Alerts -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            {{ $t(err) || err }}
          </v-alert>

          <v-alert
            v-if="info"
            type="success"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            {{ info }}
          </v-alert>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            color="#00366F"
            block
            size="large"
            rounded="lg"
            elevation="2"
            class="text-none font-weight-bold text-white mb-2"
            :loading="loading"
          >
            {{ $t('update') || 'Save Profile' }}
            <v-icon end class="ml-2">mdi-check-circle-outline</v-icon>
          </v-btn>
        </form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useI18n } from 'vue-i18n'
import UseCamera from '@/components/UseCamera.vue'

const router = useRouter()
const { locale } = useI18n()
const users = useUsersStore()

const defaultAvatar = new URL('@/assets/avatar.png', import.meta.url).href

const locals = ref([
  { value: "ar", title: "arabic" },
  { value: "fr", title: "french" },
  { value: "en", title: "english" }
])

const err = ref('')
const loading = ref(false)
const photo = ref(null)
const info = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/profile')
  }
}

const uploadImage = (value) => {
  photo.value = value
}

const submit = async () => {
  loading.value = true
  err.value = ''
  info.value = ''
  
  const userObj = {
    language: locale.value,
    firstName: users.user.firstName,
    lastName: users.user.lastName,
    email: users.user.email
  }
  if (photo.value) {
    userObj.photo = photo.value
  }

  try {
    await users.updateUserProfile(userObj)
    info.value = 'Profile updated successfully'
    setTimeout(() => {
      info.value = ''
      router.push('/profile')
    }, 1200)
  } catch (error) {
    err.value = error.message || 'Failed to update profile'
    console.log('error user information', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.update-profile-view {
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 3px solid #FFFFFF;
  box-shadow: 0 4px 14px rgba(0, 54, 111, 0.12);
  background: #F1F5F9;
}

.camera-btn-wrapper {
  position: absolute;
  bottom: 0;
  right: -4px;
}

.form-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-800 {
  color: #1E293B;
}
</style>