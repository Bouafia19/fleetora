import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useVehiclesStore = defineStore('vehicles', {

    state: () => ({
        vehicles: undefined
    }),

    getters: {
        getVehicles: (state) => state.vehicles
    },

    actions: {
        //fetch vehicles
        async fetchVehicles(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
            
                try {
                    
                    const response = await axios.get(`api/vehicles`, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })

                    if(response.status === 200){
                        this.vehicles = response.data
                    }
                    
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
            
        }
    }
})