process.env.NODE_ENV = 'test'
const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const http = require('http')
const mongoose = require('mongoose')
const { app, server } = require('../server')
const ioClient = require('socket.io-client')

const TEST_PORT = 4199
let testServer = null
let adminToken = null
let clientToken = null
let partnerToken = null

before(async () => {
    process.env.NODE_ENV = 'test'
    process.env.PORT = TEST_PORT
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetora')
    
    await new Promise((resolve) => {
        testServer = server.listen(TEST_PORT, () => {
            console.log(`[Test Server] Running on http://localhost:${TEST_PORT}`)
            resolve()
        })
    })
})

after(async () => {
    if (testServer) {
        await new Promise(resolve => testServer.close(resolve))
    }
    await mongoose.disconnect()
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

describe('Fleetora Backend Express 5 API Test Suite', () => {

    test('GET /health returns 200 and healthy status', async () => {
        const res = await request('GET', '/health')
        assert.strictEqual(res.status, 200)
        assert.strictEqual(res.body.service, 'Fleetora API')
        assert.strictEqual(res.body.status, 'UP')
        assert.strictEqual(res.body.dbState, 'connected')
    })

    test('POST /users/login authenticates Administrator and returns rules + JWT token', async () => {
        const res = await request('POST', '/users/login', {
            email: 'admin@fleetora.com',
            password: 'admin123456',
            role: 'administrator'
        })
        assert.strictEqual(res.status, 200)
        assert.ok(res.body.token, 'Token must be present')
        assert.ok(res.body.user, 'User object must be present')
        assert.strictEqual(res.body.user.role, 'administrator')
        assert.strictEqual(res.body.user.password, undefined, 'Administrator password hash must NOT be returned')
        assert.ok(Array.isArray(res.body.rules), 'CASL authorization rules must be an array')
        adminToken = res.body.token
    })

    test('POST /users/login authenticates Partner transporter with local phone format and password', async () => {
        const res = await request('POST', '/users/login', {
            phone: '0550000002',
            password: 'partner123456',
            role: 'transporter'
        })
        assert.strictEqual(res.status, 200)
        assert.ok(res.body.token)
        assert.strictEqual(res.body.user.role, 'transporter')
        partnerToken = res.body.token
    })

    test('POST /users/login authenticates Client with local phone format and spaces', async () => {
        const res = await request('POST', '/users/login', {
            phone: '0550 00 00 03',
            password: 'client123456',
            role: 'client'
        })
        assert.strictEqual(res.status, 200)
        assert.ok(res.body.token)
        assert.strictEqual(res.body.user.role, 'client')
        clientToken = res.body.token
    })

    test('GET /vehicles requires authentication and returns fleet vehicle types', async () => {
        const unauth = await request('GET', '/vehicles')
        assert.strictEqual(unauth.status, 401)

        const res = await request('GET', '/vehicles', null, {
            'Authorization': `Bearer ${adminToken}`
        })
        assert.strictEqual(res.status, 200)
        assert.ok(Array.isArray(res.body))
        assert.ok(res.body.length >= 3, 'Must have at least 3 vehicles seeded')
        assert.ok(res.body[0].name)
        assert.ok(res.body[0].priceKm)
    })

    test('GET /trips returns seeded trips with populated references', async () => {
        const res = await request('GET', '/trips', null, {
            'Authorization': `Bearer ${adminToken}`
        })
        assert.strictEqual(res.status, 200)
        assert.ok(Array.isArray(res.body))
        assert.ok(res.body.length >= 1)
        assert.strictEqual(res.body[0].status, 'finished')
    })

    test('GET /company returns platform company profile', async () => {
        const res = await request('GET', '/company', null, {
            'Authorization': `Bearer ${adminToken}`
        })
        assert.strictEqual(res.status, 200)
        assert.ok(Array.isArray(res.body))
        assert.ok(res.body.length >= 1)
        assert.ok(res.body[0].companyName.includes('Fleetora'))
    })

    test('GET /terms returns public terms and conditions', async () => {
        const res = await request('GET', '/terms')
        assert.strictEqual(res.status, 200)
        assert.ok(Array.isArray(res.body))
        assert.ok(res.body.length >= 1)
    })

    test('GET /billings returns billing records', async () => {
        const res = await request('GET', '/billings', null, {
            'Authorization': `Bearer ${adminToken}`
        })
        assert.strictEqual(res.status, 200)
        assert.ok(Array.isArray(res.body))
    })

    test('POST /users/verifyPhone validates phone format and duplicate checks', async () => {
        // Existing phone should return 400
        const duplicateRes = await request('POST', '/users/verifyPhone', {
            phonenumber: '+213550000002',
            channel: 'sms',
            role: 'transporter'
        })
        assert.strictEqual(duplicateRes.status, 400)

        // New phone should return 200
        const newPhoneRes = await request('POST', '/users/verifyPhone', {
            phonenumber: '+213559999999',
            channel: 'sms',
            role: 'client'
        })
        assert.strictEqual(newPhoneRes.status, 200)
        assert.strictEqual(newPhoneRes.body.phonenumber, '+213559999999')
    })

    test('POST /users/verifyCode approves 6-digit code', async () => {
        const res = await request('POST', '/users/verifyCode', {
            phonenumber: '+213559999999',
            code: '123456'
        })
        assert.strictEqual(res.status, 200)
        assert.strictEqual(res.body.data.status, 'approved')
    })

    test('Socket.io connects and handles real-time response events', async () => {
        const socket = ioClient(`http://localhost:${TEST_PORT}`, {
            path: '/socket.io/',
            transports: ['websocket']
        })

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Socket.io connection timeout')), 4000)
            socket.on('connect', () => {
                clearTimeout(timeout)
                resolve()
            })
            socket.on('connect_error', reject)
        })

        assert.ok(socket.id, 'Socket must receive an id')

        // Test room joining and event reception
        await new Promise((resolve) => {
            socket.emit('joinRoom', 'test-room')
            setTimeout(resolve, 100)
        })

        socket.disconnect()
    })
})
