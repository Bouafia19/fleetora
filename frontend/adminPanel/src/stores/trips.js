import { defineStore } from 'pinia'
import axios from 'axios'

export const useTripsStore = defineStore('trips', {
    state: () => ({
        trips: []
    }),

    getters: {
        getTrips: (state) => state.trips
    },

    actions: {
        async fetchTrips() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/trips', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.trips = response.data
            return response.data
        },

        async addTrips(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/trips', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async editTrips(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/trips/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteTrips(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/trips/${id}`, {
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
