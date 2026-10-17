import { defineStore } from 'pinia'
import axios from 'axios'

export const useBillingsStore = defineStore('billings', {
    state: () => ({
        billings: undefined
    }),

    getters: {
        getBillings: (state) => state.billings
    },

    actions: {
        async fetchBillings() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/billings', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.billings = response.data
        },

        async addBillings(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/billings', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async editBillings(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/billings/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteBillings(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/billings/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async fetchBillingsByTransporterId(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/billings/getBillingsByTransporterId/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if (response.status === 200) {
                this.billings = response.data
            }
        }
    }
})
