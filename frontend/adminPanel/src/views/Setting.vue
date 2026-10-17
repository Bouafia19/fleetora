<template>
  <base-layout>
      <!-- <h1 class="text-center mt-2 text-uppercase">Settings</h1> -->
      <company />
  </base-layout>
</template>

<script>
  import BaseLayout from '@/components/BaseLayout.vue'
  import Company from '@/views/Company.vue'

  export default {
    components: {
      'base-layout': BaseLayout,
      'company': Company
    },
  }
</script>