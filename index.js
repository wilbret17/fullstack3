const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

const app = express()

const allowedOrigins = [
  'http://localhost:3001',
  'https://fullstack3-1.onrender.com'
]

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      console.log(`Allowing CORS for origin: ${origin}`)
      callback(null, true)
    } else {
      console.log(`Blocking CORS for origin: ${origin}`)
      callback(new Error('CORS not allowed'), false)
    }
  },
}))

morgan.token('post-data', (req) => (req.method === 'POST' ? JSON.stringify(req.body) : ''))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.use(express.json())

app.use(express.static(path.join(__dirname, 'new_dist')))

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then((persons) => res.json(persons))
    .catch(() => res.status(500).send({ error: 'Failed to fetch persons' }))
})

app.get('/info', (req, res) => {
  Person.countDocuments({})
    .then((count) => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(() => res.status(500).send({ error: 'Failed to fetch info' }))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' })
  }

  Person.findOne({ name }).then((existingPerson) => {
    if (existingPerson) {
      return res.status(400).json({ error: 'Name must be unique' })
    }

    const person = new Person({ name, number })
    person
      .save()
      .then((savedPerson) => res.status(201).json(savedPerson))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(400).json({ error: err.message })
        }
        console.error('Error saving person:', err)
        res.status(500).send({ error: 'Failed to save person' })
      })
  })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) {
        res.status(204).end()
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'new_dist', 'index.html'))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
