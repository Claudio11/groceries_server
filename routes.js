import express from 'express';

import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import routesHelper from './helpers/routes';

import ShoppingList from './models/shoppingList';
import Application from './models/application';
import Platform from './models/platform';
import Portfolio from './models/platform';
import User from './models/platform';

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


// Generic routes config.
let routesConfig = [{ key: 'platform', model: Platform, children: ''},
                   { key: 'application', model: Application, children: 'platforms owner'},
                   { key: 'portfolio', model: Portfolio, children: 'applications'},
                   { key: 'user', model: User, children: ''}];

routesHelper.setRoute(router);
routesHelper.addGenericRoutes(routesConfig);

export default router;
