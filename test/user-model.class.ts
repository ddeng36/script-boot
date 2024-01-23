import { Resource, Controller,log } from "../src/script-boot";
import Model from "../src/database/orm-decorator";
import { GetMapping } from "../src/route-mapping.decorate";

@Controller
export default class UserModel extends Model{
    @Resource("user")
    private userModel: UserModel;

    @GetMapping("/orm/first")
    async firstTest(req, res) {
        log("userModel: <- ");
        log(this.userModel);
        const result = await this.userModel.findAll({id:1, "user_id":{$lt:10}});
        log("result: <- ");
        log(result);
        res.send(result);
    }
}