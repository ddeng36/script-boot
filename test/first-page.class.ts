import { OnClass,log } from '../src/script-boot';
import { GetMapping } from "../src/route-mapping.decorate";

@OnClass
export default class FirstPage {

    @GetMapping("/first")
    public index(req: any, res: any) {
        log("FirstPage index running" + this.test());
        res.send("FirstPage index running");
    }

    public test() {
        log("FirstPage test running");
    }
}