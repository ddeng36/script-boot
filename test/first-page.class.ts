import { Controller,log } from '../src/script-boot';
import { GetMapping } from "../src/route.decorate";
import { Request } from "../src/route.decorate";
import * as jwttoken from "jsonwebtoken";

@Controller
export default class FirstPage {

    @GetMapping("/first")
    public index(@Request req: any, res: any) {
        log("FirstPage index running: " + this.test());
        res.send("FirstPage index running");
    }

    public test() {
        return "FirstPage test running";
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

    @GetMapping("/login")
    login() {
        const token = jwttoken.sign({ foo: 'bar' }, 'shhhhhhared-secret');
        return token;
    }
}