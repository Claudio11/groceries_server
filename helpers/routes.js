let router;

// Creates the object to pass (to find method) to make a contain search, instead of an exact match.
let constructContainsFieldFromQuery = (query) => {
    let containsQueryObject = {};
    for (let i in query) {
        containsQueryObject[i] = { "$regex": query[i], "$options": "i" };
    }
    return containsQueryObject;
}

// Creates list routes from the given parameter configuration.
let addGenericListRoutes = (routeData) => {
    router.get(`/${routeData.key}`, function (req, res) {
      routeData.model.find(constructContainsFieldFromQuery(req.query)).populate(routeData.children)
          .exec(function (err, list) {
              let resp = { data: list };
              res.send(resp);
          });
    });
}

// Creates item route from the given parameter configuration.
let addGenericItemRoutes = (routeData) => {
    router.get(`/${routeData.key}/:id`, function (req, res, next){
        routeData.model.findOne({_id: req.params.id}).populate(routeData.children)
            .exec(function (err, item) {
                let resp = { data: item };
                res.send(resp);
            });
    });
}

let addUpdateRoutes = (routeData) => {
    router.put(`/${routeData.key}/:id`, function (req, res) {
        routeData.model.findOneAndUpdate( { _id: req.params.id }, req.body, { new: true }, function (err, doc) {
            res.json({data: doc});
        });
    });
}

let addInsertRoutes = (routeData) => {
    router.post(`/${routeData.key}`, function (req, res, next) {
        var item = new routeData.model(req.body);
        item.save(function(err) {
            if (err) {
                return next(err);
            } else {
                res.json({data: item});
            }
        });
    });
}

let addDeleteRoutes = (routeData) => {
    router.delete(`/${routeData.key}/:id`, function (req, res, next) {
        routeData.model.remove( { _id: req.params.id }, function (err) {
            if (err) {
                return next(err);
            }
            else {
                res.send(res);
            }
        });
    });
}

let addChildrenGetRoutes = (routeData) => {
    let childrenArray = (routeData && routeData.children) ? routeData.children.split(' ') : [];
    for (let i in childrenArray) {
        let child = childrenArray[i];
        router.get(`/${routeData.key}/:id/${child}`, function (req, res, next) {
            routeData.model.findOne({ _id: req.params.id } ).populate(child)
              .exec(function (err, item) {
                  let data = { data: [] };
                  if (err) {
                      return next(err);
                  }
                  if (item) {
                      data = { data: item[child] };
                  }
                  res.send(data);
              });
        });
    }
}

let routesHelper = {
    addGenericRoutes (routesData) {
        for (let i in routesData) {
            let routeData = routesData[i];
            if (routeData) {
                addGenericListRoutes(routeData);
                addGenericItemRoutes(routeData);
                addUpdateRoutes(routeData);
                addInsertRoutes(routeData);
                addDeleteRoutes(routeData);
                addChildrenGetRoutes(routeData);
            }
        }
    },

    setRouter (r) {
        router = r;
    }
}

export default routesHelper;
