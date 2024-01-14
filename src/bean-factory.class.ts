
export default class BeanFactory {
    private static beanMapper: Map<string, any> = new Map<string, any>();
    private static beanFunctionMapper: Map<string, any> = new Map<string, any>();
    public static putBean(mappingClass: Function, beanClass: any): any {
        this.beanMapper.set(mappingClass.name, beanClass);
        console.log("{BeanMapper}:")
        console.log(this.beanMapper);
    }
    public static getBean(mappingClass: Function): any {
        return this.beanMapper.get(mappingClass.name);
    }
}
