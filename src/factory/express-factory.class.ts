export default abstract class ServerFactory {
    protected middlewareList: Array<any> = [];
    public abstract setMiddleware(middleware: any): void;
    public abstract start(port: number): void;
}