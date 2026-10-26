import { defineStore } from 'pinia';
import axios from 'axios'

export const useAuthStore = defineStore('auth', {

    state: () => ({
        user: [],
        auth_login: false,
        token: null
    }),

    getters: {
        authenticated: (state) => {
            return state.auth_login && state.user
        },

        getUser: (state) => {
            return state.user
        }
    },

    actions: {
        
        // verify phone
        async account_verify_phone (params) {
            const response = await axios.post("api/users/verifyPhone", params)
            if(response.status === 200){
                return response.data
            } else {
                throw new Error('could not complete verification')
            }
        },

        // verify code
        async account_verify_code (params) {
            const response = await axios.post("api/users/verifyCode", params)
            if(response){
                return response.data
            } else {
                throw new Error('could not complete verification')
            }
        },

        // login to user account (requires password)
        async account_sign_in (params) {
            try {
                const response = await axios.post("api/users/login", params)
                if(response.status === 200 && response.data.token){
                    this.user = response.data.user
                    this.token = response.data.token
                    this.auth_login = true
                    localStorage.setItem('userInfo', JSON.stringify(response.data))
                    this.router.push({ name: 'Map' })  
                } else {
                    throw new Error('Login failed: invalid response')
                }
            } catch (error) {
                const msg = error.response?.data?.error || error.message || 'Authentication error'
                throw new Error(msg)
            }
        },

        // sign up new user
        async account_sign_up (params) {

            try {
                const response = await axios.post("api/users/signupUserWeb", params)
                if(response){
                    this.user = response.data
                    this.auth_login = true
                    localStorage.setItem('userInfo', JSON.stringify(response.data))
                    this.router.push({ name: 'Map' })
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                throw new Error(`${error.response.data.error}`)
            }
            
        },

        // log out user
        account_sign_out () {
            localStorage.removeItem('userInfo')
            this.auth_login = false
            this.router.push('/signup')
        },

        async attempt(token){
            if (token){
                this.user = token
                this.auth_login = true
                return true
            }
            if (!token) {
                this.user = ''
                this.auth_login = false
                return false
            }
        },
      
    },
});