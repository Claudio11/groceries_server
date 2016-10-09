import mongoose from 'mongoose';

const itemsSchema = new mongoose.Schema({
  'description': {
    'type': String,
    'required': true
  }
});

const Items = mongoose.model('items', shoppingLisitemsSchematSchema);

export default Items;
