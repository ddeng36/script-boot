import { Resource, Controller, log } from "../src/script-boot";
import { Model } from "../src/database.decorator";
import UserDto from "./entities/user-dto.class";

@Controller

export default class UserModel extends Model {

    async getUsers() {
        const users = await this.findAll({
            id: { $lt: 10, $lte: 20 }, "name": { $like: "test" },
            $or: [{ id: 1 }, { id: 2 }]
        },{
            name: "asc"
        });
        log("users", users);
        return "getUsers";
    }

    async getUser(id: number) {
        const user = await this.find({ id: id }, "");
        log("user", user);
        return "getUser";
    }

    async newUsers() {
        const users = await this.create([
            new UserDto(30, "UserDto 30"),
            new UserDto(31, "UserDto 31"),
            { id: 33, name: "UserDto 33" }
        ]);
        return "newUsers";
    }

    async remove(id: number) {
        const result = await this.delete({ id: id });
        return "remove rows: " + result;
    }

    async count() {
        const result = await this.findCount("1");
        return "we had users : " + result;
    }

    async editUser(id: number, name: string) {
        const result = await this.update({ id: id }, { name: name });
        return "edit user: " + result;
    }
}