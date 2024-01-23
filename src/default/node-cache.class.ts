import { Bean, Value } from "../script-boot";
import CacheFactory from "../factory/cache-factory.class";
import * as cache from "node-cache";

export default class NodeCache extends CacheFactory {
    private NodeCache: any;
    private nodeCacheOptions;

    @Value("cache")
    private config: object;

    constructor() {
        super();
        this.nodeCacheOptions = this.config || { stdTTL: 3600};
        this.NodeCache = new cache();
    }

    @Bean
    public getCache(): CacheFactory {
        return new NodeCache();
    }

    public get(key: string) {
        return this.NodeCache.get(key);
    }
    public set(key: string, value: any, expire?: number): void {
        this.NodeCache.set(key, value, expire || this.nodeCacheOptions["stdTTL"]);
    }
    public del(key: string): void {
        this.NodeCache.del(key);
    }
    public has(key: string): boolean {
        return this.NodeCache.has(key);
    }
    public flush(): void {
        this.NodeCache.flushAll();
    }

}