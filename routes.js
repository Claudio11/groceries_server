import express from 'express';
import AdmZip from 'adm-zip';
import uuid from 'node-uuid';

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
           res.send({ data: JSON.parse(zipEntry.getData().toString('utf8'))  });
      }
  });
});

router.post('/applications/:id/v', function (req, res, next) {
    var zip = new AdmZip("./myzip.zip"); // TODO: Replace by uploaded file.
    var zipEntries = zip.getEntries();

    zipEntries.forEach(function(zipEntry) {
        if (zipEntry.entryName == "myzip/manifest.json") {
             Application.findOne({_id: req.params.id}).populate('platforms owner collaborators v')
                 .exec(function (err, item) {
                     if (err) {
                         res.status(500).send(err);
                     }
                     else {
                         let newAppVersion = {
                                               name: req.body.name,
                                               manifest: JSON.parse(zipEntry.getData().toString('utf8')),
                                               id: uuid.v1()
                                              };
                         let app = new Application(item);
                         app.versions.push(newAppVersion);
                         app.save(function (err) {
                            if (err) {
                              res.status(500).send(err);
                            }
                            else {
                                res.send({ data: newAppVersion });
                            }
                         })

                     }
                 });
        }
    });
});

router.get('/applications/:id/v/:versionId', function (req, res, next) {

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
