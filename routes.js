import express from 'express';
import AdmZip from 'adm-zip';
import uuid from 'node-uuid';
import multer from 'multer';

import ensureAuth from './passport/ensure-authenticated';
import authHandler from './handlers/auth-handlers';
import emailHandler from './handlers/email-handlers';
import routesHelper from './helpers/routes';

import Application from './models/application';
import Platform from './models/platform';
import Portfolio from './models/portfolio';
import User from './models/user';
import Microservice from './models/microservice';
import StreamEvent from './models/stream-event';
import Annotation from './models/annotation';

let upload = multer({ dest: 'uploads/' });
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


// TODO: Remove after demo.
let hostedUrls = ['http://adf-sandbox.altimetrik.com:4444/web/strykerLifeHacksDemo/', 'http://adf-sandbox.altimetrik.com:4444/web/strykerLifeHacksDemoV1/', 'http://adf-sandbox.altimetrik.com:4444/web/strykerLifeHacksDemoV2/'];
let indexHostedUrl = 0;

let getNextHostedUrl = function () {
    indexHostedUrl++;
    if (indexHostedUrl >= hostedUrls.length) {
        indexHostedUrl = 0;
    }
    return hostedUrls[indexHostedUrl];
}

router.post('/applications/:id/v', upload.single('file'),  function (req, res, next) {
    if (!req.file) {
      res.status(400).send({message: 'No uploaded files'});
    }
    else {
        if (req.file.mimetype === 'application/zip' || req.file.mimetype === 'application/octet-stream' || req.file.mimetype === 'application/x-zip-compressed') {
            console.dir(req.file)
            var zip = new AdmZip(req.file.path);
            var zipEntries = zip.getEntries();

            var folderName = (req.file.originalname) ? req.file.originalname.replace(/\.zip$/,''): '';
            let manifest;

            zipEntries.forEach(function(zipEntry) {
                if (zipEntry.entryName === `${folderName}/manifest.json`) {
                    manifest = JSON.parse(zipEntry.getData().toString('utf8'));
                }
                else if (zipEntry.entryName === `${folderName}/Screens/`) {
                    zip.extractEntryTo(`${folderName}/Screens/`, `uploads/${folderName}/Screens/`, false, true);
                }
            });

            if (manifest) {
               Application.findOne({_id: req.params.id}).populate('platforms owner collaborators')
                   .exec(function (err, item) {
                       if (err) {
                           return res.status(500).send(err);
                       }
                       else {
                           let currentHostedUrl = getNextHostedUrl();
                           let newAppVersion = {
                                                 name: folderName,
                                                 manifest: manifest,
                                                 id: uuid.v1(),
                                                 hostedUrl: currentHostedUrl
                                                };
                           let app = new Application(item);
                           app.versions.push(newAppVersion);
                           app.save(function (err) {
                              if (err) {
                                  return res.status(500).send(err);
                              }
                              else {
                                  let newStreamEvent = new StreamEvent({
                                                                        type: 3,
                                                                        name: 'New app version created',
                                                                        date: new Date()
                                                                        });
                                  newStreamEvent.save(function (err) {
                                      if (err) {
                                          return res.status(500).send(err);
                                      }
                                      else {
                                          return res.send({ data: newAppVersion });
                                      }
                                  });

                              }
                           })

                       }
                   });
            }
            else {
                return res.status(400).send({message: 'No manifest file present'});
            }
        }
        else {
            return res.status(400).send({message: 'Only accepts files of type: "application/zip"'});
        }
    }
});


// Generic routes config.
let routesConfig = [{ key: 'platforms', model: Platform, children: ''},
                    { key: 'applications', model: Application, children: 'platforms owner collaborators'},
                    { key: 'portfolios', model: Portfolio, children: 'applications owner'},
                    { key: 'users', model: User, children: ''},
                    { key: 'microservices', model: Microservice, children: ''},
                    { key: 'stream-events', model: StreamEvent, children: 'user'},
                    { key: 'annotations', model: Annotation, children: 'author'}];

routesHelper.setRouter(router);
routesHelper.addGenericRoutes(routesConfig);


export default router;
