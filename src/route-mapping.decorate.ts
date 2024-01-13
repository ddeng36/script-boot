/**
 * @file Router mapping decorator
 * @description This file is used to map the router to the express application
 * 
 */
import * as express from "express";
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
}

function Get(value: string) {
    return function (target, propertyKey: string) {
        console.log("@Decorator@ Get: -> " + target.constructor.name + '.' + propertyKey + '()' + ' -> ' + value);
        routerMapper["get"][value] = target[propertyKey];
    }
}
function Post(value: string) {
    return function (target, propertyKey: string) {
        routerMapper["post"][value] = target[propertyKey];
    }
}
function All(value: string) {
    return function (target, propertyKey: string) {
        routerMapper["all"][value] = target[propertyKey];
    }
}

/**
 * 
 * @param app express application
 * @description This function is used to set the router to the express application
 */
function setRouter(app: express.Application) {
    // [FLAG]: commit to master
    for (let method in routerMapper) {
        for (let key in routerMapper[method]) {
            app[method](key, routerMapper[method][key]);
        }
    }
    console.log("{RouterMapper}:");
    console.log(routerMapper);
}
export { Get,Post, All, setRouter };