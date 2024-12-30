const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
      "title": "My first blog",
      "author": "vetikke",
      "url": "first-blog",
      "likes": 55
  },
  {
      "title": "My 2nd blog",
      "author": "ikjevet",
      "url": "second-blog",
      "likes": 0
  },
  {
      "title": "My 3rd blog",
      "author": "ikkevet",
      "url": "third-blog",
      "likes": 20
  }
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
  blogsInDb,
  usersInDb
}