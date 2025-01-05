const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

/* 
Even though the _id property of Mongoose objects looks like a string, it is in fact an object. 
The toJSON method we defined transforms it into a string just to be safe. 
If we didn't make this change, it would cause more harm to us 
in the future once we start writing tests.
*/

blogSchema.set('toJSON', {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject._id
  }
})

module.exports = mongoose.model('Blog', blogSchema)