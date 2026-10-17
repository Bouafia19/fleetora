<template>
  <base-layout>
    <v-container class="pa-4 pa-md-6">
      <v-card class="elevation-2 rounded-lg max-w-lg mx-auto" max-width="600">
        <v-card-title class="bg-primary text-white pa-4">
          <span class="text-h6 font-weight-bold">{{ $t('New') || 'New Billing' }}</span>
        </v-card-title>

        <v-card-text class="pa-6">
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name"
              label="Name"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="phoneNumber"
              label="Phone Number"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="email"
              label="E-mail"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-select
              v-model="select"
              :items="items"
              label="Select"
              variant="outlined"
              density="compact"
              class="mb-4"
              required
            ></v-select>

            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              block
            >
              Submit
            </v-btn>
          </form>
        </v-card-text>
      </v-card>
    </v-container>
  </base-layout>
</template>

<script>
import BaseLayout from '@/components/BaseLayout.vue'
import { useBillingsStore } from '@/stores/billings'

export default {
  name: 'BillingNewView',
  components: {
    'base-layout': BaseLayout
  },
  data: () => ({
    name: '',
    phoneNumber: '',
    email: '',
    select: null,
    items: ['Item 1', 'Item 2', 'Item 3']
  }),
  methods: {
    submit() {
      const billingsStore = useBillingsStore()
      console.log('Submitting billing', this.name, this.phoneNumber)
      this.$router.push('/billing')
    }
  }
}
</script>