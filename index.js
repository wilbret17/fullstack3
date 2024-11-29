const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');


morgan.token('post-data', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});
app.use(morgan('method :url :status :res[content-length] - :response-time ms :post-data'));


app.use(express.json());


app.use(cors());


const persons = [
    { id: "1", name: "Arto Hellas", number: "040-123456" },
    { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
    { id: "3", name: "Dan Abramov", number: "12-43-234345" },
    { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" },
];


app.get('/api/persons', (req, res) => {
    console.log(persons);
    res.json(persons);
});


app.get('/info', (req, res) => {
    const currentTime = new Date();
    const totalEntries = persons.length;
    res.send(`
        <p>Phonebook has info for ${totalEntries} people</p>
        <p>${currentTime}</p>
    `);
});


app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const person = persons.find(p => p.id === id);
    
    if (person) {
        res.json(person);
    } else {
        res.status(404).send({ error: 'Person not found' });
    }
});


app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const personIndex = persons.findIndex(p => p.id === id);

    if (personIndex !== -1) {
        persons.splice(personIndex, 1);
        res.status(204).end();
    } else {
        return res.status(404).json({ error: 'Person not found' });
    }
});


app.post('/api/persons', (req, res) => {
    const body = req.body;

    
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'Name and number are required' });
    }

    
    const existingPerson = persons.find(p => p.name === body.name);
    if (existingPerson) {
        return res.status(400).json({ error: 'Name must be unique' });
    }

    
    const newPerson = {
        id: Math.random().toString(36).substr(2, 9),
        name: body.name,
        number: body.number
    };

    persons.push(newPerson);

    
    res.status(201).json(newPerson);
});


app.use(express.static(path.join(__dirname, 'dist')));


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});