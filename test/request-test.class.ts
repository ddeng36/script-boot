import { log } from 'console';
import { GetMapping, PostMapping, RequestBody, RequestForm, RequestQuery, Request, Response } from "../src/route-mapping.decorate";
import { OnClass } from "../src/script-boot";

@OnClass
export default class TestRequest {
    @GetMapping("/request/res")
    testRes(@Request req, @Response res) {
        res.send("test res");
    }

    @GetMapping("/request/query")
    testQuery(req, res, @RequestQuery id: number) {
        log("id: " + id);
    }
    @GetMapping("/request/param/:id")
    testParam(req, res, @RequestQuery id: number) {
        log("id: " + id);
    }

    @PostMapping("/request/body")
    testBody(req, res, @RequestBody body: object) {
        log("body: " + JSON.stringify(body));
    }

    @PostMapping("/request/form")
    testForm(req, res, @RequestForm("name") name: string) {
        log("form: " + JSON.stringify(name));
    }
}