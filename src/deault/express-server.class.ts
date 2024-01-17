import { setRouter } from "../route-mapping.decorate";
import ServerFactory from "../factory/server-factory.class";
import { Bean, log, Value } from "../script-boot";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as consolidate from "consolidate";
import * as serveFavicon from "serve-favicon";
import * as expressSession from "express-session";

export default class ExpressServer extends ServerFactory {
    @Value("view")
    public view: string;

    @Value("static")
    public static: string;

    @Value("favicon")
    public favicon: string;

    @Value("compression")
    private compression: string;

    @Value("cookie")
    private cookieConfig: string;

    @Value("session")
    private session: object;

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
        log(this.middlewareList);
        this.middlewareList.forEach(middleware => {
            this.app.use(middleware);
        });
        this.setDefaultMiddleware();
        this.app.listen(port, () => {
            log(`Server is running on port ${port}`);
        })
    }
    setDefaultMiddleware() {
        if (this.view) {
            // Use template engine
            const viewConfig = this.view;
            this.app.engine(viewConfig["suffix"], consolidate[viewConfig["engine"]]);
            this.app.set('view engine', viewConfig["suffix"]);
            this.app.set('views', process.cwd() + viewConfig["path"]);
        }
        if (this.static) {
            // Use static file
            const staticPath = process.cwd() + this.static;
            this.app.use(express.static(staticPath));
        }
        if (this.favicon) {
            // support favicon
            const faviconPath = process.cwd() + this.favicon;
            console.log(faviconPath)
            this.app.use(serveFavicon(faviconPath));
        }
        if (this.compression) {
            // Use compression
            this.app.use(compression(this.compression));
        }
        if (this.session) {
            // Use Session
            const sessionConfig = this.session;
            if (sessionConfig["trust proxy"] === 1) {
                this.app.set("trust proxy", 1);
            }
            this.app.use(expressSession(sessionConfig));
        }

        // set cookie
        this.app.use(cookieParser(this.cookieConfig["secret"] || undefined, this.cookieConfig["options"] || {}));

        // init router
        setRouter(this.app);
    }

}