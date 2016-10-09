import mongoose from 'mongoose';

const shoppingListSchema = new mongoose.Schema({
  'name': {
    'type': String,
    'unique': true,
    'required': true
  },

  'description': {
    'type': String,
    'required': true
  },

  'tasks': {
    'type': Array,
    'default': []
  }
});

const ShoppingList = mongoose.model('shoppingLists', shoppingListSchema);

export default ShoppingList;
