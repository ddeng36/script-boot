import DataSourceFactory from "../factory/data-source-factory.class";
import { Bean, config } from "../script-boot";
import { createConnection, createPool } from "mysql2";

export default class ReadWriteDB extends DataSourceFactory {
    private readonly readSession;
    private readonly writeSession;

    @Bean
    public getDataSource(): DataSourceFactory {
        return new ReadWriteDB();
    }

    constructor() {
        super();
        const dbConfig = config("database");
        if (dbConfig["master"] && dbConfig["slave"]) {
            // Master-slave connection
            // Use master connection to write
            this.writeSession = this.getConnectionByConfig(dbConfig["master"]);
            // Use slave connection to read
            if (Array.isArray(dbConfig["slave"])) {
                this.readSession = dbConfig["slave"].map(config => { return this.getConnectionByConfig(config); });
            } else {
                // turn it into array
                this.readSession = [this.getConnectionByConfig(dbConfig["slave"])];
            }
        } else {
            // Only one connection
            this.readSession = this.getConnectionByConfig(dbConfig);
            this.writeSession = [this.readSession];
        }
    }

    private getConnectionByConfig(config: object) {
        if (config["PoolOptions"] !== undefined) {
            // Use pool
            if (Object.keys(config["PoolOptions"]).length !== 0) {
                config = Object.assign(config, config["PoolOptions"]);
            }
            return createPool(config).promise();
        } else {
            // Use connection, don't need to create pool
            return createConnection(config).promise();
        }
    }

    public readConnection() {
        // Randomly choose one
        return this.readSession[Math.random() * this.readSession.length]
    }
    public writeConnection() {
        return this.writeSession;
    }

}