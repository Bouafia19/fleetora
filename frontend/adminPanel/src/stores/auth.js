import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: [],
        auth_login: false,
        token: null,
        rules: []
    }),

    getters: {
        authenticated: (state) => state.auth_login && state.user,
        getUser: (state) => state.user,
        getRules: (state) => state.rules
    },

    actions: {
        async account_sign_in(params) {
            const response = await axios.post("api/users/login", params)
            this.user = response.data.user
            this.token = response.data.token
            this.rules = response.data.rules || []
            localStorage.setItem('userInfo', JSON.stringify(response.data))
            this.auth_login = true
            this.router.push({ name: 'Home' })
        },

        account_sign_out() {
            localStorage.removeItem('userInfo')
            this.auth_login = false
            this.user = []
            this.token = null
            this.rules = []
            this.router.push('/login')
        },

        async attempt(token) {
            if (token) {
                this.token = token
                this.auth_login = true
                const ls = JSON.parse(localStorage.getItem('userInfo'))
                if (ls) {
                    this.user = ls.user
                    this.rules = ls.rules || []
                }
                return true
            }
            this.user = []
            this.auth_login = false
            return false
        }
    }
})
