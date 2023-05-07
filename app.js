const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const connectRedis = require('connect-redis').default
const Redis = require('ioredis').default
const cors = require('cors')
const codeExecutor = require('./routes/code-execution')
const authProvider = require('./routes/auth')
const githubProvider = require('./routes/github')
require('dotenv').config()

const redisClient = new Redis({
    host: 'localhost',
    port: 6379
})

redisClient.on('connect', () => console.log('connected to redis'))

redisClient.on('error', (e) => console.log('Redis error: ' + e.message))

const RedisStore = new connectRedis({
    client: redisClient,
    prefix: 'session'
})

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(
    session({
        store: RedisStore,
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        cookie: { httpOnly: true }
    })
)

mongoose.set('strictQuery', true)

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log('connected to db'))
    .catch((err) => console.log(err))

app.use(express.json())
app.use('/code-execution', codeExecutor)
app.use('/auth', authProvider)
app.use('/github', githubProvider)

app.listen(5000, () => console.log('server on port 5000'))