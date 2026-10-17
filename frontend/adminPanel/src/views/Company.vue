<template>
  <v-container fluid class="px-4 px-md-10">
    <v-card class="rounded-xl shadow-card" elevation="2">
      <v-card-title class="d-flex align-center py-4 px-6 bg-primary text-white">
        <v-icon icon="mdi-domain" class="mr-2" />
        <span class="text-h6 font-weight-bold">{{ $t('Company') || 'Company Settings' }}</span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6 pa-md-8">
        <v-row>
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="company.companyName"
                  :label="$t('RaisonSocial')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.state"
                  :label="$t('State')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.city"
                  :label="$t('City')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="company.street"
                  :label="$t('Street')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="company.zip"
                  :label="$t('PostalCode')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="company.phone"
                  :label="$t('Phone')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="company.mobile"
                  :label="$t('Mobile')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="company.fax"
                  :label="$t('Fax')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.taxIdentifierNumber"
                  :label="$t('NIF')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.statisticalIdentifierNumber"
                  :label="$t('NIS')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.commercialRegisterNumber"
                  :label="$t('RC')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.taxArticleNumber"
                  :label="$t('ART')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.email"
                  :label="$t('Email')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company.siteWeb"
                  :label="$t('WebSite')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>

          <v-divider vertical class="d-none d-md-block"></v-divider>

          <v-col cols="12" md="4" class="text-center">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 text-start">{{ $t('Photo') || 'Company Logo' }}</h3>
            <v-file-input
              v-model="imageFiles"
              :label="$t('Photo')"
              variant="outlined"
              prepend-icon="mdi-camera"
              density="compact"
              accept="image/*"
              @change="onFileChange"
            />
            <v-avatar size="180" rounded="lg" class="elevation-2 border mb-6">
              <v-img
                :src="company.logo || '/favicon.ico'"
                contain
                alt="Company Logo"
              />
            </v-avatar>

            <v-divider class="my-4"></v-divider>

            <h3 class="text-subtitle-1 font-weight-bold mb-3 text-start">{{ $t('appPhoto') || 'App Image' }}</h3>
            <v-file-input
              v-model="homeImageFiles"
              :label="$t('appPhoto')"
              variant="outlined"
              prepend-icon="mdi-camera"
              density="compact"
              accept="image/*"
              @change="onImageChange"
            />
            <v-avatar size="180" rounded="lg" class="elevation-2 border">
              <v-img
                :src="company.appImage || '/favicon.ico'"
                contain
                alt="Home Image"
              />
            </v-avatar>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-surface-variant d-flex justify-end">
        <v-btn
          color="error"
          variant="outlined"
          class="mr-2"
          @click="initialize"
        >
          {{ $t('Cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-check"
          :loading="loading"
          @click="save"
        >
          {{ $t('Edit') || 'Save Changes' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { useCompanyStore } from '@/stores/company'

export default {
  name: 'CompanyView',
  data: () => ({
    imageFiles: null,
    homeImageFiles: null,
    loading: false
  }),
  computed: {
    companyStore() {
      return useCompanyStore()
    },
    company() {
      return this.companyStore.company || {}
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    initialize() {
      this.companyStore.fetchCompany()
    },
    onFileChange(e) {
      const file = e.target ? e.target.files[0] : (Array.isArray(e) ? e[0] : e)
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        this.company.logo = event.target.result
      }
      reader.readAsDataURL(file)
    },
    onImageChange(e) {
      const file = e.target ? e.target.files[0] : (Array.isArray(e) ? e[0] : e)
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        this.company.appImage = event.target.result
      }
      reader.readAsDataURL(file)
    },
    async save() {
      this.loading = true
      try {
        await this.companyStore.editCompany(this.company)
      } catch (err) {
        console.error('Failed to update company:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.shadow-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>