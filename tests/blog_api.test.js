const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const { get } = require('lodash')

beforeEach(async () => {
  await User.deleteMany({})
  let users = []
  const initialUsers = await helper.initializeUsers()
  for (let index = 0; index < initialUsers.length; index++) {
    const user = new User(initialUsers[index])
    users = users.concat(user)
    await user.save()
  }

  await Blog.deleteMany({})
  for (let index = 0; index < helper.initialBlogs.length; index++) {
    const blog = new Blog({
      ...helper.initialBlogs[index],
      user: users[index]._id
    })
    await blog.save()
    //console.log(helper.initialBlogs[index].author);

    // update user

    users[index].blogs = users[index].blogs.concat(blog._id)
    // console.log(users[index]);
    await users[index].save()

  }

})

const api = supertest(app)

const USER_INDEX = 0
const getLoginInfoHelper = async () => {
  const userResult = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const user = userResult.body[USER_INDEX]
  const loginUserInfo = {
    username: user.username,
    password: helper.UserPassword[USER_INDEX]
  }

  const result = await api
    .post('/api/login')
    .send(loginUserInfo)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  return result.body
}


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
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  // post new blog
  const newBlog = {
    'title': 'Test adding blog',
    'author': loginInfo.username,
    'url': 'test-blog',
    'likes': 999
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', 'Bearer ' + loginInfo.token) // set token
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
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  // post new blog
  const newBlogNoLike = {
    'title': 'Test adding blog no like',
    'author': loginInfo.username,
    'url': 'test-blog',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlogNoLike)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('test 400 response when title missing', async () => {
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  const newBlogNoTitle = {
    'author': loginInfo.username,
    'url': 'test-blog-no-url'
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .expect(400)
})

test('test 400 response when url missing', async () => {
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  const newBlogNoUrl = {
    'title': 'Test adding blog no url',
    'author': loginInfo.username,
  }

  await api
    .post('/api/blogs')
    .send(newBlogNoUrl)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .expect(400)
})

test('test delete a blog', async () => {
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  const response = await api.get('/api/blogs')
  const removeId = response.body[0].id
  /* console.log(response.body[0]);
  console.log(loginInfo.token); */
  //const responseText = 
  await api
    .delete(`/api/blogs/${removeId}`)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .expect(204)

  //console.log(responseText);

  const blogsAfterRemove = (await api.get('/api/blogs')).body

  assert.strictEqual(blogsAfterRemove.length, response.body.length - 1)

  const blogsIdAfterRemove = blogsAfterRemove.map(blog => blog.id)

  assert(!blogsIdAfterRemove.includes(removeId))
})


test('test update a blog', async () => {
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  const oldBlog = (await api.get('/api/blogs')).body[0]
  const newBlog = {
    title: 'update title for the blog',
    likes: oldBlog.likes + 1,
    url: oldBlog.url,
    author: oldBlog.author
  }
  const updateId = oldBlog.id
  await api
    .put(`/api/blogs/${updateId}`)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .send(newBlog)
    .expect(200)

  const updatedBlog = (await api.get('/api/blogs')).body[0]

  assert.strictEqual(updatedBlog.likes, helper.initialBlogs[0].likes + 1)
  assert.strictEqual(updatedBlog.author, helper.initialBlogs[0].author)
  assert.strictEqual(updatedBlog.url, helper.initialBlogs[0].url)
  assert.strictEqual(updatedBlog.title, 'update title for the blog')
})

test('test update a blog with an unauthorized user', async () => {
  // get the token of the 1st user in database
  const loginInfo = await getLoginInfoHelper()

  // get the blog whose user is not the token user
  const oldBlog = (await api.get('/api/blogs')).body[1]
  const newBlog = {
    title: 'update title for the blog',
    likes: oldBlog.likes + 1,
    url: oldBlog.url,
    author: oldBlog.author
  }
  const updateId = oldBlog.id
  await api
    .put(`/api/blogs/${updateId}`)
    .set('Authorization', 'Bearer ' + loginInfo.token)
    .send(newBlog)
    .expect(401)
})

after(async () => {
  await mongoose.connection.close()
})