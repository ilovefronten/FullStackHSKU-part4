const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../util/middleware')

// 用了express的router后，这里的url从 “api/blogs” 变成了 “/”
// 这是因为在app.js里用中间件定义了根url
//```js
// const blogsRouter = require('./controllers/blogs')
// ...
// app.use('/api/blogs', blogsRouter)
//```

/* blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })  
}) */

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
  } catch (error) {
    console.error(error.message)
    response.status(404).end()
  }
})

// Handler of getting token from request
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const { title, url, likes } = request.body

  if (!title || !url) {
    return response.status(400).json(`Blog title or url missing`)
  }

  const user = await User.findById(request.user.id)

  if (!request.body.likes) {
    request.body.likes = 0
  }

  const blog = new Blog({
    title,
    url,
    likes,
    user,
    author: request.user.username,
  })

  try {
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(400).json(`error: ${error}`)
  }


})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const blog2Remove = await Blog.findById(request.params.id)

    if (!blog2Remove) {
      console.log('blog not in database');
      return response.status(204).end()
    }

    if (!decodedToken.id
      || !blog2Remove.user
      || blog2Remove.user.toString() !== decodedToken.id) {
      return response.status(401).json('invalid token')
    }

    const removedBlog = await Blog.findByIdAndDelete(request.params.id)

    // Remove the blog in user database
    const userBeforeRemove = await User.findById(decodedToken.id)
    const blogsAfterRemove = userBeforeRemove.blogs.filter(blogId => blog2Remove.id !== blogId.toString())
    //console.log(blogsAfterRemove);
    
    const userAfterRemove = {
      blogs: blogsAfterRemove,
    }
    //console.log(userAfterRemove);
    await User
      .findByIdAndUpdate(decodedToken.id, userAfterRemove, { new: true })

    response.status(204).send(`removed`)
    console.log('delete success')
  } catch (error) {
    next(error)
  }

})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
    response.json(updateBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter

