import express from 'express';

import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import routesHelper from './helpers/routes';

import Application from './models/application';
import Platform from './models/platform';
import Portfolio from './models/portfolio';
import User from './models/user';

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
let routesConfig = [{ key: 'platforms', model: Platform, children: ''},
                    { key: 'applications', model: Application, children: 'platforms owner'},
                    { key: 'portfolios', model: Portfolio, children: 'applications'},
                    { key: 'users', model: User, children: ''}];

routesHelper.setRouter(router);
routesHelper.addGenericRoutes(routesConfig);



router.put('/users/:id', function (req, res) {
  User.findOneAndUpdate( {_id: req.params.id}, req.body, { new: true }, function (err, doc) {
    res.json({data: doc});
  });
});

export default router;
