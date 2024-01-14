/**
 * @file Router mapping decorator
 * @description This file is used to map the router to the express application
 * 
 */
import * as express from "express";
import BeanFactory from "./bean-factory.class";
import { log } from "./script-boot";
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
}

function GetMapping(value: string) {
    return function (target, propertyKey: string) {
        log("@Decorator@ @GetMapping: -> " + target.constructor.name + '.' + propertyKey + '()' + ' -> ' + value);
        routerMapper["get"][value] = (...args) => {
            let getBean = BeanFactory.getBean(target.constructor);
            log("getBean: " + getBean);
            log(getBean);
            return getBean[propertyKey](...args);
        }
    }
}
function PostMapping(value: string) {
    return function (target, propertyKey: string) {
        routerMapper["post"][value] = target[propertyKey];
    }
}
function RequestMapping(value: string) {
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
    for (let key in routerMapper["get"]) {
        app.get(key, routerMapper["get"][key]);
    }
    for (let key in routerMapper["post"]) {
        app.post(key, routerMapper["post"][key]);
    }
    for (let key in routerMapper["all"]) {
        app.all(key, routerMapper["all"][key]);
    }
    log("{RouterMapper}:");
    log(routerMapper);
}
export { GetMapping, PostMapping, RequestMapping, setRouter };