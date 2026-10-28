require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const Role = require('../models/Role')
const Company = require('../models/Company')
const Term = require('../models/Term')
const Trip = require('../models/Trip')
const Billing = require('../models/Billing')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetora'

async function seed() {
    console.log('[Fleetora Seeder] Connecting to:', MONGO_URI)
    await mongoose.connect(MONGO_URI)

    console.log('[Fleetora Seeder] Seeding initial roles...')
    await Role.deleteMany({})
    const roles = await Role.insertMany([
        {
            name: 'Administrator',
            subject: 'all',
            actions: { read: true, create: true, update: true, delete: true }
        },
        {
            name: 'Trips Manager',
            subject: 'Trip',
            actions: { read: true, create: true, update: true, delete: false }
        },
        {
            name: 'Billing Officer',
            subject: 'Billing',
            actions: { read: true, create: true, update: true, delete: false }
        },
        {
            name: 'Fleet Manager',
            subject: 'Vehicle',
            actions: { read: true, create: true, update: true, delete: true }
        },
        {
            name: 'User Manager',
            subject: 'User',
            actions: { read: true, create: true, update: true, delete: false }
        }
    ])

    console.log('[Fleetora Seeder] Seeding vehicles...')
    await Vehicle.deleteMany({})
    const vehicles = await Vehicle.insertMany([
        {
            name: 'Fourgonnette (Van < 1.5T)',
            photo: '/trucks/1.jpeg',
            priceKm: 65,
            minimum: 2500,
            order: 1
        },
        {
            name: 'Camion Moyen (Box Truck 3.5T - 5T)',
            photo: '/trucks/2.jpg',
            priceKm: 110,
            minimum: 4500,
            order: 2
        },
        {
            name: 'Camion Plateau (Flatbed 10T)',
            photo: '/trucks/3.png',
            priceKm: 180,
            minimum: 7500,
            order: 3
        },
        {
            name: 'Semi-Remorque (Heavy Freight 20T+)',
            photo: '/trucks/4.png',
            priceKm: 260,
            minimum: 12000,
            order: 4
        },
        {
            name: 'Camion Frigorifique (Refrigerated 10T)',
            photo: '/trucks/5.jpg',
            priceKm: 220,
            minimum: 9500,
            order: 5
        }
    ])

    console.log('[Fleetora Seeder] Seeding company profile...')
    await Company.deleteMany({})
    await Company.create({
        companyName: 'Fleetora Mobility & Logistics SpA',
        city: 'Algiers',
        street: '15 Boulevard des Martyrs',
        state: 'Algiers',
        phone: '+213 21 00 11 22',
        mobile: '+213 550 12 34 56',
        email: 'contact@fleetora.com.dz',
        siteWeb: 'https://fleetora.com.dz',
        logo: '/logistique.png',
        businessSector: 'Freight Transport, Fleet Logistics & Supply Chain Solutions',
        statisticalIdentifierNumber: '002316098765432',
        taxIdentifierNumber: '099812345678901',
        commercialRegisterNumber: '16/00-9876543B21',
        taxArticleNumber: '16012345678',
        bankAccountStatement: 'BNA 001 00234 5678901234 56'
    })

    console.log('[Fleetora Seeder] Seeding terms and conditions...')
    await Term.deleteMany({})
    await Term.insertMany([
        {
            order: '1',
            title: 'Acceptance of Terms',
            text: 'By accessing and utilizing the Fleetora smart logistics and transportation platform, shippers, partners, and carriers agree to comply with all operational, legal, and safety regulations governed by transportation authorities.'
        },
        {
            order: '2',
            title: 'Carrier Verification & Compliance',
            text: 'All transport partners operating on Fleetora must maintain valid commercial documentation including registration, driver qualification, valid insurance, vehicle mechanical conformity certificates, and technical inspections.'
        },
        {
            order: '3',
            title: 'Pricing, Tariffs & Settlement',
            text: 'Shipment costs are calculated dynamically based on distance, cargo dimensions, vehicle classification, and additional handling services. Settlements are processed following electronic proof of delivery confirmation.'
        }
    ])

    console.log('[Fleetora Seeder] Seeding users...')
    await User.deleteMany({})

    const salt = await bcrypt.genSalt(10)
    const adminPasswordHash = await bcrypt.hash('admin123456', salt)
    const partnerPasswordHash = await bcrypt.hash('partner123456', salt)
    const clientPasswordHash = await bcrypt.hash('client123456', salt)

    // Admin user
    const admin = await User.create({
        email: 'admin@fleetora.com',
        firstName: 'Fleetora',
        lastName: 'Administrator',
        phone: '+213550000001',
        password: adminPasswordHash,
        role: 'administrator',
        language: 'fr',
        activated: true,
        complete: true,
        status: true,
        legal: true,
        authorizationIds: roles.map(r => r._id)
    })

    // Transporter partner user 1 (Sétif Hub)
    const transporter = await User.create({
        email: 'driver@fleetora.com',
        firstName: 'Karim',
        lastName: 'Benali',
        phone: '+213550000002',
        password: partnerPasswordHash,
        role: 'transporter',
        language: 'fr',
        activated: true,
        complete: true,
        status: true,
        fileStatus: 'confirmed',
        legal: true,
        codePartenaire: 'FLT-DRV-001',
        vehicleId: vehicles[0]._id,
        lastLatLng: { lat: 36.1911, lng: 5.4137 }, // Sétif Centre
        fcmToken: 'mock_fcm_token_transporter_fleetora_1'
    })

    // Transporter partner user 2 (Sétif Heavy Freight)
    const transporter2 = await User.create({
        email: 'rachid@fleetora.com',
        firstName: 'Rachid',
        lastName: 'Bouzid',
        phone: '+213551234567',
        password: partnerPasswordHash,
        role: 'transporter',
        language: 'fr',
        activated: true,
        complete: true,
        status: true,
        fileStatus: 'confirmed',
        legal: true,
        codePartenaire: 'FLT-SET-01',
        vehicleId: vehicles[3]._id,
        lastLatLng: { lat: 36.1772, lng: 5.4215 }, // Sétif Zone Industrielle
        fcmToken: 'mock_fcm_token_transporter_fleetora_2'
    })

    // Transporter partner user 3 (Ain Arnat Logistics Area)
    const transporter3 = await User.create({
        email: 'walid@fleetora.com',
        firstName: 'Walid',
        lastName: 'Cherif',
        phone: '+213552987654',
        password: partnerPasswordHash,
        role: 'transporter',
        language: 'fr',
        activated: true,
        complete: true,
        status: true,
        fileStatus: 'confirmed',
        legal: true,
        codePartenaire: 'FLT-SET-03',
        vehicleId: vehicles[1]._id,
        lastLatLng: { lat: 36.1781, lng: 5.3256 }, // Ain Arnat
        fcmToken: 'mock_fcm_token_transporter_fleetora_3'
    })

    // Client shipper user
    const client = await User.create({
        email: 'client@fleetora.com',
        firstName: 'Amine',
        lastName: 'Meziane',
        phone: '+213550000003',
        password: clientPasswordHash,
        role: 'client',
        language: 'fr',
        activated: true,
        complete: true,
        status: true,
        legal: true,
        lastLatLng: { lat: 36.1893, lng: 5.4046 }, // Sétif
        fcmToken: 'mock_fcm_token_client_fleetora_1'
    })

    console.log('[Fleetora Seeder] Seeding sample trip...')
    await Trip.deleteMany({})
    const trip = await Trip.create({
        clientId: client._id,
        transporterId: transporter._id,
        vehicleId: vehicles[0]._id,
        price: 3500,
        distance: 24.5,
        from: 'Sétif — Zone Industrielle & Dépôts Logistiques',
        to: 'Sétif — Gare Routière & Fret El Eulma',
        status: 'finished',
        finished: true,
        paid: true,
        rating: 5,
        start: new Date(Date.now() - 3600000 * 24),
        marchandise: {
            weight: 850,
            height: 140,
            width: 100,
            depth: 120,
            type: 'Industrial Spares & Electronics',
            photo: '/avatar.png'
        },
        cancellation: {
            reason: '',
            by: 'default'
        }
    })

    console.log('[Fleetora Seeder] Seeding sample billing...')
    await Billing.deleteMany({})
    await Billing.create({
        transporterId: transporter._id,
        amount: 3150,
        brutAmount: 3500,
        billingMethod: 'Virement Bancaire',
        date: new Date(),
        description: 'Settlement for completed cargo delivery #FLT-TRIP-001',
        tripsIds: [trip._id],
        status: 'confirmed'
    })

    console.log('[Fleetora Seeder] Seed completed successfully!')
    console.log('   Admin credentials: admin@fleetora.com / admin123456')
    console.log('   Partner credentials: +213550000002 / partner123456')
    console.log('   Client credentials: +213550000003 / client123456')

    await mongoose.disconnect()
}

seed().catch(err => {
    console.error('[Fleetora Seeder] Error during seed:', err)
    process.exit(1)
})
