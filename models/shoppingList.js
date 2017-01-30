import mongoose from 'mongoose';

import Item from './items';

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

  'tasks': [{
        quantity: Number,
        active: Boolean,
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }
    }]
});

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

export default ShoppingList;
