import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import express from 'express';

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


// Generic routes config.
let routesConfig = [{ key: 'platform', model: Platform, children: ''},
                   { key: 'application', model: Application, children: 'platforms owner'},
                   { key: 'portfolio', model: Portfolio, children: 'applications'},
                   { key: 'user', model: User, children: ''}];

// Creates list routes from the given configuration.
let addGenericListRoutes = (routesData) => {
    for (let i in routesData) {
        let routeData = routesData[i];
        router.get(`/${routeData.key}`, function (req, res) {
          routeData.model.find({}).populate('')
              .exec(function (err, list) {
                  res.send(list);
              });
        });
    }
}

// Creates item route from the given configuration.
let addGenericItemRoutes = (routesData) => {
    for (let i in routesData) {
        let routeData = routesData[i];
        router.get(`/${routeData.key}/:id`, function (req, res, next){
            routeData.model.findOne({_id: req.params.id})
                .exec(function (err, item) {
                    res.send(item);
                });
        });
    }
}

// Add generic routes from the configuration.
let addGenericRoutes = (routesData) => {
    addGenericListRoutes(routesData);
    addGenericItemRoutes(routesData);
}

addGenericRoutes(routesConfig);

export default router;
