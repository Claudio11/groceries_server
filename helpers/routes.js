let router;

// Creates list routes from the given parameter configuration.
let addGenericListRoutes = (routeData) => {
    router.get(`/${routeData.key}`, function (req, res) {
      routeData.model.find({}).populate(routeData.children)
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

let routesHelper = {
    addGenericRoutes (routesData) {
        for (let i in routesData) {
            let routeData = routesData[i];
            if (routeData) {
                addGenericListRoutes(routeData);
                addGenericItemRoutes(routeData);
                addUpdateRoutes(routeData);
            }
        }
    },

    setRouter (r) {
        router = r;
    }
}

export default routesHelper;
