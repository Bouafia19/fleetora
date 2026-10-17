import { defineStore } from 'pinia'
import axios from 'axios'

export const useAnnouncementsStore = defineStore('announcements', {
    state: () => ({
        announcements: undefined
    }),

    getters: {
        getAnnouncements: (state) => state.announcements
    },

    actions: {
        async fetchAnnouncements() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/announcements', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.announcements = response.data
        },

        async addAnnouncements(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/announcements', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async editAnnouncements(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/announcements/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteAnnouncements(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/announcements/${id}`, {
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
