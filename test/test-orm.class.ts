import { GetMapping, PostMapping } from "../src/route.decorate";
import { Autowired, Controller,Resource } from "../src/script-boot";
import { log } from "console";
import UserModel from "./user-model.class";
@Controller
export default class TestOrm {

    @Resource("user")
    private userModel: UserModel;

    @GetMapping("/orm/first")
    async firstTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.getUsers();
        res.send(results);
    }

    @GetMapping("/orm/one")
    async findOneTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.getUser(req.query.id || 0);
        res.send( results);
    }

    @GetMapping("/orm/delete")
    async deleteTest(req, res) {
        const results = await this.userModel.remove(req.query.id || 0);
        res.send("remove user, results: " + results);
    }

    @GetMapping("/orm/count")
    async countTest(req, res) {
        log(this.userModel);
        const results = await this.userModel.count();
        res.send(results);
    }

    @GetMapping("/orm/new")
    async newUserTest(req, res) {
        const results = await this.userModel.newUsers();
        res.send("new user test, to " + results);
    }

    @GetMapping("/orm/page/calculate")
    async calculatePage(req, res) {
        const pages = this.userModel.pager(15, 376);
        log(pages);
        res.send("pages calculate result: " + JSON.stringify(pages));
    }

    @GetMapping("/orm/pages/:id")
    async findPage(req, res) {
        const results = await this.userModel.findAll("1", { id: -1 }, "*", { page: req.query.id, pageSize: 3 });
        log(results);
        log(this.userModel.page);
        res.send("pages find result: " + JSON.stringify(results));
    }

    @PostMapping("/orm/edit")
    async updateTest(req, res) {
        log(req.body);
        const results = await this.userModel.editUser(req.body.id, req.body.name);
        res.send(results);
    }

}