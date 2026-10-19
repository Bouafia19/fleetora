import { defineStore } from 'pinia';
import axios from 'axios'

export const useCompanyStore = defineStore('company', {

    state: () => ({ 
        homeImage: undefined
    }),

    getters: {
        getHomeImage: (state) => state.homeImage
    },

    actions: {
        //company 
        async fetchAppImage(){
            try {
                const response = await axios.get('/api/company/getAppImage')
                if (response.data && response.data[0] && response.data[0].appImage) {
                    this.homeImage = response.data[0].appImage
                }
            } catch (e) {
                console.warn('Could not fetch custom company app image:', e.message)
            }
        }
    }
})