import "reflect-metadata";
import BeanFactory from "./bean-factory.class";
import LogFactory from "./log-factory.class";

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

export { onClass, bean, autoware, inject, log };