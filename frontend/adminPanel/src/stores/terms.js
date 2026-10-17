import { defineStore } from 'pinia'
import axios from 'axios'

export const useTermsStore = defineStore('terms', {
    state: () => ({
        terms: undefined,
        termInfo: []
    }),

    getters: {
        getTerms: (state) => state.terms,
        getTermInfo: (state) => state.termInfo
    },

    actions: {
        async fetchTerms() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/terms', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.terms = response.data
        },

        async addTerms(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/terms', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async editTerms(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/terms/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteTerms(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/terms/${id}`, {
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
