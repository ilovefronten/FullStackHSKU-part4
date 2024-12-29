const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

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
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (error) {
    console.error(error.message)
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const newBlog = request.body

  if (!newBlog.title || !newBlog.url) {
    return response.status(400).json(`Blog title or url missing`)
  }

  if (!request.body.likes) {
    request.body.likes = 0
  }


  const blog = new Blog(request.body)

  try {
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    response.status(400).json(`error: ${error}`)
  }

})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const removedBlog = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).send(`removed`)
  } catch (error) {   
    next(error)   
  }
  
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, {new: true})
    response.json(updateBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter

