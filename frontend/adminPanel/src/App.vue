<template>
  <v-app id="fleetora-admin">
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'

const usersStore = useUsersStore()

onMounted(() => {
  const ls = JSON.parse(localStorage.getItem('userInfo'))
  if (ls && ls.token) {
    usersStore.fetchUsers()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

html, body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
}

#fleetora-admin {
  background-color: #f8fafc;
}
</style>