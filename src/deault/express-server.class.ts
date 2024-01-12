import ServerFactory from "../factory/express-factory.class";
import { Bean, Log } from "../script-boot";
import * as express from "express";

export default class ExpressServer extends ServerFactory {
    @Bean
    public getServer(): ServerFactory {
        return new ExpressServer();
    }

    public setMiddleware(middleware: any): void {
        this.middlewareList.push(middleware);
    }
    public start(port: number): void {
        const app: express.Application = express();
        this.middlewareList.forEach(middleware => {
            app.use(middleware);
        });
        app.listen(port, () => {
            Log(`Server is running on port ${port}`);
        })
    }

}