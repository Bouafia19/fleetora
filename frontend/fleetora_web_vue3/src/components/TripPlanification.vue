<template>
    <div>
        <!-- <v-navigation-drawer
            app
            v-model="drawer"
            right
            width=90%
        >
            <v-list 
                color=#00366f
                dark
                class="pa-0"
            >
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="title">
                            {{ $t('Planification') }}
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn value="left" icon @click="close" color="error">
                            <v-icon>mdi-close-circle-outline</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>

            <v-divider></v-divider> -->
        <!-- <div class="align-center justify-center px-8">
            <v-btn
                class="ma-2"
                block
                color="next"
                dark
                @click="calcRoute"
            >
                <v-icon>mdi-map-marker-path</v-icon>
            </v-btn>
        </div> -->
        <v-bottom-sheet v-model="sheet" persistent>
            <v-sheet
                class="text-center"
                height="100%"
            >
                <v-btn
                    class="mt-1"
                    icon
                    color="red"
                    @click="close"
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
                        <v-menu
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
                                    rounded
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
                        </v-menu>
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
                            label="Picker in dialog"
                            append-icon="mdi-clock-time-four-outline"
                            readonly
                            v-if="time"
                            outlined
                            rounded
                        ></v-text-field>
                        <v-dialog
                            ref="dialog"
                            v-model="modal"
                            :return-value.sync="time"
                            persistent
                            width="290px"
                            v-if="modal"
                        >
                            <!-- <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="time"
                                    label="Picker in dialog"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template> -->
                            <v-time-picker
                                v-if="modal"
                                v-model="time"
                                full-width
                                format="24hr"
                            >
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="modal = false"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="confirme"
                                >
                                    OK
                                </v-btn>
                            </v-time-picker>
                        </v-dialog>
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
                            rounded
                            placeholder="Meuble, fragile, pharmaceutique"
                            
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
                            
                            rounded
                            suffix="kg"
                            @click="marchandise.weight = null"
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
                            
                            rounded
                            suffix="m"
                            @click="marchandise.height = null"
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
                            
                            rounded
                            suffix="m"
                            @click="marchandise.width = null"
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
                            
                            rounded
                            suffix="m"
                            @click="marchandise.depth = null"
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
                            <!-- <use-camera v-on:cameraUpload="uploadImage($event)"/> -->
                        </v-img> 
                    </v-avatar>
                </div>
            </v-container>

            </div>
            </v-sheet>
        </v-bottom-sheet>
        <!-- </v-navigation-drawer> -->

        <!-- <v-app-bar app scroll-target="#main" color="next" dark>
            <v-btn icon @click="$router.go(-1)">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>

            <v-toolbar-title>{{ $t(pageTitle) }}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn 
                icon 
                @click="drawer = !drawer"
            >
                <v-icon>mdi-calendar</v-icon>
            </v-btn>
        </v-app-bar> -->

        <!-- <v-sheet max-height="100vh" id="main" style="overflow: auto">
            <v-main>
                <slot />
            </v-main>
        </v-sheet> -->
    </div>
</template>

<script>
    import moment from 'moment'

    export default {
        // components: { UseCamera },
        name: 'App',
        props: ['sheet'],
        data: () => ({
            drawer: null,
            date: '',
            date_time: null,
            trip_date: false,
            trip_time: false, 
            marchandise: {
                weight: 0,
                height: 0,
                width: 0,
                depth: 0,
                type: '',
                photo: null
            },
            time: null,
            modal: false
        }),
        computed: {
            computedDateFormatted () {
                return this.date ? moment(this.date).format('dddd, MMMM Do YYYY, h:mm:ss a') : ''
            }
        },
        methods: {
            close(){
                let value = !this.sheet
                let obj = {
                    marchandise: this.marchandise,
                    date: this.date_time
                }
                this.$emit('tripPlaned', obj)
                this.$emit('close', value)
            },
            confirme(){
                this.$refs.dialog.save(this.time)
                this.date_time = new Date(`${this.date}T${this.time}:00`)
                console.log('Date', this.date_time)
            },
            updateDate(){
                this.trip_date = false
                this.modal = true
            },
            allowedDates(val){
                let today = new Date()
                return Date.parse(val) > today.setDate(today.getDate() - 1)
            },
            // close(){
            //     let obj = {
            //         marchandise: this.marchandise,
            //         date: this.date_time
            //     }
            //     this.$emit('tripPlaned', obj)
            //     this.drawer = !this.drawer
            // },
            async uploadImage(img64){  
                this.marchandise.photo = img64
            }
        }
    }
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
  