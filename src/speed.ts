import "reflect-metadata";
import BeanFactory from "./bean-factory.class";
import { LogFactory } from "./log-factory.interface";

/**
 * 
 * @param constructor old constructor
 * @returns new constructor, which logs the time when the decorator is called.
 * @description To log the time when the decorator is called.
*/
function onClass<T extends { new (...args: any[]): {} }>(constructor: T) {
    console.log('Decorator: onClass: ' + constructor.name);
  return class extends constructor {
    constructor(...args) {
      super(...args);
      console.log(this.name)
    }
  };
}

function bean(target: any, propertyName: string, descriptor: PropertyDescriptor) {    console.log('Decorator: bean: ' + target.constructor.name + '.' + propertyName);
    let returnType = Reflect.getMetadata("design:returntype", target, propertyName);
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

function log(...args) {
    //console.log(...args);
    const logFactory : LogFactory = BeanFactory.getBean(LogFactory.name);
}

export { onClass, bean, autoware, inject, log };