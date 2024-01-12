import "reflect-metadata";
import * as walkSync from "walk-sync";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./log-factory.class";

/**
 * 
 * @param constructor 
 * @description The Entry of the application.
 */
function app<T extends { new (...args: any[]): {} }>(constructor: T){
    // Immediately Invoked Function Expression (IIFE)
    // Make sure application is running after all the classes are loaded.
    (async function () {
        const srcDir = process.cwd() + "/src";
        const srcPaths = walkSync(srcDir, { globs: ['**/*.ts'] });
        for(let p of srcPaths) {
            await import(srcDir + "/" + p);
        }
        
        const testDir = process.cwd() + "/test";
        const testPaths = walkSync(testDir, { globs: ['**/*.ts'] });
        for(let p of testPaths) {
            await import(testDir + "/" + p);
        }
        
        log("app Decorator running...");
        const main = new constructor();
        main["main"]();
    }());
}

/**
 * 
 * @param constructor old constructor
 * @returns new constructor, which logs the time when the decorator is called.
 * @description To log the time when the decorator is called.
*/
function onClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    console.log('Decorator: onClass: ' + constructor.name);
    return class extends constructor {
        constructor(...args) {
            super(...args);
        }
    };
}

function bean(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    console.log('Decorator: bean: ' + target.constructor.name + '.' + propertyName);
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
    console.log('Decorator: bean: returnType.name: ' + returnType.name);
    BeanFactory.putBean(returnType, target[propertyName]);
}

function autoware(target: any, propertyName: string) {
    console.log('Decorator: autoware: ' + target.constructor.name + '.' + propertyName);
    target[propertyName] = 'autoware';
}

function inject(): any {
    console.log("decorator inject, outside the return.");
    return (target: any, propertyKey: string) => {
        console.log("decorator inject, in the return, propertyKey: " + propertyKey);
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        console.log("decorator inject, in the return, type.name: " + type.name);
        return {
            get: function () {
                return "decorator inject, in the return get function";
            }
        };
    }
}

function log(message?: any, ...optionalParams: any[]) {
    const logBean = BeanFactory.getBean(LogFactory);
    if(logBean) {
        const logObject = logBean();
        logObject.log(message, ...optionalParams);
    }else{
        console.log(message, ...optionalParams);
    }
}

export { onClass, bean, autoware, inject, log, app };