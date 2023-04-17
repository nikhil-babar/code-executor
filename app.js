const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const connectRedis = require('connect-redis').default
const Redis = require('ioredis')
const codeExecutor = require('./routes/code-execution')
const authProvider = require('./routes/auth')
require('dotenv').config()

const redisClient = new Redis()

const RedisStore = new connectRedis({
    client: redisClient,
    prefix: 'session'
})

app.use(
    session({
      store: RedisStore,
      resave: false, 
      saveUninitialized: false, 
      secret: process.env.SESSION_SECRET,
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

app.listen(5000, () => console.log('server on port 5000'))