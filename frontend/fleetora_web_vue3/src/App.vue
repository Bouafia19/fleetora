<template>
  <RouterView />
  <InstallPrompt />
</template>

<script setup>
import { RouterView } from 'vue-router'
import InstallPrompt from '@/components/InstallPrompt.vue'
</script>

<style scoped>
</style>
