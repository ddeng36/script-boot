import "reflect-metadata";
import * as walkSync from "walk-sync";
import * as fs from "fs";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./factory/log-factory.class";

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
    BeanFactory.putObject(constructorFunction, new constructorFunction());
}


function Bean(target: any, propertyName: string) {
    // 1. get the return type of this method.
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    log('@Bean -> { ' + returnType.name + ': ' + target.constructor.name + '.' + propertyName + '() }');
    // 2. new the object of the return type.
    const targetObject = new target.constructor();
    // 3. put the object into BeanFactory.
    BeanFactory.putBean(returnType, {
        "target": target,
        "propertyKey": propertyName,
        "factory": targetObject[propertyName]()
    });
}

function Autowired(...args): any {
    return (target: any, propertyKey: string) => {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return new type(...args);
            }
        });
    }
}

function Inject(target: any, propertyKey: string): void {
    // 1. get the type of this property.
    let type = Reflect.getMetadata("design:type", target, propertyKey);
    log('@Inject -> ' + target.constructor.name + '.' + propertyKey + ': ' + type.name);
    // 2. set getter function to the property, which will return the bean from BeanFactory.
    // Singleton
    Object.defineProperty(target, propertyKey, {
        get: () => {
            const targetObject = BeanFactory.getBean(type);
            if (targetObject === undefined) {
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
    const targetBean = BeanFactory.getObject(constructorFunction);
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
    const targetBean = BeanFactory.getObject(constructorFunction);
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
    const logObject = BeanFactory.getBean(LogFactory);
    if (logObject) {
        logObject["factory"].log(message, ...optionalParams);
    } else {
        console.log(message, ...optionalParams);
    }
}

function error(message?: any, ...optionalParams: any[]) {
    const logObject = BeanFactory.getBean(LogFactory);
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
    ScriptBootApplication, Controller, Bean, Autowired,
    Inject, Before, After, log, globalConfig, Value, error
    , config
};