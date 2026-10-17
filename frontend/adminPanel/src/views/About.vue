<template>
  <base-layout>
    <v-container>
      <v-card class="rounded-card" elevation="6">
        <v-card-title class="d-flex justify-center align-center py-4">
          <v-avatar size="60">
            <v-img :src="logoImg" contain width="100%" />
          </v-avatar>
          <h2 class="ml-3 text-uppercase font-weight-bold" style="letter-spacing: 1px;">
            {{ $t('CompanyName') }}
          </h2>
        </v-card-title>

        <v-divider class="ma-4"></v-divider>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h2 class="section-title text-center mb-4">
                {{ $t('Office') }}
              </h2>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="contact in contacts"
                  :key="contact.title"
                  class="mb-2"
                >
                  <template #prepend>
                    <v-avatar size="36" class="mr-3">
                      <v-img :src="contact.img" contain />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    <v-chip
                      color="primary"
                      variant="outlined"
                      class="font-weight-medium"
                    >
                      {{ $t(contact.title) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>

            <v-divider vertical class="d-none d-md-block"></v-divider>

            <v-col cols="12" md="5">
              <h2 class="section-title text-center mb-4">
                {{ $t('Services') }}
              </h2>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="item in services"
                  :key="item.title"
                  class="mb-2"
                >
                  <template #prepend>
                    <v-avatar size="36" class="mr-3">
                      <v-img :src="item.img" contain />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    <v-chip
                      color="secondary"
                      variant="outlined"
                      class="font-weight-medium"
                    >
                      {{ $t(item.title) }}
                    </v-chip>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import logoImg from '../assets/icons/logo.png'
import phoneImg from '../assets/icons/couleur/phone.png'
import mobileImg from '../assets/icons/couleur/mobile.png'
import emailImg from '../assets/icons/couleur/email.png'
import googleImg from '../assets/icons/couleur/google.png'
import facebookImg from '../assets/icons/couleur/facebook.png'
import rubyImg from '../assets/icons/couleur/ruby.png'
import nodejsImg from '../assets/icons/couleur/nodejs.png'
import pythonImg from '../assets/icons/couleur/python.png'
import androidImg from '../assets/icons/couleur/android.png'
import electronImg from '../assets/icons/couleur/electron.svg'
import experienceImg from '../assets/icons/couleur/experience.png'
import bashImg from '../assets/icons/couleur/gnu-bash.png'

export default {
  name: 'About',
  components: {
    'base-layout': BaseLayout
  },
  data: () => ({
    logoImg,
    contacts: [
      { title: 'Telephone', img: phoneImg },
      { title: 'MyMobile', img: mobileImg },
      { title: 'Contact', img: emailImg },
      { title: 'Site', img: googleImg },
      { title: 'CompanyName', img: facebookImg }
    ],
    services: [
      { title: 'web', img: rubyImg },
      { title: 'ecommerce', img: nodejsImg },
      { title: 'erp', img: pythonImg },
      { title: 'mobileDev', img: androidImg },
      { title: 'desktop', img: electronImg },
      { title: 'design', img: experienceImg },
      { title: 'support', img: bashImg }
    ]
  })
}
</script>

<style scoped>
.rounded-card {
  border-radius: 20px;
  color: #0f172a;
  margin: 40px auto;
  background: white;
}
.section-title {
  color: #0284c7;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 6px;
}
</style>