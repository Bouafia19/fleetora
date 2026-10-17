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

        geyUser: (state) => {
            return state.user
        }
    },

    actions: {
        
        // verify phone
        async account_verify_phone (params) {
            const response = await axios.post("api/users/verifyPhone", params)
            if(response.status === 200){
                this.account_sign_up({  
                    phone: params.phonenumber,
                    role: 'client',
                    firstName: 'guest',
                    lastName: 'guest',
                    email: 'guest@gmail.com',
                    activated: true
                })
            } else {
                throw new Error('could not complete verification')
            }
        },

        // verify code
        async account_verify_code (params) {
            const response = await axios.post("api/users/verifyCode", params)
            if(response){
                this.account_sign_up({  
                    phone: params.phonenumber,
                    role: 'client',
                    firstName: 'guest',
                    lastName: 'guest',
                    email: 'guest@gmail.com',
                    activated: true
                })
            } else {
                throw new Error('could not complete verification')
            }
        },

        // login to user account 
        async account_sign_in (params) {
            console.log('params', params)
            try {
                const response = await axios.post("api/users/loginWeb", params)
                if(response.status === 200){
                    this.user = response.data
                    this.auth_login = true
                    localStorage.setItem('userInfo', JSON.stringify(response.data))
                    
                    this.router.push({ name: 'Map' })  
                    
                }
            } catch (error) {
                throw new Error(`${error}`)
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