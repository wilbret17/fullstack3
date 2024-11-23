const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const persons = [
    { id: "1", name: "Arto Hellas", number: "040-123456" },
    { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
    { id: "3", name: "Dan Abramov", number: "12-43-234345" },
    { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" },
];

app.get('/api/persons', (req, res) => {
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


app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id);
    
  
    if (person) {
      response.json(person);
    } else {
      response.status(404).send({error: 'Person not found'});
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const personIndex = persons.findIndex(p => p.id === id);
  
    if (personIndex !== -1) {
        persons.splice(personIndex, 1);
        response.status(204).end();
    } else {
      return response.status(404).json({ error: 'Person not found' });
    }
});

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: 'Name and number are required' });
    }

    const id = Math.random().toString(36).substr(2, 9); 

    const newPerson = {
        id,
        name,
        number
    };

    persons.push(newPerson);

    res.status(201).json(newPerson);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
