import ServerFactory from "../src/factory/server-factory.class";
import { ScriptBootApplication, Autowired, log } from "../src/script-boot";
@ScriptBootApplication
class Main {

    @Autowired
    public server: ServerFactory;

    public main() {
        this.server.start(8080);
        log('start application');
    }
}