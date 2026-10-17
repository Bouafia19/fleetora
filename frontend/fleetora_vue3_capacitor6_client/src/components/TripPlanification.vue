<template>
    <div>
       
        <v-bottom-sheet v-model="sheet" persistent fullscreen>
            <v-sheet
                class="text-center"
               
            >
                <v-btn
                    :class="[platform === 'ios' ? 'mt-16' : 'mt-1']"
                    icon
                    color="red"
                    @click="close"
                    variant="text"
                    density="comfortable"
                >
                <v-icon >mdi-chevron-down</v-icon>
                </v-btn>
           
            <div >

            <v-container fluid>
                <v-row align="center">
                    <v-col
                        class="d-flex pb-0"
                        cols="12"
                        sm="6"
                    >
                        <v-date-input
                            v-model="trip_date"
                            :label="$t('Date')"
                            max-width="368"
                            :allowed-dates="allowedDates"
                            density="comfortable"
                            
                        ></v-date-input>
                        <!-- <v-menu
                            v-model="trip_date"
                            :close-on-content-click="false"
                            max-width="290"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :value="computedDateFormatted"
                                    append-icon="mdi-calendar"
                                    clearable
                                    :label="$t('Date')"
                                    readonly
                                    outlined
                                    
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="date = null"
                                    @click:clear="date = null"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="date"
                                @change="updateDate"
                                :allowed-dates="allowedDates"
                            ></v-date-picker>
                        </v-menu> -->
                    </v-col>
                </v-row>
                 <v-row align="center">
                    <v-col
                        class="d-flex pb-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="time"
                            :active="modal"
                            :focused="modal"
                            label="time"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            density="comfortable"
                        >
                            <v-dialog
                                v-model="modal"
                                activator="parent"
                                width="auto"
                            >
                                <v-time-picker
                                    v-if="modal"
                                    v-model="time"
                                    :allowed-hours="allowedHours"
                                    :allowed-minutes="allowedMinutes"
                                    color="next"
                                    format="24hr"
                                ></v-time-picker>
                            </v-dialog>
                        </v-text-field>
                       
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col
                        class="d-flex py-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="marchandise.type"
                            :label="$t('marchandiseType')"
                            outlined
                            placeholder="Meuble, fragile, pharmaceutique"
                            density="comfortable"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col
                        class="d-flex py-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="marchandise.weight"
                            :label="$t('Weight')"
                            type="number"
                            outlined
                            suffix="kg"
                            @click="marchandise.weight = null"
                            density="comfortable"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col
                        class="d-flex py-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="marchandise.height"
                            :label="$t('Height')"
                            type="number"
                            outlined
                            suffix="m"
                            @click="marchandise.height = null"
                            density="comfortable"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col
                        class="d-flex py-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="marchandise.width"
                            :label="$t('Width')"
                            type="number"
                            outlined
                            suffix="m"
                            @click="marchandise.width = null"
                            density="comfortable"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col
                        class="d-flex py-0"
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="marchandise.depth"
                            :label="$t('Depth')"
                            type="number"
                            outlined
                            suffix="m"
                            @click="marchandise.depth = null"
                            density="comfortable"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <div class="d-flex flex-column justify-space-between align-center mb-2">
                    <v-avatar 
                        size="200"
                        rounded="lg"
                    >
                        <v-img 
                            :src="marchandise.photo"
                            contain
                            width="100px"
                            style="float: right; border: 1px solid;"
                            alt="marchandise Image"
                            eager
                        >  
                            <UseCamera v-on:cameraUpload="uploadImage($event)"/>
                        </v-img> 
                    </v-avatar>
                </div>
                <v-btn
                    class="mt-1"
                    dark
                    block
                    color="next"
                    @click="close"
                   
                >
                    {{ $t('save') }}
                </v-btn>
            </v-container>
            

            </div>
            </v-sheet>
        </v-bottom-sheet>
       
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { Capacitor } from '@capacitor/core'
    import UseCamera from '@/components/UseCamera.vue'
    import moment from 'moment'

    const props = defineProps(['modelValue', 'sheet'])
    const emit = defineEmits(['tripPlaned', 'close'])
        
    let drawer = ref(null),
        date = ref(''),
        date_time = ref(null),
        trip_date = ref(null),
        trip_time = ref(false), 
        marchandise = ref({
            weight: 0,
            height: 0,
            width: 0,
            depth: 0,
            type: '',
            photo: null
        }),
        time = ref(null),
        modal = ref(false),
        platform = ref(null)

    const sheet = computed(() => {
        return props.modelValue
    })
        
       
    const close = () => {
        console.log('trip_date.value', trip_date.value)
        console.log('time.value', time.value)
        let date = null
        if(trip_date.value && time.value){
            
            let isoDate = moment(trip_date.value).format().substring(0, 10)
            console.log('${isoDate}T${time.value}:00', `${isoDate}T${time.value}:00`)
            date = new Date(`${isoDate}T${time.value}:00`)
            date.setHours(date.getHours() + 1)
            console.log('Date', date)
        }
        

        let value = !sheet.value
        let obj = {
            marchandise: marchandise.value,
            date: date
        }
        emit('tripPlaned', obj)
        emit('close', value)
    }

    const updateDate = () => {
        trip_date.value = false
        modal.value = true
    }

    const allowedDates = (val) => {
        let today = new Date()
        return Date.parse(val) > today.setDate(today.getDate() - 1)
    }

    const allowedHours = (val) => {
        let today = new Date()
        let hour = today.getHours()
        return val >= hour
    }

    const allowedMinutes = (val) => {
        let today = new Date()
        let minutes = today.getMinutes()
        return val >= minutes
    }
           
    const uploadImage = async (img64) => {  
        marchandise.value.photo = img64
    }

    onMounted(() => {
        platform.value = Capacitor.getPlatform()
    })
       
</script>

<style scoped>
    :deep(.v-text-field__suffix) {
        color: #00366f !important;
    }
    :deep(.v-input__icon--append .v-icon) { 
        color: #00366f !important;
    }
    :deep(.v-dialog:not(.v-dialog--fullscreen)) {
        max-height: 100%;
    }   
</style>
  