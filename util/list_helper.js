const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  // when blogs is empty
  if (blogs.length === 0) {
    return 0
  }
  return blogs.map(blog => blog.likes).reduce((sum, item) => sum + item, 0)
}

const favorateBlog = (blogs) => {
  // when blogs is empty
  if (blogs.length === 0) {
    return {}
  }
  const mostLiked = blogs.reduce((mostLiked, item) => (item.likes > mostLiked.likes ? item : mostLiked))
  return { title: mostLiked.title, author: mostLiked.author, likes: mostLiked.likes }
}

const mostBlogs = (blogs) => {
  // when blogs is empty
  if (blogs.length === 0) {
    return {}
  }
  const groupedByAuthor = _.groupBy(blogs, 'author')

  const authorsBlogCounts = _.map(groupedByAuthor, (value, key) => ({
    author: key,
    blogs: value.length,
  }))

  return _.maxBy(authorsBlogCounts, 'blogs')
}

const mostLiked = (blogs) => {
  // when blogs is empty
  if (blogs.length === 0) {
    return {}
  }

  const groupedByAuthor = _.groupBy(blogs, 'author')

  const authorsLikesCounts = _.map(groupedByAuthor, (blogs, author) => ({
    author,
    likes: _.sumBy(blogs, 'likes'),
  }));

  return _.maxBy(authorsLikesCounts, 'likes');



  return
}

module.exports = {
  dummy,
  totalLikes,
  favorateBlog,
  mostBlogs,
  mostLiked
}