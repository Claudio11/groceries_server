let router;
let routesMetadata; // Metadata of the routes.

// TODO: Normalize method names.
// TODO: Recursively populate children, grand children, etc.

// Creates the object to pass (to find method) to make a contain search, instead of an exact match.
let constructContainsFieldFromQuery = (query) => {
    let containsQueryObject = {};
    for (let i in query) {
        containsQueryObject[i] = { "$regex": query[i], "$options": "i" };
    }
    return containsQueryObject;
}

// Obtains the route metadata for a given model (string)
let getRouteMetadata = (parent) => {
  let parentMetadata;
  for (let i in routesMetadata) {
      if (parent === routesMetadata[i].key) {
          parentMetadata = routesMetadata[i];
          break;
      }
  }
  return parentMetadata;
}

// Obtains the children of a given model (string)
let getChildren = (parent) => {
  let grandChildren = [];
  let routeMetadata = getRouteMetadata(parent);

  if  (routeMetadata && routeMetadata.children) {
      grandChildren = routeMetadata.children.split(' ');
  }
  return grandChildren;
}

// Generate the "populate" object for the given parent.
let generatePopulateConfig = (parent) => {
  let children = getChildren(parent);
  let populateConfig = [];
  for (let i in children) {
    populateConfig.push({path: children[i]});
  }
  return populateConfig;
}

/**
 *  Retrieves or saves (if it doesn't exist) a child to the db, then it executes
 *  the success or fail callback.
 *
 *  @param childData Data of the child to be added.
 *  @param childMetadata Child metadata.
 *  @param successCb Callback to be called on success.
 *  @param failureCb Callback to be called on failure.
 */
let retrieveChildRecord = (childData, childMetadata, successCb, failureCb) => {
    console.dir(childData);
    if (childData.id) { // Existing child record
        childMetadata.model.findOne( { _id: childData.id }, function (err, doc) {
            if (err) {
                failureCb(err);
            }
            else {
                successCb(doc);
            }
        });
    }
    else {
        let newChild = new childMetadata.model(childData);
        newChild.save(function(err) {
            if (err) {
                failureCb(err);
            } else {
                successCb(newChild);
            }
        });
    }
}


/* ROUTES GENERATION */

// Creates list routes from the given parameter configuration.
let addGenericListRoutes = (routeData) => {
    router.get(`/${routeData.key}`, function (req, res) {
      routeData.model.find(constructContainsFieldFromQuery(req.query)).populate(routeData.children)
          .exec(function (err, list) {
              if (err) {
                  res.send(err);
              }
              else {
                  let resp = { data: list };
                  res.send(resp);
              }
          });
    });
}

// Creates item route from the given parameter configuration.
let addGenericItemRoutes = (routeData) => {
    router.get(`/${routeData.key}/:id`, function (req, res, next){
        routeData.model.findOne({_id: req.params.id}).populate(routeData.children)
            .exec(function (err, item) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    let resp = { data: item };
                    res.send(resp);
                }
            });
    });
}

// Creates item PUT routes.
let addUpdateRoutes = (routeData) => {
    router.put(`/${routeData.key}/:id`, function (req, res) {
        routeData.model.findOneAndUpdate( { _id: req.params.id }, req.body, { new: true }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.json({data: doc});
            }
        });
    });
}

// Creates item POST routes.
let addInsertRoutes = (routeData) => {
    router.post(`/${routeData.key}`, function (req, res, next) {
        var item = new routeData.model(req.body);
        item.save(function(err) {
            if (err) {
                res.send(err);
            }
            else {
              routeData.model.findOne({ _id: item._id })
                .populate(routeData.children).exec(function (err, pItem) {
                    let data = { data: {} };
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if (pItem) {
                            data = { data: pItem };
                            res.send(data);
                        }
                        else {
                            res.status(404).send({'message': 'Record not found'});
                        }
                    }
                });
            }
        });
    });
}
// Creates item DELETE routes.
let addDeleteRoutes = (routeData) => {
    router.delete(`/${routeData.key}/:id`, function (req, res, next) {
        routeData.model.remove( { _id: req.params.id }, function (err) {
            if (err) {
                res.send(err);
            }
            else {
                res.status(200).send({'message': 'Entity deleted correctly'});
            }
        });
    });
}

// Creates the routes to access children of an entity in a restful way.
let addChildrenGetRoutes = (routeData) => {
    let childrenArray = (routeData && routeData.children) ? routeData.children.split(' ') : [];
    for (let i in childrenArray) {
        let child = childrenArray[i];
        router.get(`/${routeData.key}/:id/${child}`, function (req, res, next) {
            routeData.model.findOne({ _id: req.params.id })
              .populate({
                  path: child,
                  match: constructContainsFieldFromQuery(req.query),
                  populate: generatePopulateConfig(child)
              })
              .exec(function (err, item) {
                  let data = { data: [] };
                  if (err) {
                      res.status(500).send(err);
                  }
                  else {
                      if (item) {
                          data = { data: item[child] };
                          res.send(data);
                      }
                      else {
                          res.status(404).send({'message': 'Record not found'});
                      }
                  }
              });
        });
    }
}



// Creates the routes to access an specific child of an entity in a restful way.
let addChildrenGetRecordRoutes = (routeData) => {
    let childrenArray = (routeData && routeData.children) ? routeData.children.split(' ') : [];
    for (let i in childrenArray) {
        let child = childrenArray[i];
        router.get(`/${routeData.key}/:id/${child}/:childId`, function (req, res, next) {
          routeData.model.findOne({ _id: req.params.id })
              .populate({
                  path: child,
                  match: { _id: req.params.childId },
                  populate: generatePopulateConfig(child)
              })
              .exec(function (err, item) {
                  let data = { data: {} };
                  if (err) {
                      res.send(err);
                  }
                  else {
                      if (item && item[child] && item[child].length) {
                          data = { data: item[child][0] };
                          res.send(data);
                      }
                      else {
                          res.status(404).send({'message': 'Record not found'});
                      }
                  }
              });
        });
    }
}

// Creates item POST routes.
let addPostForChildrenRoutes = (routeData) => {
    let childrenArray = (routeData && routeData.children) ? routeData.children.split(' ') : [];
    for (let i in childrenArray) {
        let child = childrenArray[i];
        router.post(`/${routeData.key}/:id/${child}`, function (req, res, next) {
          routeData.model.findOne({_id: req.params.id}).populate(child)
            .exec(function (err, parent) {
                let parentModel = new routeData.model(parent);
                let childMetadata = getRouteMetadata(child);
                if (parentModel[child]) {
                    retrieveChildRecord(req.body, childMetadata, function (newChild) {
                        if (Array.isArray(parentModel[child])) {
                            parentModel[child].push(newChild);
                        }
                        else {
                            parentModel[child] = newChild;
                        }
                        parentModel.save(function(err) {
                            if (err) {
                                res.send(err);
                            } else {
                                childMetadata.model.findOne({ _id: newChild._id })
                                  .populate(childMetadata.children).exec(function (err, item) {
                                      let data = { data: {} };
                                      if (err) {
                                          res.send(err);
                                      }
                                      else {
                                          if (item) {
                                              data = { data: item };
                                              res.send(data);
                                          }
                                          else {
                                              res.status(404).send({'message': 'Record not found'});
                                          }
                                      }
                                  });
                            }
                        });
                    }, function (err) {
                        res.send(err); // Error cb.
                    });
                }
                else {
                    res.status(404).send({'error': 'Child attribute not found'});
                }
            });

        });
    }
}

// Delete for children.
let addDeleteForChildrenRoutes = (routeData) => {
    let childrenArray = (routeData && routeData.children) ? routeData.children.split(' ') : [];
    for (let i in childrenArray) {
        let child = childrenArray[i];
        let childMetadata = getRouteMetadata(child);
        router.delete(`/${routeData.key}/:id/${child}/:childId`, function (req, res, next) {
            routeData.model.findOne({_id: req.params.id}).populate(routeData.children)
                .exec(function (err, item) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        let parentModel = new routeData.model(item);
                        let children = parentModel[child];
                        let childrenChanged = false;
                        for (let i in children) {
                            if (children[i].id === req.params.childId) {
                                children.splice(i, 1);
                                childrenChanged = true;
                                break;
                            }
                        }

                        if (childrenChanged) {
                            routeData.model.findOneAndUpdate( { _id: req.params.id }, parentModel, { new: true }, function (err, doc) {
                                if (err) {
                                    res.status(405).send(err);
                                }
                                else {
                                    res.status(200).send({data: doc, message: 'Child deleted correctly'});
                                }
                            });
                        }
                        else {
                            res.status(404).send(err);
                        }
                    }
                });
        });
    }
}

let routesHelper = {
    addGenericRoutes (routesData) {
        routesMetadata = routesData;
        for (let i in routesData) {
            let routeData = routesData[i];
            if (routeData) {
                addGenericListRoutes(routeData);
                addGenericItemRoutes(routeData);
                addUpdateRoutes(routeData);
                addInsertRoutes(routeData);
                addDeleteRoutes(routeData);
                addChildrenGetRoutes(routeData);
                addChildrenGetRecordRoutes(routeData);
                addPostForChildrenRoutes(routeData);
                addDeleteForChildrenRoutes(routeData);
            }
        }
    },

    setRouter (r) {
        router = r;
    }
}

export default routesHelper;
