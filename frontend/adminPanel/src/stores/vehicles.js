import { defineStore } from 'pinia'
import axios from 'axios'

export const useVehiclesStore = defineStore('vehicles', {
    state: () => ({
        vehicles: undefined,
        VehicleInfo: []
    }),

    getters: {
        getVehicles: (state) => state.vehicles,
        getVehicleInfo: (state) => state.VehicleInfo
    },

    actions: {
        async fetchVehicles() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/vehicles', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.vehicles = response.data
        },

        async addVehicles(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/vehicles', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async fetchVehicle(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/vehicles/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.VehicleInfo = response.data
        },

        async editVehicles(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/vehicles/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteVehicles(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/vehicles/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        }
    }
})
