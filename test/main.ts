import ServerFactory from "../src/factory/express-factory.class";
import { App, Autoware, log } from "../src/script-boot";
@App
class Main {

    @Autoware
    public server: ServerFactory;

    public main() {
        this.server.start(8080);
        log('start application');
    }
}