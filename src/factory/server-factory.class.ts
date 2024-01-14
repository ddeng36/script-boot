export default abstract class ServerFactory {
    public app;
    protected middlewareList: Array<any> = [];
    public abstract setMiddleware(middleware: any): void;
    public abstract start(port: number): void;
}