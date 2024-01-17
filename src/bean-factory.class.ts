
export default class BeanFactory {
    private static beanMapper: Map<string, any> = new Map<string, any>();
    private static objectMapper: Map<string, any> = new Map<string, any>();
    public static putBean(mappingClass: Function, beanClass: any): any {
        this.beanMapper.set(mappingClass.name, beanClass);
        console.log("{BeanMapper}:")
        console.log(this.beanMapper);
    }
    public static getBean(mappingClass: Function): any {
        return this.beanMapper.get(mappingClass.name);
    }
    public static putObject(mappingClass: Function, beanClass: any): any {
        console.log("{ObjectMapper}:")
        console.log(this.objectMapper);
        this.objectMapper.set(mappingClass.name, beanClass);
    }
    public static getObject(mappingClass: Function): any {
        return this.objectMapper.get(mappingClass.name);
    }
}
