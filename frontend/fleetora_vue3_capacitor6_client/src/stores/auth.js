import { defineStore } from 'pinia';
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'

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
        
        async setLSUserInfo(data){
            try {
                localStorage.setItem('userInfo', typeof data === 'string' ? data : JSON.stringify(data))
            } catch (e) {}
            await Preferences.set({
              key: 'userInfo',
              value: typeof data === 'string' ? data : JSON.stringify(data),
            })
        },

        async getLSUserInfo(){
            try {
                const { value } = await Preferences.get({ key: 'userInfo' })
                if (value) return JSON.parse(value)
            } catch (e) {}
            try {
                const ls = localStorage.getItem('userInfo')
                if (ls) return JSON.parse(ls)
            } catch (e) {}
            return null
        },

        async removeLSUserInfo(){
            try {
                localStorage.removeItem('userInfo')
            } catch (e) {}
            await Preferences.remove({ key: 'userInfo' })
        },

        // verify phone
        async account_verify_phone (params) {
            const response = await axios.post("api/users/verifyPhone", params)
            if(response.status === 200){
                // router.push({ path: `/codeVerification/${response.data.phonenumber}` })
                this.router.push({ path: `/userInformation/${params.phonenumber}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
    
        // verify code
        async account_verify_code (params) {
            const response = await axios.post("api/users/verifyCode", params)
            if(response){
                this.router.push({ path: `/userInformation/${response.data.data.to}` })
            } else {
                throw new Error('could not complete verification')
            }
        },
        
        // login to user account 
        async account_sign_in (params) {
            try {
                const response = await axios.post("api/users/login", params)
                if(response && response.data){
                    this.user = response.data.user || response.data
                    this.token = response.data.token
                    this.auth_login = true
                    
                    await this.setLSUserInfo(response.data)
                    this.router.push('/tabs')
                }else{
                    throw new Error('could not complete login')
                }
            } catch (error) {
                const msg = error.response?.data?.error || error.message || 'Login failed'
                throw new Error(msg)
            }
        },
    
        // sign up new user
        async account_sign_up (params) {
            console.log('params', params)
            try {
                const response = await axios.post("api/users/signup", params)
                if(response){
                    this.user = response.data
                    this.auth_login = true
                   
                    this.setLSUserInfo(JSON.stringify(response.data)).then(() => {
                        this.router.push('/tabs')
                    })
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                // console.log('error', error.response.data.error)
                throw new Error(`${error.response.data.error}`)
            }
        },
    
        async verifyUser(params){
            console.log('params', params)
            try {
                const response = await axios.post(`api/users/verifyUser`, params)
                   
                if(response.status === 200){
                    if(response.data.email === 'guest@gmail.com' && response.data.firstName === 'guest' && response.data.lastName === 'guest'){
                        this.user = response.data
                        this.router.push({ name: 'UpdateUserInformation' })
                    }else{
                        this.router.push('/login')
                    }
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
        },
    
        async checkPhone(params){
            try {
                const response = await axios.post(`api/users/verifyUser`, params)
                   
                if(response.status === 200){
                    this.user = response.data
                    this.router.push({ name: 'ForgotPassword' })
                }
                
            } catch (error) {
                throw new Error(`${error}`)
            }
        },
    
        // update existing user
        async account_update_existing_user (params) {
            console.log('params', params)
            try {
                const response = await axios.patch(`api/users/update_existing_user/${params.id}`, params)
                if(response.status === 200){
                    console.log('res account_update_existing_user', response.data)
                    this.account_sign_in({ 
                        phone: response.data.phone,
                        password: params.password,
                        role: 'client'
                    })
                    // commit('setUser', response.data)
                    // commit('setAuthLogin', true)
                    // dispatch('setLSUserInfo', JSON.stringify(response.data)).then(() => {
                    //     router.push('/tabs')  
                    // })
    
                } else {
                    throw new Error('could not complete signup')
                }
                
            } catch (error) {
                // console.log('error', error.response.data.error)
                throw new Error(`${error.response.data.error}`)
            }
        },
    
        // log out user
        account_sign_out () {
            this.removeLSUserInfo()
            this.auth_login = false
            this.user = null
            this.token = null
            this.router.push('/login')
        },
    
        async attempt(token){
            if (token){
                this.token = token
                this.auth_login = true
                try {
                    const ls = await this.getLSUserInfo()
                    if (ls && ls.user) {
                        this.user = ls.user
                    }
                } catch (e) {}
                return true
            }
            this.user = null
            this.token = null
            this.auth_login = false
            return false
        },
      
    },
});