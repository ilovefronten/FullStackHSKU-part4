const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs, 
  blogsInDb
}