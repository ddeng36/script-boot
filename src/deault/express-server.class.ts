import { setRouter } from "../route-mapping.decorate";
import ServerFactory from "../factory/express-factory.class";
import { Bean, log } from "../script-boot";
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
        setRouter(app);
        app.listen(port, () => {
            log(`Server is running on port ${port}`);
        })
    }

}