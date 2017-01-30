import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import express from 'express';

import ShoppingList from './models/shoppingList';
import Application from './models/application';

let router = express.Router();

// Check if user is already logged-in
function checkIfLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

router.get('/api/register',
  checkIfLoggedIn,
  authHandler.getRegister);

router.post('/api/register',
  checkIfLoggedIn,
  authHandler.register);

router.get('/api/login',
  checkIfLoggedIn,
  authHandler.getLogin);

router.post('/api/login',
  checkIfLoggedIn,
  authHandler.login);

router.get('/api/logout',
  ensureAuth,
  authHandler.logout);

router.get('/api/forgot-password',
  checkIfLoggedIn,
  authHandler.getForgotPassword);

router.post('/api/send-new-password',
  checkIfLoggedIn,
  emailHandler.sendNewPassword);

router.get('/shoppingList', function (req, res) {
    ShoppingList.find({}).populate('tasks.item')
        .exec(function (err, shoppingList) {
            res.send(shoppingList);
        });
});

router.get('/shoppingList/:id', function (req, res, next){
    ShoppingList.findOne({_id: req.params.id}).populate('tasks.item')
        .exec(function (err, shoppingList) {
            res.send(shoppingList);
        });
});

router.get('/application', function (req, res) {
    Application.find({}).populate('platforms')
        .exec(function (err, apps) {
            res.send(apps);
        });
});

router.get('/application/:id', function (req, res, next){
    Application.findOne({_id: req.params.id}).populate('platforms')
        .exec(function (err, app) {
            res.send(app);
        });
});

export default router;
