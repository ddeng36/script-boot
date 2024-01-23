import ServerFactory from "../src/factory/server-factory.class";
import { ScriptBootApplication, log, Inject } from "../src/script-boot";

@ScriptBootApplication
class Main {

    @Inject
    public server: ServerFactory;

    public main() {
        this.server.start(8080);
        log('start application');
    }
}