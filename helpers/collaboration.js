import uuid from 'node-uuid';

import Annotation from '../models/annotation';

let currentHash;
let lockedAnnotations = {};

let setCurrentHash = () => {
  currentHash = uuid.v1();
  return currentHash;
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
 *  Creates the annotations data (also current hash).
 *
 *  @return Annotations and current hash data { annotations: <annotations[]>,
 *  currentHash: <currentHash> }.
 */
let createAnnotationsResponse = () => {
  Annotation.find({}).populate('author').exec(function (err, list) {
      if (err) {
          return { success: false, error: err, annotations: list };
      }
      else {
          return { success: true, annotations: list, currentHash: setCurrentHash() };
      }
  });
}

let sendError = (err) => {
  client.emit('annotation-error', err);
}

/**
 *  Sends the object with locked annotations.
 */
let sendLockedAnnotations = () => {
  return { lockedAnnotations: lockedAnnotations, currentHash: currentHash };
}

setCurrentHash();

let annotationsHelper = {

  bindAnnotations: (app) => {

    let server = require('http').createServer(app);
    let io = require('socket.io')(server);

    io.on('connection', function(client){
      console.log(client.id)

      client.join('collaboration');
      client.emit('set-id', { clientId: client.id });
      client.emit('annotation-current-hash', { currentHash: currentHash });

      // Client created a new annotation.
      client.on('local-annotation-create', function (data) {
        if (data.currentHash === currentHash) {
            let item = new Annotation(data.annotation);
            item.save((err) => {
              if (err) {
                sendError(err);
              }
              else {
                io.in('collaboration').emit('remote-annotations', createAnnotationsResponse());
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
            io.in('collaboration').emit('remote-annotations', createAnnotationsResponse());
        }
        else {
            sendCurrentHashOnInvalid(client);
        }
      });

      // Client deleted an annotation.
      client.on('local-annotation-delete', function (data) {
        if (data.currentHash === currentHash) {
          Annotation.remove( { _id: data.annotation.id }, function (err) {
              if (err) {
                  sendError(err);
              }
              else {
                  io.in('collaboration').emit('remote-annotations', createAnnotationsResponse());
              }
          });
        }
        else {
            sendCurrentHashOnInvalid(client);
        }
      });

      // Client locked an annotation.
      client.on('local-annotation-lock', function (data) {
        if (data.currentHash === currentHash) {
            let response = { lockedAnnotation: data.id, currentHash: setCurrentHash() };
            io.in('collaboration').emit('remote-annotations-lock', response);
        }
        else {
            sendCurrentHashOnInvalid(client);
        }
      });

      client.on('disconnect', function(client){
        io.in('collaboration').emit('client-disconnected', {clientId: client.id});
      });
    });
  }

}

export default annotationsHelper;
