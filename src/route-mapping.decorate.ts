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
    ["get", "post", "all"].forEach(method => {
        for (let key in routerMapper[method]) {
            app[method](key, routerMapper[method][key]);
            // equal to app.get('route', (res,req,next)={})
        }
    });
    log("{RouterMapper}:");
    log(routerMapper);
}

function mapperFunction(method: string, value: string) {
    return (target: any, propertyKey: string) => {
        log("@Decorator@ @" + method.toUpperCase() + "Mapping: -> " + target.constructor.name + '.' + propertyKey + '()' + ' -> ' + value);
        routerMapper[method][value] = (req, res, next) => {
            const routerBean = BeanFactory.getBean(target.constructor);
            const testResult = routerBean[propertyKey](req, res, next);
            if (typeof testResult === "object") {
                res.json(testResult);
            } else if (typeof testResult !== "undefined") {
                res.send(testResult);
            }
            return testResult;
        }
    }
}


const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export { GetMapping, PostMapping, RequestMapping, setRouter, Request, Response, Next, RequestBody, RequestParam, RequestQuery, RequestForm };