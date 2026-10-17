import { defineStore } from 'pinia'
import axios from 'axios'

export const useTermsStore = defineStore('terms', {

    state: () => ({
        terms: [],
        loadingTerms: true
    }),

    getters: {
        getTerms: (state) => state.terms,
        getLoadingTerms: (state) => state.loadingTerms
    },

    actions: {
        //terms component
        async fetchTerms(){
            // const user = JSON.parse(localStorage.getItem('userInfo'))
            this.loadingTerms = true
            try {
                const response = await axios.get('api/terms', {
                    
                });
                if(response.status === 200){
                    this.terms = response.data
                    this.loadingTerms = false
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
            
        }
    }
})