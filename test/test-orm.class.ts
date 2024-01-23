import { GetMapping } from "../src/route-mapping.decorate";
import { Inject, Controller } from "../src/script-boot";
import { log } from "console";
import UserModel from "./user-model.class";
@Controller
export default class TestOrm {
    @Inject
    private userModel: UserModel;

    @GetMapping("/orm/first")
    async firstTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.findAll({id:1, "user_id":{$lt:10}});
        log(results);
        res.send("first test");
    }
}
