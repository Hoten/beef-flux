"use strict";
var config_1 = require("./component/config");
/**
 * Will match a given url to a route, and execute a function/callback defined
 * for that route. Will also parse the URL for different parameters and
 * pass that into the callback if found
 */
var RoutingServiceClass = (function () {
    function RoutingServiceClass() {
    }
    RoutingServiceClass.prototype.onRouteFinished = function () {
    };
    RoutingServiceClass.prototype.routes = function (routes) {
        this.routingConfig = new config_1.RoutingConfig(routes);
        return this;
    };
    RoutingServiceClass.prototype.route = function (url, data) {
        var isRoute = this.routingConfig.isRoute(url);
        if (!isRoute) {
            url = '/';
        }
        if (this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.callRoute(url, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        return null;
    };
    RoutingServiceClass.prototype.handleRequest = function (url, request, response, data) {
        var isRoute = this.routingConfig.isRoute(url);
        if (!isRoute) {
            url = 'default:/';
        }
        if (this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.handleRequest(url, request, response, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        return null;
    };
    RoutingServiceClass.prototype.doRouting = function (url, request, response) {
        if (url === void 0) { url = null; }
        if (request === void 0) { request = null; }
        if (response === void 0) { response = null; }
        var matchRoute = '';
        for (var rawRoute in this.routingConfig.routes) {
            matchRoute = rawRoute;
            var rawHash = url ? url : window.location.hash;
            if (rawHash.indexOf('?') >= 0) {
                rawHash = rawHash.substring(0, rawHash.indexOf('?'));
            }
            var res = rawRoute.match(/\{[a-z\_\-\+]+\}/gi);
            var data = {};
            if (res !== null) {
                var routeParts = rawRoute.split('/');
                var hashParts = rawHash.split('/');
                if (routeParts[0].length === 0) {
                    routeParts = routeParts.splice(1, routeParts.length - 1);
                }
                if (hashParts[0].length === 0) {
                    hashParts = hashParts.splice(1, hashParts.length - 1);
                }
                if (hashParts.length !== routeParts.length) {
                    continue;
                }
                var i = 0;
                var bError = false;
                hashParts.forEach(function (part) {
                    if (!routeParts[i].match(/\{[a-z\_\-\+]+\}/gi)) {
                        if (part !== routeParts[i]) {
                            bError = true;
                        }
                    }
                    i++;
                });
                if (bError) {
                    continue;
                }
                //reset the match route for regex
                matchRoute = '';
                routeParts.forEach(function (part, index) {
                    if (index > 0) {
                        matchRoute += '/';
                    }
                    matchRoute += hashParts[index];
                    if (index > 0) {
                        data[part.replace(/[\{\}]/gi, '')] = hashParts[index];
                    }
                });
            }
            matchRoute = matchRoute.replace('+', '\\+');
            var regex = new RegExp('^[#\/]*' + matchRoute + '$', 'gi');
            if (rawHash.match(regex) !== null) {
                if (this.activeRoute === rawRoute && data === this.routeData) {
                    return; //already active
                }
                this.routeData = data;
                this.activeRoute = rawRoute;
                if (request) {
                    return this.handleRequest(rawRoute, request, response, data);
                }
                return this.route(rawRoute, data);
            }
        }
        if (request) {
            return this.handleRequest('default:/', request, response, {});
        }
        return this.route('/', {}); //default route
    };
    return RoutingServiceClass;
}());
exports.RoutingServiceClass = RoutingServiceClass;
var RoutingService = new RoutingServiceClass();
exports.RoutingService = RoutingService;
