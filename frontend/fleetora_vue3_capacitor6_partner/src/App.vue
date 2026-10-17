<template>
  <router-view />
</template>

<script setup>
  import { onMounted } from 'vue'
  import { StatusBar, Style } from '@capacitor/status-bar'
  import { Capacitor } from '@capacitor/core'
  
  const setStatusBarStyle = async () => {
    try {
      await StatusBar.setBackgroundColor({ color: '#00366F' })
    } catch (error) {
      // console.log(error)
    }
  }

  onMounted(() => {
    if (Capacitor.isNativePlatform()) {
      setStatusBarStyle()
    }
  })
</script>

<style scoped>

</style>
