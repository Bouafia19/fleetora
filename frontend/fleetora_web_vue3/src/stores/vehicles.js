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
        //fetch vehicles safely without unhandled rejections
        async fetchVehicles(){
            try {
                let token = null
                try {
                    const raw = localStorage.getItem('userInfo')
                    if (raw) {
                        const ls = JSON.parse(raw)
                        token = ls?.token || null
                    }
                } catch (e) {
                    console.warn('Could not parse userInfo from localStorage', e)
                }

                const headers = {}
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const response = await axios.get(`api/vehicles`, { headers })

                if(response && response.status === 200){
                    this.vehicles = response.data
                    return response.data
                }
            } catch (error) {
                console.warn('Backend /api/vehicles unavailable or unauthorized:', error.message || error)
                return null
            }
        }
    }
})