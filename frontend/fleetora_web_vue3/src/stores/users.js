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
            return new Promise((resolve, reject) => {
                try {
                    const ls = JSON.parse(localStorage.getItem('userInfo'))
                    this.user = ls.user
                    resolve()
                } catch (error) {
                    reject()
                    throw new Error(`${error}`)
                }
            })
        },

        // edit users
        async editUsers(params){
            const ls = JSON.parse(localStorage.getItem('userInfo'))
            
            try {
                const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${ls.token}`
                    },
                })
                if(response.status === 200){
                    this.fetchUser()
                }
            } catch (error) {
                throw new Error(`${error}`)
            }   
        }
    }
})