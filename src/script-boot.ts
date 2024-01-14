import "reflect-metadata";
import * as walkSync from "walk-sync";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./factory/log-factory.class";

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
    BeanFactory.putBean(constructorFunction, new constructorFunction());
}


/**
 * 
 * @param target class
 * @param propertyName property name 
 * @param descriptor 
 * @description To put the bean object to the BeanFactory.
 */
function Bean(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    log('@Decorator@: @Bean: -> ' + target.constructor.name + '.' + propertyName + '()' + ': ' + returnType.name);
    BeanFactory.putBean(returnType, target[propertyName]);
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
        get: function myProperty() {
            const beanObject = BeanFactory.getBean(type);
            return beanObject()
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
    const targetBean = BeanFactory.getBean(constructorFunction);
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
    const targetBean = BeanFactory.getBean(constructorFunction);
    return function (target, propertyKeys: string) {
        const currentMethod = targetBean[methodName];
        Object.assign(targetBean, {
            [methodName]: function(...args) {
                const result = currentMethod.apply(targetBean, args);
                const afterResult = target[propertyKeys](result);
                log("============ After ============")
                return afterResult ?? result;
            }
        })
    }
}

function log(message?: any, ...optionalParams: any[]) {
    const logBean = BeanFactory.getBean(LogFactory);
    if (logBean) {
        const logObject = logBean();
        logObject.log(message, ...optionalParams);
    } else {
        console.log(message, ...optionalParams);
    }
}

export { ScriptBootApplication, OnClass, Bean, Autowired, Inject, Before, After, log };