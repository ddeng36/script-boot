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
        const results = await this.userModel.findAll("1=1");
        res.send("first test");
    }
}
