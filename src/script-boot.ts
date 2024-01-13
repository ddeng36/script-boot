import "reflect-metadata";
import * as walkSync from "walk-sync";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./factory/log-factory.class";

/**
 * 
 * @param constructor 
 * @description The Entry of the application.
 */
function App<T extends { new(...args: any[]): {} }>(constructor: T) {
    console.log('@Decorator@: @App: -> ' + constructor.name);

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
                console.log("/Load File/: " + moduleName);
                await import(srcDir + "/" + moduleName);
            }

            for (let p of testFiles) {
                let moduleName = p.replace(".d.ts", "").replace(".ts", "");
                console.log("/Load File/:"  + moduleName);
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
 * @param constructor old constructor
 * @returns new constructor, which logs the time when the @Decorator@ is called.
 * @description To log the time when the @Decorator@ is called.
*/
function OnClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    log('@Decorator@: @OnClass: -> ' + constructor.name);
    return class extends constructor {
        constructor(...args) {
            super(...args);
        }
    };
}

function Bean(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    log('@Decorator@: @Bean: -> ' + target.constructor.name + '.' + propertyName + '()' + ': '+ returnType.name);
    BeanFactory.putBean(returnType, target[propertyName]);
}

function Autoware(target: any, propertyName: string): void {
    log('@Decorator@: @Autoware -> ' + target.constructor.name + '.' + propertyName);
    let type = Reflect.getMetadata("design:type", target, propertyName);
    Object.defineProperty(target, propertyName, {
        get: function myProperty() {
            const beanObject = BeanFactory.getBean(type);
            return beanObject()
        }
    });
}

function Inject(): any {
    console.log("@Decorator@ inject, outside the return.");
    return (target: any, propertyKey: string) => {
        console.log("@Decorator@ inject, in the return, propertyKey: " + propertyKey);
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        console.log("@Decorator@ inject, in the return, type.name: " + type.name);
        return {
            get: function () {
                return "@Decorator@ inject, in the return get function";
            }
        };
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

export { App, OnClass, Bean, Autoware, Inject, log };