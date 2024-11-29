const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const Person = require('./models/person');

const app = express();


app.use(express.json());
app.use(cors());



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


app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).send({ error: 'Person not found' });
            }
        })
        .catch((err) => res.status(400).send({ error: 'Invalid ID format' }));
});


app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.status(204).end();
            } else {
                res.status(404).send({ error: 'Person not found' });
            }
        })
        .catch((err) => res.status(400).send({ error: 'Invalid ID format' }));
});

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
            .catch((err) => res.status(500).send({ error: 'Failed to save person' }));
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