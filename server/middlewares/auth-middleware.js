module.exports.auth = function(authService) {
    return function(req, res, next) {
        // -- get the token from the response
        var headerToken = req.header('Authorization');
        if (headerToken) {
            var parts = headerToken.split(" ");

            if (parts[0] == 'Bearer') {
                authService.isAuthenticated(parts[1])
                    .then(function(response) {
                        if (response.authenticated === true) {
                            req.user = response.user;
                            req.token = parts[1];
                        }

                        return next();
                    });
            } else return next();
        } else return next();
    };
};