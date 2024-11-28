const mongoose = require('mongoose');
require('dotenv').config();

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const args = process.argv;

if (args.length < 3) {
  console.log('Usage: node mongo.js <password> [<name> <number>]');
  process.exit(1);
}

const password = args[2];
const name = args[3];
const number = args[4];

const url = process.env.MONGODB_URI;

console.log("MongoDB URI:", url); 

mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
    
    if (args.length === 3) {
      Person.find({})
        .then((result) => {
          console.log('phonebook:');
          result.forEach((person) => console.log(`${person.name} ${person.number}`));
          mongoose.connection.close(); 
        })
        .catch((err) => {
          console.error('Error fetching data:', err);
          mongoose.connection.close(); 
        });
    } else if (args.length === 5) {
      const person = new Person({ name, number });
      person.save()
        .then(() => {
          console.log(`Added ${name} number ${number} to phonebook`);
          mongoose.connection.close(); 
        })
        .catch((err) => {
          console.error('Error saving person:', err);
          mongoose.connection.close(); 
        });
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
