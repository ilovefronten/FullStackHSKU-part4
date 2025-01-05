const { describe, test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const User = require('../models/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const mongoose = require('mongoose')
const { forEach } = require('lodash')
const api = supertest(app)

describe('test user api', () => {
  // Initiallize the test database 
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      name: 'root',
      passwordHash
    })

    await user.save()
  })

  test('test get all users', async () => {
    const allUsers = await helper.usersInDb()
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, allUsers.length)
    assert.deepStrictEqual(response.body, allUsers)
  })

  test('test add a new user to database', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: '%^&*987uio'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtLast = await helper.usersInDb()
    // check number of user increases after added
    assert.strictEqual(usersAtLast.length, usersAtStart.length + 1)

    // check users include the latest added one
    assert(usersAtLast.map(user => user.name).includes(newUser.name))

  })

  test('test duplicate usernames cannot be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const duplicateUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: 'abcdefg'
    }

    await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(201)

    const usersAfterFirstPost = await helper.usersInDb()

    await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(400)

    const result = await api
      .get('/api/users')

    assert.strictEqual(result.body.length, usersAfterFirstPost.length)
  })

  test('test password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const shortPasswordUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: '123'
    }

    await api
      .post('/api/users')
      .send(shortPasswordUser)
      .expect(400)

    const result = await api
      .get('/api/users')
      .expect(200)

    const usersAtLast = result.body

    assert.strictEqual(usersAtLast.length, usersAtStart.length)
  })

  test('test username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const shortUsernameUser = {
      username: 'he',
      name: 'Arto Hellas',
      password: '%34hdh123'
    }

    await api
      .post('/api/users')
      .send(shortUsernameUser)
      .expect(400)

    const result = await api
      .get('/api/users')
      .expect(200)

    const usersAtLast = result.body

    assert.strictEqual(usersAtLast.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})