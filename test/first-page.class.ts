import { OnClass,log } from '../src/script-boot';
import { GetMapping } from "../src/route-mapping.decorate";
import { Request } from "../src/route-mapping.decorate";

@OnClass
export default class FirstPage {

    @GetMapping("/first")
    
    public index(@Request req: any, res: any) {
        log("FirstPage index running" + this.test());
        res.send("FirstPage index running");
    }

    public test() {
        log("FirstPage test running");
    }

    @GetMapping("/first/renderTest")
    public renderTest(req: any, res: any) {
        res.render("index", {name:"zzz"});
    }

    @GetMapping("/first/sendJson")
    public sendJson() {
        log("FirstPage sendJson running");
        return {
            "from" : "sendJson",
            "to" : "Browser"
        }
    }

    @GetMapping("/first/sendResult")
    public sendResult() {
        log("FirstPage sendResult running");
        return "sendResult";
    }
}