<template>
  <base-layout>
    <v-container fluid class="px-4 px-md-10 py-6">
      <v-card class="rounded-xl elevation-2">
        <v-card-title class="d-flex align-center py-4 px-6 bg-primary text-white">
          <v-icon icon="mdi-account-circle" class="mr-2" />
          <span class="text-h6 font-weight-bold">{{ $t('User') || 'My Account' }}</span>
        </v-card-title>

        <v-card-text class="pa-6 pa-md-8">
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ $t(err) || err }}
          </v-alert>

          <v-row>
            <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
              <v-avatar size="120" color="primary" class="text-white mb-3 elevation-2">
                <v-icon icon="mdi-account" size="64" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">{{ user.email }}</div>
              <div class="text-caption text-medium-emphasis">Administrator</div>
            </v-col>

            <v-divider vertical class="d-none d-md-block"></v-divider>

            <v-col cols="12" md="7">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">{{ $t('GeneralInfo') }}</h3>

              <v-text-field
                v-model="user.email"
                :label="$t('Email')"
                variant="outlined"
                density="compact"
                disabled
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                :label="$t('Password')"
                :hint="$t('PasswordMustBeMoreThan8Characters')"
                persistent-hint
                variant="outlined"
                density="compact"
                counter
                @click:append-inner="show = !show"
                class="mb-4"
              ></v-text-field>

              <div class="mb-4">
                <label class="text-caption font-weight-bold d-block mb-1">Language</label>
                <locale-changer />
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-surface-variant d-flex justify-end">
          <v-btn
            variant="outlined"
            color="error"
            class="mr-2"
            @click="close"
          >
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-content-save"
            :loading="loading"
            @click="save"
          >
            {{ $t('Save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import LocaleChanger from '@/components/LocaleChanger.vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AccountView',
  components: {
    'base-layout': BaseLayout,
    LocaleChanger
  },
  data: () => ({
    user: {
      email: '',
      password: ''
    },
    show: false,
    ls: null,
    loading: false,
    err: ''
  }),
  created() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      try {
        const stored = localStorage.getItem('userInfo')
        if (stored) {
          this.ls = JSON.parse(stored)
          if (this.ls && this.ls.user) {
            this.user.email = this.ls.user.email || ''
          }
        }
      } catch (e) {
        console.error('Failed to parse userInfo:', e)
      }
    },
    close() {
      this.$router.push('/')
    },
    async save() {
      this.loading = true
      this.err = ''
      const usersStore = useUsersStore()
      const authStore = useAuthStore()

      const params = {
        _id: this.ls?.user?._id,
        language: this.$i18n.locale
      }
      if (this.user.password) {
        params.password = this.user.password
      }

      try {
        await usersStore.updateExistingUser(params)
        authStore.account_sign_out()
        this.$router.push('/login')
      } catch (error) {
        this.err = error.message || 'Error updating account'
        console.error('Error updating user info:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>