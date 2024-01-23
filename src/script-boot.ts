import "reflect-metadata";
import * as walkSync from "walk-sync";
import * as fs from "fs";
import LogFactory from "./factory/log-factory.class";

// Map
const resourceObjects = new Map<string, object>();
const beanMapper: Map<string, any> = new Map<string, any>();
const objectMapper: Map<string, any> = new Map<string, any>();

// config 
let globalConfig = {};
const configPath = process.cwd() + "/test/config.json";
if (fs.existsSync(configPath)) {
    // config.json
    globalConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = process.cwd() + "/test/config-" + nodeEnv + ".json";
    if (fs.existsSync(envConfigFile)) {
        // config-development.json
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
    log("globalConfig: <- ".concat(fs.existsSync(envConfigFile) ? envConfigFile : configPath));
    log(globalConfig);
}
function config(node: string) {
    return globalConfig[node] ?? {};
}

function ScriptBootApplication<T extends { new(...args: any[]): {} }>(constructor: T) {
    log('@ScriptBootApplication -> ' + constructor.name);
    // 1. get and import all the files under the src directory.
    const srcDir = process.cwd() + "/src";
    const srcFiles = walkSync(srcDir, { globs: ['**/*.ts'] });
    const testDir = process.cwd() + "/test";
    const testFiles = walkSync(testDir, { globs: ['**/*.ts'] });
    (async function () {
        // Immediately Invoked Function Expression (IIFE)
        // Make sure application is running after all the classes are loaded.
        try {
            for (let p of srcFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                log("Load File <- " + moduleName);
                await import(srcDir + "/" + moduleName);
            }

            for (let p of testFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                log("Load File <- " + moduleName);
                await import(testDir + "/" + moduleName);
            }
        } catch (err) {
            console.error(err);
        }
        log("Initialize the main class");
        const main = new constructor();
        main["main"]();
    }());
}

function Controller(constructorFunction) {
    log('@Controller -> ' + constructorFunction.name);
    objectMapper.set(constructorFunction.name, new constructorFunction());
    log("objectMapper: <- ");
    log("{ "+ constructorFunction.name + ": " + objectMapper.get(constructorFunction.name) + " }");
}
function getController(constructorFunction) {
    log("getController: <- " + constructorFunction.name);
    return objectMapper.get(constructorFunction.name);
}

function Bean(target: any, propertyName: string) {
    // 1. get the return type of this method.
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    log('@Bean -> { ' + returnType.name + ': ' + target.constructor.name + '.' + propertyName + '() }');
    // 2. new the object of the return type.
    const targetObject = new target.constructor();
    // 3. put the object into BeanFactory.
    beanMapper.set(returnType.name, {
        "target": target,
        "propertyKey": propertyName,
        "factory": targetObject[propertyName]()
    });
    log("beanMapper: <- ");
    log("{ " + returnType.name + ": " + beanMapper.get(returnType.name)["factory"] + " }");
}
function getBean(mappingClass: Function): any {
    const bean = beanMapper.get(mappingClass.name);
    log("getBean: <- " + mappingClass.name);
    return bean["factory"];
}

function Resource(...args): any {
    // Resource is Aotuwired,
    return (target: any, propertyKey: string) => {
        // 1. get the type of this property.
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        // 2. set getter function to the property, which will directly return the new object.
        Object.defineProperty(target, propertyKey, {
            get: () => {
                // Singleton 
                const resourceKey = [target.constructor.name, propertyKey, type.name].toString();
                if (!resourceObjects[resourceKey]) {
                    resourceObjects[resourceKey] = new type(...args);
                }
                return resourceObjects[resourceKey];
            }
        });
    }
}

function Autowired(target: any, propertyKey: string): void {
    // 1. get the type of this property.
    let type = Reflect.getMetadata("design:type", target, propertyKey);
    log('@Inject -> ' + target.constructor.name + '.' + propertyKey + ': ' + type.name);
    // 2. set getter function to the property, which will return the bean from BeanFactory.
    // Singleton
    Object.defineProperty(target, propertyKey, {
        get: () => {
            const targetObject = beanMapper.get(type.name);
            log("targetObject: <- " + type.name);
            if (targetObject === undefined) {
                // 3. if the bean is not in BeanFactory, then create a new object of this type and put it into BeanFactory.
                log("new " + type.name + "()");
                return new type();
            }
            return targetObject["factory"];
        }
    })
}

/**
 * 
 * @param constructorFunction 
 * @param methodName string
 * @description To do something before the method is called.
 */
function Before(constructorFunction, methodName: string) {
    log("@Before -> " + constructorFunction.name + "." + methodName);
    // 1. get the bean object
    const targetBean = getController(constructorFunction);
    return function (target, propertyKeys: string) {
        // 2. get the current method of bean object
        const currentMethod = targetBean[methodName];
        // 3. override the method, do something before the method is called, and then call the method.
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                target[propertyKeys](...args);
                log("============ Before ============")
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
        Object.assign(targetBean, {
            [methodName]: function (...args) {
                const result = currentMethod.apply(targetBean, args);
                const afterResult = target[propertyKeys](result);
                log("============ After ============")
                return afterResult ?? result;
            }
        })
    }
}
function log(message?: any, ...optionalParams: any[]) {
    const logObject = beanMapper.get(LogFactory.name);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    } else {
        console.log(message, ...optionalParams);
    }
}

function error(message?: any, ...optionalParams: any[]) {
    const logObject = beanMapper.get(LogFactory.name);
    if (logObject) {
        logObject["factory"].error(message, ...optionalParams);
    } else {
        console.error(message, ...optionalParams);
    }
}

function Value(configPath: string): any {
    return function (target: any, propertyKey: string) {
        log("@Value -> " + configPath);
        if (globalConfig === undefined) {
            log("undefined");
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return undefined;
                }
            });
        } else {
            // 1. get the value from config
            let pathNodes = configPath.split(".");
            let nodeValue = globalConfig;
            for (let i = 0; i < pathNodes.length; i++) {
                nodeValue = nodeValue[pathNodes[i]];
            }
            log(nodeValue);
            // 2. set the value to the property, which will return the value from config when the property is called.
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return nodeValue;
                }
            });
        }
    }
}

export {
    ScriptBootApplication, Controller, Bean, Resource,
    Autowired, Before, After, log, globalConfig, Value, error
    , config, getBean, getController
};