import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: undefined,
        userInfo: [],
        transporters: undefined,
        pendingPartners: undefined
    }),

    getters: {
        getUsers: (state) => state.users,
        getUserInfo: (state) => state.userInfo,
        getTransporters: (state) => state.transporters,
        getPendingPartners: (state) => state.pendingPartners,
    },

    actions: {
        async fetchUsers() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/users', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.users = response.data
            this.transporters = response.data.filter(i => i.role === 'transporter')
            this.pendingPartners = response.data.filter(i => i.role === 'transporter' && i.fileStatus === 'pending')
        },

        async addUsers(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/users', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async fetchUser(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get(`api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.userInfo = response.data
        },

        async editUsers(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/users/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteUsers(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async updateExistingUser(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                const response = await axios.patch(`api/users/update_existing_user/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
                return response.data
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        }
    }
})
