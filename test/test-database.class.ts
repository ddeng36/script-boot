import { log } from "console";
import { Delete, Insert, Param, Select, Update, ResultType, Cache } from "../src/database.decorator";
import { GetMapping, RequestQuery,Response } from "../src/route.decorate";
import { Autowired, Controller, config, getBean } from "../src/script-boot";
import UserDto from "./entities/user-dto.class";
import CacheFactory from "../src/factory/cache-factory.class";
import { createPool, ResultSetHeader, RowDataPacket } from 'mysql2';
import DataSourceFactory from "../src/factory/data-source-factory.class";

@Controller
export default class TestDatabase {
    @Autowired
    private cacheBean: CacheFactory;

    // http://localhost:8080/sql/injection?username=zzz&password=123' or '1'='1
    @GetMapping("/db/injection")
    async selectSql(@RequestQuery username, @RequestQuery password, @Response res) {
        const sql = "Select * from `check_user` where `username` = '" + username + "' and `password` = '" + password + "'";
        log("test sql: " + sql);
        const writeConnection = await getBean(DataSourceFactory).writeConnection();
        const [rows] = await writeConnection.query(sql);
        if ((rows as RowDataPacket[]).length == 0) {
            res.send("fail");
        } else {
            res.send("success! " + rows[0].name);
        }
    }
    @GetMapping("/db/prevent-injection")
    async selectSql3(@RequestQuery name, @RequestQuery id, @Response res) {
        const result = await this.selectSql2(name, id);
        log("test sql: " + result);
        res.send(result);
    }


    @GetMapping("/db/insert")
    async insert(req, res) {
        const id = req.query.id || 1;
        const newId = await this.addRow("new name " + id, id);
        log("Insert newId: " + newId);
        res.send("Insert success");
    }

    @GetMapping("/db/insertObject")
    async insertByObject(req, res) {
        const newId = await this.addRowByObject({
            "id": 31,
            "name": "newname2"
        })
        log("Insert newId: " + newId);
        res.send("Insert success");
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

    @GetMapping("/db/select1")
    async selectById(req, res) {
        const row = await this.findRow(req.query.id || 2);
        log("select rows: " + row);
        res.send(row);
    }
    @GetMapping("/db/select-user")
    async selectUser(req, res) {
        const users: UserDto[] = await this.findUsers();
        log("select users: ->");
        log(users);
        res.send(users);
    }

    @GetMapping("/db/set-cache")
    testCache(req, res) {
        this.cacheBean.set("test", req.query.value || "test");
        res.send("set cache");
    }

    @GetMapping("/db/get-cache")
    getCache(req, res) {
        const value = this.cacheBean.get("test");
        res.send(value);
    }

    @Select("Select * from `user` where `name` = #{name} and `id` = #{id}")
    private async selectSql2(@Param("name") name: string, @Param("id") id: string) { }

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRow(@Param("name") newName: string, @Param("id") id: number) { }

    @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
    private async addRowByObject(myParams: object) { }

    @Update("Update `user` set name = 'test2' where id = 1")
    private async updateRow() { }

    @Delete("Delete from `user` where id = 2")
    private async deleteRow() { }

    @Select("Select * from `user`")
    private async selectRow() { }

    @Cache(1800)
    @Select("Select * from `user` where id = #{id}")
    private async findRow(@Param("id") id: number) { }

    @ResultType(UserDto)
    @Select("Select * from `user`")
    private findUsers(): UserDto[] { return; }
}