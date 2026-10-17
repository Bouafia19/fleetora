<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="brand-badge">
        <v-icon color="#0EA5E9" size="28" class="mr-2">mdi-radar</v-icon>
        <span class="brand-name">FLEETORA</span>
      </div>

      <div class="error-code">404</div>

      <h1 class="error-title">{{ $t('pageNotFound') || 'Page Not Found' }}</h1>
      <p class="error-desc">
        The dispatch console route or resource you are looking for has been relocated or does not exist.
      </p>

      <div class="actions-group">
        <v-btn
          color="#00366F"
          size="large"
          rounded="lg"
          elevation="2"
          to="/"
          class="text-none font-weight-bold px-6"
        >
          <v-icon start class="mr-2">mdi-home-outline</v-icon>
          Return to Console
        </v-btn>
        <v-btn
          variant="outlined"
          color="#64748B"
          size="large"
          rounded="lg"
          to="/login"
          class="text-none font-weight-medium px-6"
        >
          <v-icon start class="mr-2">mdi-account-outline</v-icon>
          Sign In
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'ErrorNotFound'
});
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #E0F2FE 0%, #F8FAFC 60%, #EEF2F6 100%);
  padding: 24px;
}

.not-found-card {
  max-width: 520px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 20px 40px -15px rgba(0, 54, 111, 0.08);
  padding: 48px 36px;
  text-align: center;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 24px;
}

.brand-name {
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #00366F;
  font-size: 14px;
}

.error-code {
  font-size: 88px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #00366F 0%, #0EA5E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  letter-spacing: -2px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 12px;
}

.error-desc {
  font-size: 15px;
  color: #64748B;
  line-height: 1.6;
  margin-bottom: 32px;
}

.actions-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
