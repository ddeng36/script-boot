import { Delete, Insert, Select, Update } from "../src/database/query-decorator";
import { GetMapping } from "../src/route-mapping.decorate";
import { OnClass } from "../src/script-boot";

@OnClass
export default class TestDatabase {
    @GetMapping("/db/insert")
    async insert(req, res) {
        this.addRow();
        await res.send("Insert");
    }
    @GetMapping("/db/update")
    async update(req, res) {
        this.updateRow();
        await res.send("Update");
    }
    @GetMapping("/db/delete")
    async delete(req, res) {
        this.deleteRow();
        await res.send("Delete");
    }

    @GetMapping("/db/select")
    async select(req, res) {
        const rows = await this.selectRow();
        await res.json(rows);
    }


    @Insert("Insert into `user` (name) values ('test')")
    private async addRow() { }
    @Update("Update `user` set name = 'test2' where id = 1")
    private async updateRow() { }
    @Delete("Delete from `user` where id = 1")
    private async deleteRow() { }
    @Select("Select * from `user`")
    private async selectRow() { }
}