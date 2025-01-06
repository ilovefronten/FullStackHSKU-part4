const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const initialBlogs = [
  {
    "title": "My first blog",
    "author": "vetikke",
    "url": "first-blog",
    "likes": 55
  },
  {
    "title": "My 2nd blog",
    "author": "ikkevet",
    "url": "second-blog",
    "likes": 0
  },
]

const UserPassword = ['thisisthefirstpw!', 'pwisthis2!']

const initializeUsers = async () => [
  {
    "username": "vetikke",
    "name": "sam",
    "passwordHash": await bcrypt.hash(UserPassword[0], 10),
  },
  {
    "username": "ikkevet",
    "name": "jack",
    "passwordHash": await bcrypt.hash(UserPassword[1], 10),
  },

]

const blogsInDb = async () => {
  return (await Blog.find({})).map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => ({
    username: user.username,
    name: user.name,
    blogs: user.blogs,
    id: user._id.toString() // 手动将 _id 转为字符串
  }))
}

module.exports = {
  initialBlogs,
  UserPassword,
  initializeUsers,
  blogsInDb,
  usersInDb
}