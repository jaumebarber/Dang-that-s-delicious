const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema
const slug = require('slugs')

const storeSchema = new Schema({
  name: { type: String, trim: true, required: 'Please enter a store name!' },
  slug: String,
  description: { type: String, trim: true },
  tags: [String]
})

storeSchema.pre('save', function(next) {
  if(!this.isModified('name')) {
    next()
    return
  }
  this.slug = slug(this.name)
  next()
})


module.exports = mongoose.model('Store', storeSchema)