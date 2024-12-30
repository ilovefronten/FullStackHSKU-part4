const usersRoute = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

usersRoute.get('/', async (request, response, next) => {
  try {
    const allUsers = await User.find({})
    response.json(allUsers)    
  } catch (error) {
    next(error)
  }
})

usersRoute.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body
 
    if (password.length <= 3) {
      return response.status(400).send('password too short')
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRoute