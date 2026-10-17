import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useAnnouncementsStore = defineStore('announcements', {

    state: () => ({
        announcements: undefined
    }),

    getters: {
        getAnnouncements: (state) => state.announcements
    },

    actions: {
        //announcements component
        async fetchAnnouncements(){
            const auth = useAuthStore()
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.get('api/announcements/getAnnouncementsByRole/client', {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        }
                    })
                    if(response.status === 200){
                        this.announcements = response.data
                    }
                } catch (error) {
                    throw new Error(`${error}`)
                }
            })
        },

        // add announcements
        async addAnnouncements(params){
            const auth = useAuthStore()
            
            auth.getLSUserInfo().then(async (ls) => {
                try {
                    const response = await axios.post('api/announcements', params, {
                        headers: {
                            'Authorization': `Bearer ${ls.token}`
                        },
                    });
                } catch (error) {
                    throw new Error(`${error.response.data.error}`)
                }

            })

            
            
        },

    }

})