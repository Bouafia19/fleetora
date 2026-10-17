import { defineStore } from 'pinia'
import axios from 'axios'

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
            const ls = JSON.parse(localStorage.getItem('userInfo'))
            
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
            
        }
    }
})