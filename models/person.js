const mongoose = require('mongoose');
require('dotenv').config(); 

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

if (!url) {
  console.error('Error: MONGODB_URI is not defined in the .env file');
  process.exit(1);
}

console.log('Connecting to', url);

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); 
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
