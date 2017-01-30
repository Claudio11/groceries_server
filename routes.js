import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import express from 'express';

import ShoppingList from './models/shoppingList';
import Application from './models/application';
import Platform from './models/platform';

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
    Application.find({}).populate('platforms owner')
        .exec(function (err, apps) {
            res.send(apps);
        });
});

router.get('/application/:id', function (req, res, next){
    Application.findOne({_id: req.params.id}).populate('platforms owner')
        .exec(function (err, app) {
            res.send(app);
        });
});

router.get('/platform', function (req, res) {
    Platform.find({})
        .exec(function (err, platforms) {
            res.send(platforms);
        });
});

router.get('/platform/:id', function (req, res, next){
    Platform.findOne({_id: req.params.id})
        .exec(function (err, platform) {
            res.send(platform);
        });
});

export default router;
