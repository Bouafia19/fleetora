import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

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
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        this.user = ls.user
                        resolve()
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }
                })            
            })
        },

        async updateUserProfile(params){
            console.log('params', params)
            return new Promise((resolve, reject) => {
    
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
                    try {
                        const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            }
                        })
                        if(response.status === 200){
                            auth.removeLSUserInfo()
                            auth.setLSUserInfo(JSON.stringify({
                                token: ls.token, 
                                user: response.data
                            }))
                            this.user = response.data
                            
                            resolve(response.data)
                        }
                    } catch (error) {
                        reject()
                    }     
                })
            })
        },

        // edit users
        async editUsers(params){
            return new Promise((resolve, reject) => {
                const auth = useAuthStore()
                auth.getLSUserInfo().then(async (ls) => {
            
                    try {
                        const response = await axios.patch(`api/users/${ls.user._id}`, params, {
                            headers: {
                                'Authorization': `Bearer ${ls.token}`
                            },
                        })
                        if(response.status === 200){
                            auth.removeLSUserInfo()
                            auth.setLSUserInfo(JSON.stringify({
                                token: ls.token, 
                                user: response.data
                            }))
                            this.fetchUser()
                            resolve()
                        }
                    } catch (error) {
                        reject()
                        throw new Error(`${error}`)
                    }   
                })
            })
        }
    }
})