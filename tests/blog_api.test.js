const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const _ = require('lodash')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))

  const blogArray = blogObjects.map(blog => blog.save())
  await Promise.all(blogArray)
})

const api = supertest(app)

test('get all blogs as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('test all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  //console.log(response.header);
  //console.log(response.body);

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('test all blogs have id property', async () => {
  const response = await api.get('/api/blogs')

  assert(response.body.every(blog => blog.hasOwnProperty('id')))
})

test('test post blog works', async () => {
  const newBlog = {
    'title': 'Test adding blog',
    'author': 'tester',
    'url': 'test-blog',
    'likes': 999
  }

  await api
    .post('/api/blogs',)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const lastIndex = response.body.length - 1

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

  // assert.deepStrictEqual(response.body[lastIndex], newBlog)
  assert.deepStrictEqual(response.body[lastIndex].title, newBlog.title)
  assert.deepStrictEqual(response.body[lastIndex].author, newBlog.author)
  assert.deepStrictEqual(response.body[lastIndex].url, newBlog.url)
  assert.deepStrictEqual(response.body[lastIndex].likes, newBlog.likes)
})

test('test if likes property is 0 when missing', async () => {
  const newBlogNoLike = {
    'title': 'Test adding blog',
    'author': 'tester',
    'url': 'test-blog'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlogNoLike)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  assert.strictEqual(response.body.likes, 0)
})

test('test 400 response when title missing', async () => {
  const newBlogNoTitle = {
    'author': 'tester',
    'url': 'test-blog-no-url'
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .expect(400)
})

test('test 400 response when title missing', async () => {
  const newBlogNoTitle = {
    'author': 'tester',
    'url': 'test-blog-no-url'
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .expect(400)

})

test('test 400 response when url missing', async () => {
  const newBlogNoUrl = {
    'title': 'Test adding blog no url',
    'author': 'tester',
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoUrl)
    .expect(400)
})


after(async () => {
  await mongoose.connection.close()
})