let router;

// Creates the object to pass to make a contain search, instead of an exact match.
let constructContainsFieldFromQuery = (query) => {
    //{ "authors": { "$regex": "Alex", "$options": "i" } }
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
                res.json(item);
            }
        });
    });
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
            }
        }
    },

    setRouter (r) {
        router = r;
    }
}

export default routesHelper;
