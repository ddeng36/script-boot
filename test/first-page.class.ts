import { log } from "console";
import { GetMapping } from "../src/route-mapping.decorate";


export default class FirstPage {

    @GetMapping("/first")
    public index(req: any, res: any) {
        log("FirstPage index running");
        res.send("FirstPage index running");
    }

}