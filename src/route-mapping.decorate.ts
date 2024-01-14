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
const routerParams = {};

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

function Request(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    log("@Decorator@ @Requset: -> " + key);
    routerParams[key] = (req, res, next) => req;
    console.log(routerParams);
}

function Response(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    log("@Decorator@ @Response: -> " + key);
    routerParams[key] = (req, res, next) => res;
    console.log(routerParams);
}

function Next(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    log("@Decorator@ @Next: -> " + key);
    routerParams[key] = (req, res, next) => next;
    console.log(routerParams);
}

function RequestBody(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    log("@Decorator@ @RequestBody: -> " + key);
    routerParams[key] = (req, res, next) => req.body;
    console.log(routerParams);
}

function RequestParam(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    log("@Decorator@ @RequestParam: -> " + key + " -> " + paramName);
    routerParams[key] = (req, res, next) => req.params[paramName];
    console.log(routerParams);
}
function getParamInFunction(fn: Function, index: number) {
    const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,]+/mg, '');
    const result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result[index] || null;
}
function RequestQuery(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    log("@Decorator@ @RequestQuery: -> " + key + " -> " + paramName);
    routerParams[key] = (req, res, next) => req.query[paramName];
    console.log(routerParams);
}
function RequestForm(paramName: string) {
    return (target: any, propertyKey: string, parameterIndex: number) => {
        const key = [target.constructor.name, propertyKey, parameterIndex].toString();
        log("@Decorator@ @RequestForm: -> " + key + " -> " + paramName);
        routerParams[key] = (req, res, next) => req.body[paramName];
        console.log(routerParams);
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
export { GetMapping, PostMapping, RequestMapping, setRouter, Request, Response, Next, RequestBody, RequestParam, RequestQuery, RequestForm };