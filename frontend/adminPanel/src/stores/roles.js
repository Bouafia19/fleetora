import { defineStore } from 'pinia'
import axios from 'axios'

export const useRolesStore = defineStore('roles', {
    state: () => ({
        roles: []
    }),

    getters: {
        getRoles: (state) => state.roles
    },

    actions: {
        async fetchRoles() {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            const response = await axios.get('api/roles', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            this.roles = response.data
        },

        async addRoles(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.post('api/roles', params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async editRoles(params) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.patch(`api/roles/${params._id}`, params, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        },

        async deleteRoles(id) {
            const user = JSON.parse(localStorage.getItem('userInfo'))
            try {
                await axios.delete(`api/roles/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    },
                })
            } catch (error) {
                throw new Error(`${error.response?.data?.error || error.message}`)
            }
        }
    }
})
