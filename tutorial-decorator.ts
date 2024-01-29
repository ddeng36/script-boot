import "reflect-metadata";

@atClassWithArgs(1, 2, 3)
class SecondClass { }

@atClass
export default class FirstClass {

    @atPropertyWithArgs("Li", "Mei")
    private name: string;

    @atProperty
    private age: number;

    @atAccessor
    get newname(): string {
        return "Getter Decorator";
    }

    @atAccessorWithArgs("Getter Decorator", "With Args...")
    get newnameWithArgs(): string {
        return "Getter Decorator With Args..."
    }

    @atMethod
    changeName(name: string): SecondClass {
        this.name = name;
        return new SecondClass();
    }

    @atMethodWithArgs("New", "Type")
    change(name: string, @atParameter age: number): void {
        this.age = age;
        this.name = name;
    }

    getName(): string {
        return this.name;
    }
}

const obj = new FirstClass();

console.log("Check Property Decorator with args -> ", "FirstClass.getName() -> ", obj.getName());
console.log("Check Accessor Decorator -> ", "FirstClass.newname -> ", obj.newname);
console.log("Check Accessor Decorator with args -> ", "FirstClass.newnameWithArgs -> ", obj.newnameWithArgs);

// Class Decorator 
function atClass(target: any) {
    console.log("Class Decorator : @atClass -> ", target.name);
}

// Class Decorator with args
function atClassWithArgs(...args: any[]) {
    return function (target: any) {
        console.log("Class Decorator with args : @atClassWithArgs(" + args.join(", ") + ")" + " -> " + target.name);
    }
}

// Method Decorator
function atMethod(target: any, propertyKey: string) {
    const returnType: any = Reflect.getMetadata("design:returntype", target, propertyKey);
    console.log("Method Decorator : @atMethod -> " + target.constructor.name + '.' + propertyKey + "()" + ": " + returnType.name);
}

// Method Decorator with args
function atMethodWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string) {
        console.log("Method Decorator with args : @atMethodWithArgs(" + args.join(", ") + ")" + " -> " + target.constructor.name + '.' + propertyKey + "()");
    }
}

// Property Decorator
function atProperty(target: any, propertyKey: string) {
    const propertyType: any = Reflect.getMetadata("design:type", target, propertyKey);
    console.log("Property Decorator : @atProperty -> " + target.constructor.name + '.' + propertyKey + ": " + propertyType.name);
}

// Property Decorator with args
function atPropertyWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string) {
        Object.defineProperty(target, propertyKey, {
            get: () =>  {
                return args
            }
        });
        console.log("Property Decorator with args : @atPropertyWithArgs(" + args.join(", ") + ")" + " -> " + target.constructor.name + '.' + propertyKey);
    }
}

// Getter Decorator
function atAccessor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const returnType: any = Reflect.getMetadata("design:type", target, propertyKey);
    console.log("Getter Decorator : @atAccessor -> " + target.constructor.name + '.' + propertyKey + "(): " + returnType.name);
}

// Getter Decorator with args
function atAccessorWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("Getter Decorator with args : @atAccessorWithArgs(" + args.join(", ") + ")" + " -> " + target.constructor.name + '.' + propertyKey + "()");
    }
}

// Parameter Decorator
function atParameter(target: any, propertyKey: string, parameterIndex: number) {
    const parameterType: any = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    console.log("Parameter Decorator : @atParameter -> " + target.constructor.name + '.' + propertyKey + "(" + parameterType[parameterIndex].name + ")");
}

// Parameter Decorator with args
function atParameterWithArgs(...args: any[]) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        console.log("Parameter Decorator with args : @atParameterWithArgs(" + args.join(", ") + ")" + " -> " + target.constructor.name + '.' + propertyKey + "(" + parameterIndex + ")");
    }
}
