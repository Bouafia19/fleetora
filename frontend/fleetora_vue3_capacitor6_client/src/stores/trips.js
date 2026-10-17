import { defineStore } from 'pinia'
import axios from 'axios'
import io from "socket.io-client"
import { useAnnouncementsStore } from './announcements'
import { useAuthStore } from './auth'

export const useTripsStore = defineStore('trips', {

    state: () => ({
        allTrips: undefined,
        plannedTrips: undefined,
        inProgressTrips: undefined,
        transporters: undefined,
        emptyErray: false,
        finishedErray: false,
        finishedTrips: undefined,
        tripInfo: {
            distance: 0,
            from: '',
            to: '',
            marchandise: '',
            start: ''
        },
        trip: null,
        socket: null
    }),

    getters: {
        getTransporters: (state) => state.transporters,
        getEmptyErray: (state) => state.emptyErray,
        getFinishedErray: (state) => state.finishedErray,
        getFinishedTrips: (state) => state.finishedTrips,
        getAllTrips: (state) => state.allTrips,
        getPlannedTrips: (state) => state.plannedTrips,
        getInProgressTrips: (state) => state.inProgressTrips,
        getTrip: (state) => state.trip,
        getSocket: (state) => state.socket
    },

    actions: {
        //fetch single Trip
        async fetchTrips(){
            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                let params = {
                    typeAccount: "client"
                }
                try {
                    const response = await axios.patch(`api/trips/${ls.user._id}`, params,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        console.log('fetchTrips', response.data)
                        this.allTrips = response.data
                        this.plannedTrips = response.data.filter((item) => 'start' in item && Date.parse(item.start) > Date.parse(new Date()) && item.status === 'planned')
                        this.plannedTrips.forEach(element => {
                            element.start = element.start.substr(0, 19)
                            console.log('element', element)
                            if(element.transporterId){
                                element.color = 'red'
                            }else{
                                element.color = 'grey'
                            }
                        })
                        console.log('this.plannedTrips', this.plannedTrips)
                        this.finishedTrips = response.data.filter((item) => item.finished),
                        this.inProgressTrips = response.data.filter((item) => item.status === 'started' || item.status === 'accepted')
                       
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },
        
        //create single Trip
        async createTrips(params){
            const auth = useAuthStore()

            auth.getLSUserInfo().then(async (ls) => {
                try {

                    const response = await axios.post(`api/trips`, params,{
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })

                    if(response.status === 200){
                        this.transporters = response.data
                        this.calcRoute({ params, response })
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

    calcRoute(params) {
        //create a DirectionsService object to use the route method and get a result for our request
        const directionsService = new google.maps.DirectionsService()
        
        let transporters = params.response.data
        
        const backendUrl = import.meta.env.VITE_API_URL || 
            (typeof window !== 'undefined' && (window.location.port === '7072' || window.location.port === '5173') 
                ? 'http://localhost:3000' 
                : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'))
        
        let socket = io(backendUrl, {
            path: "/socket.io/"
        })
        
        let client = params.params

        if(client.distance > 30){
            transporters = params.response.data.filter(e => e.legal)
        }else{
            transporters = params.response.data
        }

        console.log('transporters', transporters)

        let array = []

        transporters.forEach(element => {
            //create request
            let request = {
                origin: client.from,
                destination: element.lastLatLng,
                travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
                // unitSystem: google.maps.unitsystem.METRIC
            }
  
            //pass the request to the route method
            directionsService.route(request,  (result, status) => {
                if (status == google.maps.DirectionsStatus.OK) {
                    element.distance = parseInt(result.routes[0].legs[0].distance.text.slice(0, 3))
                    if(element.distance < 30){
                        array.push(element)
                    }
                } else {
                    this.err = 'Could not retrieve driving distance.'
                }
            })
        })

        let sortedTransporters = array.sort((p1, p2) => (p1.distance > p2.distance) ? 1 : (p1.distance < p2.distance) ? -1 : 0)

        console.log('sorted transporters', sortedTransporters)
        
        client.distance = client.distance.toString()
        client.price = client.price.toString()

        console.log('client', client)
        socket.once('connect', async () => {
            // if(sortedTransporters.length > 0){
                
                // sortedTransporters.every(async (element, index) => {
                for (let i = 0; i < sortedTransporters.length; i++) {
                    console.log('index', i)
                    const result = await this.functionSetTimeOut({ element: sortedTransporters[i], index: i, client, socket, sortedTransporters })
                       
                    console.log('R', result)
                   
                    if (!result) { 
                        console.log('break')
                        break;
                    }else{
                        console.log('continue')
                        continue;
                    }
                }
            
            // }else{
            //     this.emptyErray = true
            // }
        })
    },

    async functionSetTimeOut(params){
        return new Promise((resolve, reject) => {

            const announcements = useAnnouncementsStore()

            let element = params.element
            let index = params.index
            let client = params.client
            let socket = params.socket
            let sortedTransporters = params.sortedTransporters
            let res = false
            
            // let setID = setTimeout(() => {
                console.log('e', element)
                announcements.addAnnouncements({
                    topic: 'pushNotification',
                    title: 'Trip Request',
                    body: `\n Client: ${client.client.firstName} ${client.client.lastName}\n From: ${client.from}\n To: ${client.to}`,
                    data: {
                        start: client.from,
                        to: client.to,
                        price: client.price,
                        distance: client.distance,
                        clientId: client.client.id,
                        socketId: socket.id,
                        transporterId: element._id
                    }
                })
                
                this.sendNotification({
                    registrationToken: element.fcmToken,
                    title: 'Trip Request',
                    body: `\n Client: ${client.client.firstName} ${client.client.lastName}\n From: ${client.from}\n To: ${client.to}`,
                    data: {
                        ...client,
                        socketId: socket.id
                    }            
                })

                socket.on('receiveTransporterResponse', (message, data) => {
                    console.log('msg', message)
                    console.log('data', data)
                    if (message === 'accept') { 
                        
                        console.log('accept')
                        res = true
                        resolve(false);
                        this.trip = data
                        this.socket = socket
                        this.router.push({ name: 'TripDetail' })
                    }else if(message === 'reject'){
                        
                        console.log('reject')
                        res = true
                        resolve(true);
                    }

                })

                let setID = setTimeout(() => {

                    if (index === sortedTransporters.length -1){
                        setTimeout(() => {
                            console.log('setFinishedErray')
                            this.finishedErray = true
                            resolve(false);
                        }, "120000")
                    } 

                    if(!res){
                        resolve(true);
                    } 
                    
                }, 120000)

            // }, index * 120000)
        })
    },

    async sendNotification(params) {
        const auth = useAuthStore()

        auth.getLSUserInfo().then(async (ls) => {
        
            try {
                const response = await axios.post(`api/notifications/token`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if(response.status === 200){
                    
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        })
    },

    async checkAnnulationOfTrip({id, reason}){
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
                        trip.cancellation.by = 'client'
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

    async addPlannedTrip(params){
        const auth = useAuthStore()
        params.status = 'planned'
        auth.getLSUserInfo().then(async (ls) => {
            try {
                const response = await axios.post(`api/trips/confirmeTrip`, params,{
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if(response.status === 200){
                    console.log('planned trips', response.data)
                    this.router.push({ name: 'Tabs' })
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        })
    },

    async updateTrip(params){
        console.log('p', params)
        const auth = useAuthStore()
        auth.getLSUserInfo().then(async (ls) => {
            try {
                const response = await axios.patch(`api/trips/updateTrip/${params._id}`, params,{
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    }
                })
                if(response.status === 200){
                    console.log('updateTrip res', response.data)
                }
            } catch (error) {
                throw new Error(`${error}`)
            }
        })
    }

    }
})
