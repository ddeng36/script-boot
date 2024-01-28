import { setRouter } from "../route.decorate";
import ServerFactory from "../factory/server-factory.class";
import AuthenticationFactory from "../factory/authentication-factory.class";
import { Bean, error, log, Value, Autowired } from "../script-boot";
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

    // @Autowired
    // public authentication: AuthenticationFactory;

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

        if (this.favicon) {
            // support favicon
            const faviconPath = process.cwd() + this.favicon;
            log(faviconPath)
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
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        
        // set cookie
        this.app.use(cookieParser(this.cookieConfig["secret"] || undefined, this.cookieConfig["options"] || {}));

        // this.app.use(this.authentication.preHandle);
        // Making sure that the static file need authentication
        if (this.static) {
            // Use static file
            const staticPath = process.cwd() + this.static;
            this.app.use(express.static(staticPath));
        }
        // init router, set app.get, app.post, app.all to call the function in routerMapper
        setRouter(this.app);
        // this.app.use(this.authentication.postHandle);

        // 404 handler
        this.app.use((req, res, next) => {
            error("404 Not Found, for url: " + req.url);
            if (req.accepts('html')) {
                res.render(process.cwd() + "/static/error-page/404.html");
            } else if (req.accepts('json')) {
                res.json({ error: 'Not found' });
            } else {
                // default to plain-text. send()
                res.type('txt').send('Not found');
            }
        });
        // error handler
        this.app.use((err, req, res, next) => {
            if (!err) {
                next();
            }
            error(err);
            res.status(err.status || 500);
            if (req.accepts('html')) {
                res.render(process.cwd() + "/static/error-page/500.html");
            } else if (req.accepts('json')) {
                // respond with json
                res.json({ error: 'Internal Server Error' });
            } else {
                // default to plain-text. send()
                res.type('txt').send('Internal Server Error');
            }
        });
    }
}