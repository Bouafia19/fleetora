import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('users', {

    state: () => ({
        users: [],
        user: undefined
    }),

    getters: {
        getUser: (state) => state.user
    },

    actions: {
        //fetch single User
        async fetchUser(){
            try {
                const ls = JSON.parse(localStorage.getItem('userInfo'))
                if (ls && ls.user) {
                    this.user = ls.user
                    return ls.user
                }
            } catch (error) {
                // safely ignore JSON error
            }
            this.user = null
            return null
        },

        // edit users
        async editUsers(params){
            let ls = null
            try {
                ls = JSON.parse(localStorage.getItem('userInfo'))
            } catch (e) {}
            if (!ls || !ls.user || !ls.token) {
                throw new Error('Not authenticated')
            }
            
            try {
                const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                })
                if(response.status === 200){
                    await this.fetchUser()
                }
            } catch (error) {
                throw new Error(`${error}`)
            }   
        }
    }
})