const { MONGODB_URL } = require('./util/config')
const express = require('express')
const app = express()
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const { unknownEndpoint, errorHandler } = require('./util/middleware')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const cors = require('cors')
const logger = require('./util/logger')

mongoose.connect(MONGODB_URL)
  .then(result => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app