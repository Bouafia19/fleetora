<template>
  <v-dialog :model-value="notAuthenticated" persistent max-width="700px">
    <v-card class="rounded-xl overflow-hidden elevation-6">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" sm="5" class="d-none d-sm-flex justify-center">
            <v-img 
              :src="truckImg"
              contain
              max-width="200"
              alt="Fleetora Mobility"
            />
          </v-col>
          <v-col cols="12" sm="7">
            <h2 class="text-h6 font-weight-bold mb-4 text-primary">{{ $t('AccountLogin') || 'Fleetora Login' }}</h2>
            <v-form v-model="valid" @submit.prevent="auth_login">
              <v-text-field 
                :label="$t('Email') || 'Email'" 
                variant="outlined"
                density="compact"
                v-model="email"
                :rules="nameRules"
                required
                class="mb-3"
              ></v-text-field>
              <v-text-field 
                :label="$t('Password') || 'Password'" 
                variant="outlined"
                density="compact"
                type="password" 
                v-model="password" 
                :rules="passwordRules"
                required
                class="mb-3"
              ></v-text-field>
              <v-checkbox 
                v-model="remember_login" 
                :label="$t('RemeberMyLoginOnThisComputer') || 'Remember me'"
                density="compact"
                color="primary"
                class="mb-2"
              ></v-checkbox>
              <v-btn 
                color="primary" 
                variant="elevated"
                :disabled="!valid"
                :loading="loading"
                block 
                type="submit"
                size="large"
              >
                {{ $t('Login') || 'Log In' }}
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import truckImg from '../assets/icons/couleur/truck.png'

export default {
  name: "DialogLogin",
  props: {
    notAuthenticated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      truckImg,
      email: '',
      password: '',
      remember_login: false,
      valid: false,
      loading: false,
      nameRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length >= 6) || 'Password must be at least 6 characters'
      ]
    }
  },
  methods: {
    async auth_login() {
      if (!this.valid) return
      this.loading = true
      const authStore = useAuthStore()
      try {
        await authStore.account_sign_in({
          email: this.email,
          password: this.password,
          role: 'administrator',
          remember_login: this.remember_login
        })
        this.email = ''
        this.password = ''
      } catch (err) {
        console.error('Login error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>