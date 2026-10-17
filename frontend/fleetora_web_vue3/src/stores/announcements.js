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
        // add announcements
        async addAnnouncements(params){
            
            const ls = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.post('api/announcements', params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                });
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
            
        },

    }

})