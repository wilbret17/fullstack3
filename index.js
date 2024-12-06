const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const Person = require('./models/person');

const app = express();


app.use(express.json());
const allowedOrigins = ['http://localhost:3000', 'https://full-stack-open-rbms.onrender.com'];

app.use(cors({
  origin: allowedOrigins
}));

morgan.token('post-data', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Phonebook API</h1>');
});

app.get('/api/persons', (req, res) => {
    Person.find({}).then((persons) => {
        res.json(persons);
    });
});


app.get('/info', (req, res) => {
    Person.countDocuments({})
        .then((count) => {
            const currentTime = new Date();
            res.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${currentTime}</p>
            `);
        })
        .catch((err) => res.status(500).send({ error: 'Could not fetch info' }));
});


app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).send({ error: 'Person not found' });
            }
        })
        .catch((err) => next(err));
});


app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.status(204).end();
            } else {
                res.status(404).send({ error: 'Person not found' });
            }
        })
        .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message);  
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
      return response.status(400).send({ error: 'validation error' });
    }
  
    next(error);
  };
  
app.use(errorHandler);
  
app.post('/api/persons', (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'Name and number are required' });
    }

    Person.findOne({ name }).then((existingPerson) => {
        if (existingPerson) {
            return res.status(400).json({ error: 'Name must be unique' });
        }

        const person = new Person({ name, number });
        person.save()
            .then((savedPerson) => res.status(201).json(savedPerson))
            .catch((err) => {
                if (err.name === 'ValidationError') {
                    return res.status(400).json({ error: err.message });
                }
                console.error('Error saving person:', err); 
                res.status(500).send({ error: 'Failed to save person' });
            }); 
    });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});