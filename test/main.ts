import ServerFactory from "../src/factory/express-factory.class";
import { App, Autoware, Log} from "../src/script-boot";
@App
class Main {

    @Autoware
    public server: ServerFactory;

    public main(){
        this.server.start(8001);
        Log('start application');
    }
}