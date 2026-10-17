<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="brand-badge">
        <v-icon color="#0EA5E9" size="24" class="mr-2">mdi-radar</v-icon>
        <span class="brand-name">FLEETORA</span>
      </div>

      <div class="error-code">404</div>

      <h1 class="error-title">{{ $t('pageNotFound') || 'Screen Not Found' }}</h1>
      <p class="error-desc">
        The requested screen does not exist or has been relocated.
      </p>

      <v-btn
        color="#00366F"
        size="large"
        rounded="lg"
        elevation="2"
        to="/tabs"
        block
        class="text-none font-weight-bold mb-3"
      >
        <v-icon start class="mr-2">mdi-home</v-icon>
        Return to Home
      </v-btn>
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
  max-width: 400px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 20px 40px -15px rgba(0, 54, 111, 0.08);
  padding: 40px 24px;
  text-align: center;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
}

.brand-name {
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #00366F;
  font-size: 13px;
}

.error-code {
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #00366F 0%, #0EA5E9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  letter-spacing: -2px;
}

.error-title {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
}

.error-desc {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 28px;
}
</style>
