import Redis from "ioredis";
import {Autowired, Controller, log } from "../src/script-boot";
import { RedisSubscriber } from "../src/default/redis-io.class";
import { GetMapping } from "../src/route.decorate";

@Controller
export default class TestRedis {


    @Autowired
    private redisObj: Redis;

    @RedisSubscriber("mychannel")
    public listen(message) {
        log("Received by Decorator '%s'", message);
    }

    @GetMapping("/redis/publish")
    async redisTest() {
        await this.redisObj.publish("mychannel", "Hello World");
        return "Published!";
    }

}