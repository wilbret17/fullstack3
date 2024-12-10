const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

if (!url) {
  console.error('Error: MONGODB_URI is not defined in the .env file')
  process.exit(1)
}

console.log('Connecting to MongoDB...')

mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    validate: {
      validator: (value) => /^\d{2,3}-\d{5,}$/.test(value),
      message: 'Number must be in the format XX-XXXXX or XXX-XXXXX',
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
