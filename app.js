const { MONGODB_URL } = require('./util/config')
const express = require('express')
const app = express()
const blogsRouter = require('./controllers/blogs')
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  response.status(500).send({ error: 'Internal server error' });
}

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app