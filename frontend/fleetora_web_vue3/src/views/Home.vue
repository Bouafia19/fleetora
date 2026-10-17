<template>
  <v-container 
    class="fill-height"
    fluid 
  >
    <v-row 
      class="d-flex justify-center" 
    >
      <v-col>
          <v-img src="/logistique.png"></v-img>
          
          <v-select
            v-model="$i18n.locale"
            :items="$i18n.availableLocales"
            bg-color="#00366F"
            
            tile
          ></v-select>
          

          <!-- <div class="text-center">
            <h5>{{ $t('homeParagraph') }}</h5>
          </div> -->

          <div class="text-center">
            <div class="my-2">
              <v-btn 
                color="next" 
                @click="routerLogin"  
                block
                rounded
                dark
              >
                {{ $t('Login') }}
              </v-btn>
            </div>

            <div class="my-2">
              <v-btn
                block 
                color="next"
                @click="routerSignup" 
                rounded
                dark
              >
                  {{ $t('SignUp') }}
              </v-btn>
            </div>
          </div>
        </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const routerLogin = () => {
    router.push('/login')
  }

  const routerSignup = () => {
    router.push('/signup')
  }

</script>

