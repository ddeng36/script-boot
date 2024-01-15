import { GetMapping } from "../src/route-mapping.decorate";
import { OnClass } from "../src/script-boot";

@OnClass
export default class SecondPage {
    @GetMapping("/second/setCookie")
    setCookiePage(req, res) {
        res.cookie("name", "express");
        return "set cookie success";
    }

    @GetMapping("/second/getCookie")
    getCookiePage(req, res) {
        return "Cookie: " + req.cookies.name;
    }

    @GetMapping("/second/testSession")
    testForSession(req, res) {
        req.session.view = req.session.view ? req.session.view + 1 : 1;
        return "Request session view: " + req.session.view;
    }
}