const { test, after, beforeEach, describe } = require('node:test')
const Login = require('../controllers/login')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')

const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)
class LoginInfo {
  constructor(username, password) {
    this.username = username
    this.password = password
  }
}

const passsword1 = 'sekret'
const passsword2 = 'abababa'
const username1 = 'root'
const username2 = 'sam'

describe('test login api', () => {


  beforeEach(async () => {
    await User.deleteMany({})
    
    const passwordHash1 = await bcrypt.hash(passsword1, 10)
    const passwordHash2 = await bcrypt.hash(passsword2, 10)

    const user1 = new User({
      username: username1,
      name: 'root',
      passwordHash: passwordHash1
    })

    const user2 = new User({
      username: username2,
      name: 'Sam',
      passwordHash: passwordHash2
    })

    await user1.save()
    await user2.save()
  })

  test('test successful login', async () => {
    const loginUser1 = new LoginInfo(username1, passsword1)
    const loginUser2 = new LoginInfo(username2, passsword2)
    const result1 = await api
      .post('/api/login')
      .send(loginUser1)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const result2 = await api
      .post('/api/login')
      .send(loginUser2)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(result1.body.token)
    const decodedToken1 = jwt.verify(result1.body.token, process.env.SECRET)
    assert(result2.body.token)
    const decodedToken2 = jwt.verify(result2.body.token, process.env.SECRET)
    assert.strictEqual(result1.body.username, username1)
    assert.strictEqual(result2.body.username, username2)
    
    const userInDb1 = (await helper.usersInDb()).find(user => user.username === result1.body.username)
    const userInDb2 = (await helper.usersInDb()).find(user => user.username === result2.body.username)
    assert.strictEqual(result1.body.name, userInDb1.name)
    assert.strictEqual(result2.body.name, userInDb2.name)
  })

  test('test wrong password and wrong username', async () => {
    const loginUser1WrongPassword = new LoginInfo(username1, passsword2)
    const loginUser2WrongName = new LoginInfo(username1, passsword2)

    const result1 = await api
      .post('/api/login')
      .send(loginUser1WrongPassword)
      .expect(401)

    const result2 = await api
      .post('/api/login')
      .send(loginUser2WrongName)
      .expect(401)
  })

})

after(async () => {
  await mongoose.connection.close()
})