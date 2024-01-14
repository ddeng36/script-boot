import { setRouter } from "../route-mapping.decorate";
import ServerFactory from "../factory/server-factory.class";
import { Bean, log, globalConfig, Value } from "../script-boot";
import * as express from "express";
import * as consolidate from "consolidate";

export default class ExpressServer extends ServerFactory {
    @Value("view")
    public view: string;
    
    @Bean
    public getServer(): ServerFactory {
        const server = new ExpressServer();
        server.app = express();
        return server;
    }

    public setMiddleware(middleware: any): void {
        this.middlewareList.push(middleware);
    }
    public start(port: number): void {
        this.middlewareList.forEach(middleware => {
            this.app.use(middleware);
        });
        this.setDefaultMiddleware();
        this.app.listen(port, () => {
            log(`Server is running on port ${port}`);
        })
    }
    setDefaultMiddleware() {
        // Use template engine
        const viewConfig = this.view;
        this.app.engine(viewConfig["suffix"], consolidate[viewConfig["engine"]]);
        this.app.set('view engine', viewConfig["suffix"]);
        this.app.set('views', process.cwd() + viewConfig["path"]);

        setRouter(this.app);
    }

}