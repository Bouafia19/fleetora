process.env.NODE_ENV = 'test'
const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const http = require('http')
const mongoose = require('mongoose')
const { app, server } = require('../server')

const TEST_PORT = 4201
let testServer = null

let adminToken = null
let clientToken = null
let partnerToken = null
let adminUserId = null
let clientUserId = null
let partnerUserId = null

before(async () => {
    process.env.NODE_ENV = 'test'
    process.env.PORT = TEST_PORT
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetora')
    }

    await new Promise((resolve) => {
        testServer = server.listen(TEST_PORT, () => {
            console.log(`[Security Test Server] Running on http://localhost:${TEST_PORT}`)
            resolve()
        })
    })

    // Log in admin
    const adminRes = await request('POST', '/users/login', {
        email: 'admin@fleetora.com',
        password: 'admin123456',
        role: 'administrator'
    })
    adminToken = adminRes.body.token
    adminUserId = adminRes.body.user._id

    // Log in client
    const clientRes = await request('POST', '/users/login', {
        phone: '+213550000003',
        password: 'client123456',
        role: 'client'
    })
    clientToken = clientRes.body.token
    clientUserId = clientRes.body.user._id

    // Log in partner
    const partnerRes = await request('POST', '/users/login', {
        phone: '+213550000002',
        password: 'partner123456',
        role: 'transporter'
    })
    partnerToken = partnerRes.body.token
    partnerUserId = partnerRes.body.user._id
})

after(async () => {
    if (testServer) {
        await new Promise(resolve => testServer.close(resolve))
    }
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect()
    }
})

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null
        const reqHeaders = {
            'Content-Type': 'application/json',
            ...headers
        }
        if (payload) {
            reqHeaders['Content-Length'] = Buffer.byteLength(payload)
        }

        const req = http.request({
            hostname: 'localhost',
            port: TEST_PORT,
            path,
            method,
            headers: reqHeaders
        }, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                let parsed = data
                try {
                    parsed = JSON.parse(data)
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed })
            })
        })

        req.on('error', reject)
        if (payload) req.write(payload)
        req.end()
    })
}

describe('Fleetora Security & Production Hardening Verification Suite', () => {

    describe('FLT-SEC-001: Account Modification & Privilege Escalation Defenses', () => {
        test('Anonymous PATCH /users/update_existing_user/:id is strictly rejected (401)', async () => {
            const res = await request('PATCH', `/users/update_existing_user/${clientUserId}`, {
                firstName: 'Attacker'
            })
            assert.strictEqual(res.status, 401)
        })

        test('Client attempting cross-user account modification is rejected (403)', async () => {
            const res = await request('PATCH', `/users/update_existing_user/${partnerUserId}`, {
                firstName: 'Malicious'
            }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Client attempting role escalation to administrator is neutralized (mass assignment blocked)', async () => {
            const res = await request('PATCH', `/users/update_existing_user/${clientUserId}`, {
                role: 'administrator',
                status: true
            }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.body.role, 'client', 'Role must remain client despite attempt to escalate')
        })

        test('Legitimate authorized self-update succeeds for allowed fields', async () => {
            const res = await request('PATCH', `/users/update_existing_user/${clientUserId}`, {
                firstName: 'VerifiedClient'
            }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.body.firstName, 'VerifiedClient')
        })
    })

    describe('FLT-SEC-002: Web Authentication & Passwordless Bypass Removal', () => {
        test('POST /users/loginWeb without password is rejected (400)', async () => {
            const res = await request('POST', '/users/loginWeb', {
                phone: '+213550000003'
            })
            assert.strictEqual(res.status, 400)
        })

        test('POST /users/loginWeb with incorrect password is rejected (400)', async () => {
            const res = await request('POST', '/users/loginWeb', {
                phone: '+213550000003',
                password: 'wrong_password_999'
            })
            assert.strictEqual(res.status, 400)
        })

        test('POST /users/loginWeb with correct credentials returns authenticated JWT', async () => {
            const res = await request('POST', '/users/loginWeb', {
                phone: '+213550000003',
                password: 'client123456'
            })
            assert.strictEqual(res.status, 200)
            assert.ok(res.body.token)
            assert.strictEqual(res.body.user.phone, '+213550000003')
        })
    })

    describe('FLT-SEC-003: Financial Billings Route Access Control', () => {
        test('Anonymous GET /billings is strictly rejected (401)', async () => {
            const res = await request('GET', '/billings')
            assert.strictEqual(res.status, 401)
        })

        test('Client GET /billings is forbidden (403)', async () => {
            const res = await request('GET', '/billings', null, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Transporter GET /billings (all records) is forbidden (403)', async () => {
            const res = await request('GET', '/billings', null, {
                'Authorization': `Bearer ${partnerToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Administrator GET /billings is allowed (200)', async () => {
            const res = await request('GET', '/billings', null, {
                'Authorization': `Bearer ${adminToken}`
            })
            assert.strictEqual(res.status, 200)
            assert.ok(Array.isArray(res.body))
        })
    })

    describe('FLT-SEC-005: Role-Based Access Control (RBAC) Enforcement', () => {
        test('Client accessing GET /roles is forbidden (403)', async () => {
            const res = await request('GET', '/roles', null, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Client accessing POST /vehicles is forbidden (403)', async () => {
            const res = await request('POST', '/vehicles', { name: 'TestTruck' }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Client accessing POST /announcements is forbidden (403)', async () => {
            const res = await request('POST', '/announcements', { title: 'Spam' }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Client accessing POST /notifications/topics is forbidden (403)', async () => {
            const res = await request('POST', '/notifications/topics', { topic: 'all' }, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Administrator accessing GET /roles is allowed (200)', async () => {
            const res = await request('GET', '/roles', null, {
                'Authorization': `Bearer ${adminToken}`
            })
            assert.strictEqual(res.status, 200)
        })
    })

    describe('IDOR & Data Leakage Protection', () => {
        test('Client cannot download another partner documents via loadPartnerPhotos (403)', async () => {
            const res = await request('GET', `/users/loadPartnerPhotos/${partnerUserId}`, null, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Partner cannot view billing records of another partner (403)', async () => {
            const res = await request('GET', `/billings/getBillingsByTransporterId/${clientUserId}`, null, {
                'Authorization': `Bearer ${partnerToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('Non-administrator attempting DELETE /trips/:id is forbidden (403)', async () => {
            const res = await request('DELETE', `/trips/${clientUserId}`, null, {
                'Authorization': `Bearer ${clientToken}`
            })
            assert.strictEqual(res.status, 403)
        })

        test('GET /users excludes heavy document images to prevent memory exhaustion (FLT-ARC-002)', async () => {
            const res = await request('GET', '/users', null, {
                'Authorization': `Bearer ${adminToken}`
            })
            assert.strictEqual(res.status, 200)
            assert.ok(Array.isArray(res.body))
            if (res.body.length > 0) {
                const sample = res.body[0]
                assert.strictEqual(sample.grayCard, undefined, 'grayCard must not be projected in bulk list')
                assert.strictEqual(sample.commercialRegister, undefined, 'commercialRegister must not be projected in bulk list')
                assert.strictEqual(sample.transportCard, undefined, 'transportCard must not be projected in bulk list')
            }
        })
    })
})
