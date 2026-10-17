import { defineStore } from 'pinia'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'
import io from "socket.io-client"
import { useAuthStore } from './auth'

export const useTripsStore = defineStore('trips', {

    state: () => ({
        allTrips: undefined,
        finishedTrips: undefined,
        plannedTrips: undefined,
        trip: null,
        loading: true,
        tripsByTransporterId: undefined,
        socket: null,
        showArrow: true
    }),

    getters: {
        getAllTrips: (state) => state.allTrips,
        getPlannedTrips: (state) => state.plannedTrips,
        getFinishedTrips: (state) => state.finishedTrips,
        getTrip: (state) => state.trip,
        getLoading: (state) => state.loading,
        getTripsByTransporterId: (state) => state.tripsByTransporterId,
        getSocket: (state) => state.socket,
        getShowArrow: (state) => state.showArrow
    },

    actions: {
        //fetch single Trip
        async fetchTrips(){

            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                let params = {
                    typeAccount: "transporter"
                }
                try {
                    const response = await axios.patch(`api/trips/${ls.user._id}`, params,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.allTrips = response.data
                        this.finishedTrips = response.data.filter((item) => item.finished)
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        //Confirme Trip
        async confirmeTrip(params){

            const auth = useAuthStore()

            return new Promise((resolve, reject) => {
                const backendUrl = import.meta.env.VITE_API_URL || 
                    (typeof window !== 'undefined' && (window.location.port === '7072' || window.location.port === '5173') 
                        ? 'http://localhost:3000' 
                        : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'))
                
                let socket = io(backendUrl, {
                    path: "/socket.io/"
                })

                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.post(`api/trips/confirmeTrip`, params,{
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            socket.once('connect', () => {
                                
                            })
                            let data = {
                                _id: response.data._id,
                                clientId: {
                                    _id: response.data.clientId._id,
                                    firstName: response.data.clientId.firstName,
                                    lastName: response.data.clientId.lastName,
                                    phone: response.data.clientId.phone
                                },
                                transporterId: {
                                    _id: response.data.transporterId._id,
                                    firstName: response.data.transporterId.firstName,
                                    lastName: response.data.transporterId.lastName,
                                    phone: response.data.transporterId.phone,
                                    room: socket.id
                                },
                                vehicleId: response.data.vehicleId,
                                price: response.data.price,
                                distance: response.data.distance,
                                from: response.data.from,
                                to: response.data.to,
                                finished: response.data.finished,
                                rating: response.data.rating,
                                start: response.data.start,
                                status: response.data.status,
                                marchandise: {
                                    ...response.data.marchandise
                                },
                            }
                            
                            if(response.data){
                                socket.emit('transporterResponse', 'accept', params.clientSocketIo, data)
                                resolve()
                                this.setLSCurrentTrip(JSON.stringify(response.data)).then(() => {
                                    this.showArrow = false
                                    this.trip = response.data
                                    this.socket = socket
                                    console.log('store this.trips', this.trip)
                                    
                                    this.router.push({ name: 'TripDetail' })
                                })
                            }
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async getOneTrip(id){

            const auth = useAuthStore()

            return new Promise((resolve, reject) => {
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.get(`api/trips/getOneTrip/${id}`,{
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            this.trip = response.data
                            resolve(response.data)
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async updateTrip(params){

            const auth = useAuthStore()

            return new Promise((resolve, reject) => {
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/trips/updateTrip/${params._id}`, params,{
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })
            })
        },

        async getTripsByVehicleId(){

            const auth = useAuthStore()

            return new Promise((resolve, reject) => {

                auth.getLSUserInfo().then(async (ls) => {
                    if(ls.user.vehicleId){
                        try {
                            const response = await axios.get(`api/trips/getTripsByVehicleId/${ls.user.vehicleId}`,{
                                headers: {
                                    'Authorization': `Bearer ${ls.token}`
                                }
                            })
                            if(response.status === 200){
                                console.log('getTripsByVehicleId', response.data)
                                this.plannedTrips = response.data.filter((item) => 'start' in item && Date.parse(item.start) > Date.parse(new Date()) && item.status === 'planned')
                                this.plannedTrips.forEach((element, index) => {
                                    element.start = element.start.substr(0, 19)
                                    console.log('getTripsByVehicleId element', element)
                                    if(element.transporterId){  
                                        if(element.transporterId._id === ls.user._id){
                                            element.color = 'red'
                                        }else{
                                            this.plannedTrips.splice(index, 1)
                                            console.log('index', index)
                                        }
                                    }else{
                                        element.color = 'grey'
                                    }
                                })
                                console.log('this.plannedTrips', this.plannedTrips)
                                console.log('', response.data)
                                resolve()
                            }                
                        } catch (error) {
                            reject()
                            throw new Error(`${error}`)
                        }
                    }
                })
            })
        },

        async checkTripForAnnulation({id, reason}){

            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.get(`api/trips/getOneTrip/${id}`,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        if(response.data.cancellation.reason === ''){
                            let trip = response.data
                            trip.cancellation.reason = reason
                            trip.cancellation.by = 'transporter'
                            trip.status = 'canceled'
                            this.updateAnnulationOfTrip(trip)
                        }else{
                            this.router.push({ name: 'Tabs' })
                        }
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        async updateAnnulationOfTrip(params){

            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.patch(`api/trips/updateAnnulationOfTrip/${params._id}`, params,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.router.push({ name: 'Tabs' })
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

    async checkAnnulationOfTrip(){

        const auth = useAuthStore()

        this.getLSCurrentTrip().then((lsCt) => {
            if(lsCt){
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.get(`api/trips/getOneTrip/${lsCt._id}`,{
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            console.log('checkAnnulationOfTrip', response.data)
                            if(response.data.cancellation){
                                if(response.data.cancellation.by != 'default'){
                                    this.removeLSCurrentTrip()
                                    this.router.push({ name: 'Tabs' })
                                }
                            }
                        }
                    } catch (error) {
                        throw new Error(`${error}`)
                    }
                })
            }else{
                this.loading = false
            }
        })  
    },

    async setLSCurrentTrip(data){
        await Preferences.set({
          key: 'currentTrip',
          value: data,
        })
    },

    async getLSCurrentTrip(){
        const { value } = await Preferences.get({ key: 'currentTrip' })
        return JSON.parse(value)
    },

    async removeLSCurrentTrip(){
        await Preferences.remove({ key: 'currentTrip' })
    },

    async fetchtripsByTransporterId(id){

        const auth = useAuthStore()

        return new Promise((resolve, reject) => {
            try {
                auth.getLSUserInfo().then(async (ls) => {
                    const response = await axios.get(`api/trips/getTripsByTransporterId/${id}`,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        console.log('res', response.data)
                        this.tripsByTransporterId = response.data
                        resolve()
                    }
                })
            } catch (error) {
                reject()
                throw new Error(`${error}`)
            }
        })
    }
    }
})