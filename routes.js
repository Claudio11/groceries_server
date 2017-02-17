import express from 'express';
import AdmZip from 'adm-zip';

import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import routesHelper from './helpers/routes';

import Application from './models/application';
import Platform from './models/platform';
import Portfolio from './models/portfolio';
import User from './models/user';
import Microservice from './models/microservice';

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

router.get('/artboards/:id', function (req, res, next) {
  var zip = new AdmZip("./myzip.zip");
  var zipEntries = zip.getEntries(); // an array of ZipEntry records

  zipEntries.forEach(function(zipEntry) {
      console.log(zipEntry.toString()); // outputs zip entries information
      if (zipEntry.entryName == "myzip/manifest.json") {
           console.log(zipEntry.getData().toString('utf8'));
           res.send({ data: JSON.parse(zipEntry.getData().toString('utf8')) });
      }
  });
});



// Generic routes config.
let routesConfig = [{ key: 'platforms', model: Platform, children: ''},
                    { key: 'applications', model: Application, children: 'platforms owner collaborators'},
                    { key: 'portfolios', model: Portfolio, children: 'applications owner'},
                    { key: 'users', model: User, children: ''},
                    { key: 'microservices', model: Microservice, children: ''}];

routesHelper.setRouter(router);
routesHelper.addGenericRoutes(routesConfig);


export default router;
