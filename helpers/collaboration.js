import uuid from 'node-uuid';

import Annotation from '../models/annotation';

let currentHash;
let currentLockHash;
let lockedAnnotations = {};

let setCurrentHash = () => {
  currentHash = uuid.v1();
  return currentHash;
}

let setCurrentLockHash = () => {
  currentLockHash = uuid.v1();
  return currentLockHash;
}

/**
 *  When a client sends an outdated hash, server emits this to it to let him
 *  know the current hash.
 *
 *  @param Client that sent the outdated hash.
 */
let sendCurrentHashOnInvalid = (client) => {
  client.emit('annotation-hash-invalid', { latestHash: currentHash });
}

/**
 *  When a client sends an outdated lock hash, server emits this to it to let him
 *  know the current hash.
 *
 *  @param Client that sent the outdated hash.
 */
let sendCurrentLockHashOnInvalid = (client) => {
  client.emit('annotation-lock-hash-invalid', { latestHash: currentLockHash });
}

/**
 *  Creates the annotations data (also current hash).
 *
 *  @return Annotations and current hash data { annotations: <annotations[]>,
 *  currentHash: <currentHash> }.
 */
let createAnnotationsResponse = () => {
  return new Promise((resolve, reject) => {
    Annotation.find({}).populate('author').exec(function (err, list) {
      if (err) {
        reject({ success: false, error: err, annotations: list });
      }
      else {
        resolve({ success: true, annotations: list, currentHash: setCurrentHash() });
      }
    });
  });
}

let sendError = (client, err) => {
  client.emit('annotation-error', err);
}

/**
 *  Sends the object with locked annotations.
 */
let sendLockedAnnotations = (io) => {
  io.in('collaboration').emit('remote-annotations-lock', { lockedAnnotations: lockedAnnotations, currentLockHash: currentLockHash });
}

/**
 * Checks if a given annotation is already locked or annotId
 * @param {string} annotId id of the annotation
 */
let isAnnotationLocked = (annotId) => {
  return typeof lockedAnnotations[annotId] !== 'undefined';
}

/**
 * Adds given annotation to the locked annotation map, saving the user id as value
 * @param {string} annotationId
 * @param {string} clientId  
 */
let lockAnnotation = (annotationId, clientId) => {
  lockedAnnotations[annotationId] = clientId;
  setCurrentLockHash();
}

/**
 * Removes a given annotation from the locked annotation map
 * @param {string} annotId 
 */
let unlockAnnotation = (annotId) => {
  delete lockedAnnotations[annotId];
  setCurrentLockHash();
}

setCurrentHash();

let annotationsHelper = {

  bindAnnotationsClientEvents: (io, client) => {
    // emit initial list and hash
    createAnnotationsResponse().then(data => {
      io.in('collaboration').emit('remote-annotations', data);
    });

    sendLockedAnnotations(io);

    // Client created a new annotation.
    client.on('local-annotation-create', function (data) {
      if (data.currentHash === currentHash) {
        let item = new Annotation(data.annotation);
        item.save((err) => {
          if (err) {
            sendError(client, err);
          }
          else {
            createAnnotationsResponse().then(data => {
              io.in('collaboration').emit('remote-annotations', data);
            });
          }
        });
      }
      else {
        sendCurrentHashOnInvalid(client);
      }
    });

    // Client edited an annotation.
    client.on('local-annotation-edit', function (data) {
      if (data.currentHash === currentHash) {
        let item = new Annotation(data.annotation);
        item.update({ _id: item.id }, function (err) {
          if (err) {
            sendError(client, err);
          } else {
            createAnnotationsResponse().then(data => {
              io.in('collaboration').emit('remote-annotations', data);
            });
          }
        });
      }
      else {
        sendCurrentHashOnInvalid(client);
      }
    });

    // Client deleted an annotation.
    client.on('local-annotation-delete', function (data) {
      if (data.currentHash === currentHash) {
        Annotation.remove({ _id: data.annotation.id }, function (err) {
          if (err) {
            sendError(client, err);
          }
          else {
            createAnnotationsResponse().then(data => {
              io.in('collaboration').emit('remote-annotations', data);
            });
          }
        });
      }
      else {
        sendCurrentHashOnInvalid(client);
      }
    });

    // Client locked an annotation.
    client.on('local-annotation-lock', function (data) {
      if (data.currentLockHash === currentLockHash) {
        if (isAnnotationLocked(data.annotation.id)) {
          sendError(client, { message: 'Annotation already locked' });
        } else {
          lockAnnotation(data.annotation.id, client.id);
          sendLockedAnnotations(io);
        }
      }
      else {
        sendCurrentLockHashOnInvalid(client);
      }
    });

    // Client unlocked an annotation.
    client.on('local-annotation-unlock', function (data) {
      if (data.currentLockHash === currentLockHash) {
        if (isAnnotationLocked(data.annotation.id)) {
          unlockAnnotation(data.annotation.id);
          sendLockedAnnotations(io);
        }
      }
      else {
        sendCurrentLockHashOnInvalid(client);
      }
    });

    // client.on('disconnect', function(client){
    //   io.in('collaboration').emit('client-disconnected', {clientId: client.id});
    // });
  }

  // bindAnnotations: (app) => {

  //   let server = require('http').createServer(app);
  //   let io = require('socket.io')(server);

  //   io.on('connection', function(client){
  //     console.log('#N2', client.id)

  //     client.join('collaboration');
  //     client.emit('set-id', { clientId: client.id });



  //   });
  // }

}

export default annotationsHelper;
