/**
 * @file Router mapping decorator
 * @description This file is used to map the router to the express application
 * 
 */
import * as multiparty from "multiparty";
import * as express from "express";
import { log, getController } from "./script-boot";
import { expressjwt } from "express-jwt";
const routerMapper = {
    "get": {},
    "post": {},
    "all": {}
};
const routerParams = {};
const routerMiddleware = {};
const routerParamsTotal = {};

function Request(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req;
    log("@Request -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}

function Response(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => res;
    log("@Response -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}

function Next(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => next;
    log("@Next -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}

function RequestBody(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    routerParams[key] = (req, res, next) => req.body;
    log("@RequestBody -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}

function RequestParam(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.params[paramName];
    log("@RequestParam -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}
function getParamInFunction(fn: Function, index: number) {
    const code = fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '').replace(/=>.*$/mg, '').replace(/=[^,]+/mg, '');
    const result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
    return result[index] || null;
}
function RequestQuery(target: any, propertyKey: string, parameterIndex: number) {
    const key = [target.constructor.name, propertyKey, parameterIndex].toString();
    const paramName = getParamInFunction(target[propertyKey], parameterIndex);
    routerParams[key] = (req, res, next) => req.query[paramName];
    log("@RequestQuery -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
    log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
}
function RequestForm(paramName: string) {
    return (target: any, propertyKey: string, parameterIndex: number) => {
        const key = [target.constructor.name, propertyKey, parameterIndex].toString();
        routerParams[key] = (req, res, next) => req.body[paramName];
        log("@RequestForm -> " + target.constructor.name + '.' + propertyKey + '(' + parameterIndex + ',...)');
        log('routerParams <- { "' + key + '" : ' + routerParams[key] + '}');
    }
}


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
}

function mapperFunction(method: string, path: string) {
    // if this Decorator accepts a parameter, then we should use closure save it and return a function.
    return (target: any, propertyKey: string) => {
        // 1. get the original function and save it in cb.
        // 2. put cb into routerMapper according to the method and path.
        const result = routerMapper[method][path] = {
            "path": path,
            "name": [target.constructor.name, propertyKey].toString(),
            "target": target.constructor,
            "propertyKey": propertyKey,
            "invoker": async (req, res, next) => {
                const routerBean = getController(target.constructor);
                try {
                    let paramTotal = routerBean[propertyKey].length;
                    if (routerParamsTotal[[target.constructor.name, propertyKey].toString()]) {
                        paramTotal = Math.max(paramTotal, routerParamsTotal[[target.constructor.name, propertyKey].toString()]);
                    }
                    const args = [req, res, next];
                    if (paramTotal > 0) {
                        for (let i = 0; i < paramTotal; i++) {
                            log([target.constructor.name, propertyKey, i].toString());
                            log(routerParams[[target.constructor.name, propertyKey, i].toString()]);
                            if (routerParams[[target.constructor.name, propertyKey, i].toString()]) {
                                args[i] = routerParams[[target.constructor.name, propertyKey, i].toString()](req, res, next);
                                log("args[" + i + "] <- " + args[i]);
                            }
                        }
                    }
                    const testResult = await routerBean[propertyKey].apply(routerBean, args);
                    if (typeof testResult === "object") {
                        res.json(testResult);
                    } else if (typeof testResult !== "undefined") {
                        res.send(testResult);
                    }
                    return testResult;
                } catch (err) {
                    next(err)
                }
            }
        }
        log("@" + method[0].toUpperCase().concat(method.slice(1)) + "Mapping -> { " + 'routerMapper["' + method + '"]["' + path + '"]: <- }');
        log(result);
    }
}
function Upload(target: any, propertyKey: string) {
    const key = [target.constructor.name, propertyKey].toString();
    if (routerMiddleware[key]) {
        routerMiddleware[key].push(uploadMiddleware);
    } else {
        routerMiddleware[key] = [uploadMiddleware];
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
        const key = [target.constructor.name, propertyKey].toString();
        if (routerMiddleware[key]) {
            routerMiddleware[key].push(expressjwt(jwtConfig));
        } else {
            routerMiddleware[key] = [expressjwt(jwtConfig)];
        }
        log("@Jwt -> " + target.constructor.name + '#' + propertyKey);
        log('routerMiddleware <- { "' + key + '" : [expressjwt(jwtConfig)]}');
        log(routerMiddleware);
    }
}

function Before(constructorFunction, methodName: string) {
    log("@Before -> " + constructorFunction.name + "." + methodName);
    // 1. get the bean object
    const targetBean = getController(constructorFunction);
    return function (target, propertyKeys: string) {
        // 2. get the current method of bean object
        const currentMethod = targetBean[methodName];
        log(currentMethod.length)
        log(currentMethod)
        if (currentMethod.length > 0) {
            // !!!!Length of the function is the number of parameters.!!!!!
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
            log("routerParamsTotal <- { " + [constructorFunction.name, methodName].toString() + " : " + currentMethod.length + " }");
        }
        // 3. override the method, do something before the method is called, and then call the method.
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                log("Run -> " + target.constructor.name + "." + propertyKeys + "()");
                target[propertyKeys](...args);
                log("============ Before ============")
                log("run -> " + targetBean.constructor.name + "." + methodName + "()");
                currentMethod.apply(targetBean, args);
            }
        })
    }
}

function After(constructorFunction, methodName: string) {
    log("@After -> " + constructorFunction.name + "." + methodName);
    const targetBean = getController(constructorFunction);
    return function (target, propertyKeys: string) {
        const currentMethod = targetBean[methodName];
        log(currentMethod.length)
        log(currentMethod)
        if (currentMethod.length > 0) {
            routerParamsTotal[[constructorFunction.name, methodName].toString()] = currentMethod.length;
            log("routerParamsTotal <- { " + [constructorFunction.name, methodName].toString() + " : " + currentMethod.length + " }");
        }
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                log("Run ->" + targetBean.constructor.name + "." + methodName + "()");
                const result = currentMethod.apply(targetBean, args);
                log("run -> " + target.constructor.name + "." + propertyKeys + "()");
                const afterResult = target[propertyKeys](result);
                log("============ After ============")
                log("afterResult -> " + afterResult)
                log("result -> " + result)
                return afterResult ?? result;
            }
        })
    }
}

const GetMapping = (path: string) => mapperFunction("get", path);
const PostMapping = (path: string) => mapperFunction("post", path);
const RequestMapping = (path: string) => mapperFunction("all", path);

export {
    GetMapping, PostMapping, RequestMapping, setRouter, Request, Response, Next,
    RequestBody, RequestParam, RequestQuery, RequestForm, Upload, Jwt, Before, After
};