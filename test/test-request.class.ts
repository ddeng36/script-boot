import { log } from 'console';
import { GetMapping, PostMapping, RequestBody, RequestForm, RequestQuery, Request, Response, RequestParam } from "../src/route.decorate";
import { Controller } from "../src/script-boot";
import MultiUsers from "./entities/multi-users.class";
import UserDto from "./entities/user-dto.class";


@Controller
export default class TestRequest {

    @GetMapping("/request/res")
    testRes(@Request req, @Response res) {
        res.send("test res");
    }

    @GetMapping("/request/query")
    async testQuery(req, res, @RequestQuery id: number): Promise<MultiUsers> {
        log("id: " + id);
        return Promise.resolve(new MultiUsers("group", [new UserDto(111111, "name"), new UserDto(2, "name")]));
    }

    @PostMapping("/request/body")
    testBody(@Response res, @RequestBody body: UserDto):MultiUsers {
        log("body: " + JSON.stringify(body));
        return new MultiUsers("group", [body]);
    }

    @PostMapping("/request/form")
    testForm(@Response res, @RequestForm("name") name: string) {
        log("form: " + JSON.stringify(name));
        res.send("Got name: " + name);
    }

    @GetMapping("/request/param/:id")
    testParam(@Response res, @RequestParam id: number) {
        log("id: " + id);
        res.send("test param: " + id);
    }
}