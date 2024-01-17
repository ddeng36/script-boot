import "reflect-metadata";
import * as walkSync from "walk-sync";
import * as fs from "fs";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./factory/log-factory.class";
import { config } from "process";

let globalConfig = {};
const configPath = process.cwd() + "/test/config.json";
if (fs.existsSync(configPath)) {
    // config.json
    globalConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const nodeEnv = process.env.NODE_ENV || "development";
    const envConfigFile = process.cwd() + "/test/config-" + nodeEnv + ".json";
    // console.log(globalConfig);
    if (fs.existsSync(envConfigFile)) {
        // config-development.json
        globalConfig = Object.assign(globalConfig, JSON.parse(fs.readFileSync(envConfigFile, "utf-8")));
    }
    // console.log(globalConfig);
}
/**
 * 
 * @param constructor 
 * @description The Entry of the application.
 */
function ScriptBootApplication<T extends { new(...args: any[]): {} }>(constructor: T) {
    log('@Decorator@: @ScriptBootApplication: -> ' + constructor.name);

    const srcDir = process.cwd() + "/src";
    const srcFiles = walkSync(srcDir, { globs: ['**/*.ts'] });

    const testDir = process.cwd() + "/test";
    const testFiles = walkSync(testDir, { globs: ['**/*.ts'] });

    // Immediately Invoked Function Expression (IIFE)
    // Make sure application is running after all the classes are loaded.
    (async function () {
        try {
            for (let p of srcFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                log("/Load File/: " + moduleName);
                await import(srcDir + "/" + moduleName);
            }

            for (let p of testFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                log("/Load File/: " + moduleName);
                await import(testDir + "/" + moduleName);
            }
        } catch (err) {
            console.error(err);
        }
        log("Start Application");
        const main = new constructor();
        main["main"]();
    }());
}

/**
 * 
 * @param constructorFunction
 * @description initialize the class and put the bean object to the BeanFactory.
*/
function OnClass(constructorFunction) {
    log('@Decorator@: @OnClass: -> ' + constructorFunction.name);
    BeanFactory.putObject(constructorFunction, new constructorFunction());
}


/**
 * 
 * @param target class
 * @param propertyName property name 
 * @param descriptor 
 * @description To put the bean object to the BeanFactory.
 */
function Bean(target: any, propertyName: string) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    log('@Decorator@: @Bean: -> ' + target.constructor.name + '.' + propertyName + '()' + ': ' + returnType.name);
    const targetObject = new target.constructor();
    BeanFactory.putBean(returnType, {
        "target": target,
        "propertyKey": propertyName,
        "factory": targetObject[propertyName]()
    });
}

/**
 * 
 * @param target class
 * @param propertyName property name
 * @description To new a object and inject the bean object to the property. 
 */
function Autowired(target: any, propertyName: string): void {
    log('@Decorator@: @Autowired -> ' + target.constructor.name + '.' + propertyName);
    let type = Reflect.getMetadata("design:type", target, propertyName);
    Object.defineProperty(target, propertyName, {
        get: () => {
            const targetObject = BeanFactory.getBean(type);
            return targetObject["factory"];
        }
    });
}

function Inject(): any {
    log("@Decorator@ @inject, outside the return.");
    return (target: any, propertyKey: string) => {
        log("@Decorator@ @inject, in the return, propertyKey: " + propertyKey);
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        log("@Decorator@ @inject, in the return, type.name: " + type.name);
        return {
            get: function () {
                return "@Decorator@ @inject, in the return get function";
            }
        };
    }
}

/**
 * 
 * @param constructorFunction 
 * @param methodName string
 * @description To do something before the method is called.
 */
function Before(constructorFunction, methodName: string) {
    log("@Decorator@ @Before: " + constructorFunction.name + "." + methodName);
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
    log("@Decorator@ @After: " + constructorFunction.name + "." + methodName);
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
        log("@Decorator@ @Value: " + configPath);
        if (globalConfig === undefined) {
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return undefined;
                }
            });
        } else {
            let pathNodes = configPath.split(".");
            let nodeValue = globalConfig;
            for (let i = 0; i < pathNodes.length; i++) {
                nodeValue = nodeValue[pathNodes[i]];
            }
            Object.defineProperty(target, propertyKey, {
                get: () => {
                    return nodeValue;
                }
            });
        }
    }
}

export {
    ScriptBootApplication, OnClass, Bean, Autowired,
    Inject, Before, After, log, globalConfig, Value, error
};