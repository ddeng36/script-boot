/**
 * @file Router mapping decorator
 * @description This file is used to map the router to the express application
 * 
 */
import * as multiparty from "multiparty";
import * as express from "express";
import BeanFactory from "./bean-factory.class";
import { log } from "./script-boot";
import { expressjwt } from "express-jwt";
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
}
const routerParams = {};
const routerMiddleware = {};

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
            let routerFunction = routerMapper[method][key];
            if (routerMiddleware[routerFunction["name"]]) {
                let args: Array<any> = [key, ...routerMiddleware[routerFunction["name"]], routerFunction["invoker"]];
                app[method].apply(app, args);
            } else {
                app[method](key, routerFunction["invoker"]);

            }
        }
    });
    log("{RouterMapper}:");
    log(routerMapper);
}

function mapperFunction(method: string, value: string) {
    return (target: any, propertyKey: string) => {
        log("@Decorator@ @" + method.toUpperCase() + "Mapping: -> " + target.constructor.name + '.' + propertyKey + '()' + ' -> ' + value);
        routerMapper[method][value] = {
            "path": value,
            "name": target.constructor.name + "#" + propertyKey,
            "invoker": (req, res) => {
                const routerBean = BeanFactory.getObject(target.constructor);
                const testResult = routerBean[propertyKey](req, res);
                if (typeof testResult === "object") {
                    res.json(testResult);
                } else if (typeof testResult !== "undefined") {
                    res.send(testResult);
                }
                return testResult;
            }
        }
    }
}
function Upload(target: any, propertyKey: string) {
    if (routerMiddleware[target.constructor.name + "#" + propertyKey]) {
        routerMiddleware[target.constructor.name + "#" + propertyKey].push(uploadMiddleware);
    } else {
        routerMiddleware[target.constructor.name + "#" + propertyKey] = [uploadMiddleware];
    }
}

function uploadMiddleware(req, res, next) {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        req.files = files["upload"] || undefined;
        next();
    });
}


function Jwt(jwtConfig) {
    return (target: any, propertyKey: string) => {
        if (routerMiddleware[target.constructor.name + "#" + propertyKey]) {
            routerMiddleware[target.constructor.name + "#" + propertyKey].push(expressjwt(jwtConfig));
        } else {
            routerMiddleware[target.constructor.name + "#" + propertyKey] = [expressjwt(jwtConfig)];
        }
    }
}


const GetMapping = (value: string) => mapperFunction("get", value);
const PostMapping = (value: string) => mapperFunction("post", value);
const RequestMapping = (value: string) => mapperFunction("all", value);

export {
    GetMapping, PostMapping, RequestMapping, setRouter, Request, Response, Next,
    RequestBody, RequestParam, RequestQuery, RequestForm, Upload, Jwt
};