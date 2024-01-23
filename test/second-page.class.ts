import { GetMapping, Jwt, PostMapping, Upload } from "../src/route-mapping.decorate";
import { Controller, log } from "../src/script-boot";
@Controller
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

    @PostMapping("/upload")
    @Upload
    public upload(req, res) {
        const files = req.files;
        log(files);
        res.send("upload success");
    }

    @PostMapping("/form")
    @Jwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] })
    form(req, res) {
        res.render("upload");
    }


    @GetMapping("/second/testError")
    testError(req, res) {
        throw new Error('Test Error');
    }
}