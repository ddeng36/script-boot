import { log } from "console";
import { Get } from "../src/route-mapping.decorate";


export default class FirstPage {

    @Get("/first")
    public index(req: any, res: any) {
        log("FirstPage index running");
        res.send("FirstPage index running");
    }

}