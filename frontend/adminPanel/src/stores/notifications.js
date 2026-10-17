import { defineStore } from 'pinia'
import axios from 'axios'

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({}),

    actions: {
        async sendToTopics(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                return await axios.post('api/notifications/topics', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async sendToTokens(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                return await axios.post('api/notifications/tokens', params, {
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
