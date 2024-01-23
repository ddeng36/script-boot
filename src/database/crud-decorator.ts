import CacheFactory from '../factory/cache-factory.class';
import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../script-boot';
import BeanFactory from "../bean-factory.class";

const paramMetadataKey = Symbol("param");
const pool = createPool(config('database')).promise();
const resultTypeMap = new Map<string, object>();
const cacheDefinedMap = new Map<string, number>();
const tableVersionMap = new Map<string, number>();
let cacheBean: CacheFactory;


function Insert(sql: string) {
    // 1. replace it's self with a queryFunction(sql)
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Insert -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("insert", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
                log("Table version: " + tableName + ", " + tableVersion);
                log("Table version map: <- ");
                log(tableVersionMap);
            }
            log("Insert result: " + JSON.stringify(result));
            return result.insertId;
        }
    }
}

function Update(sql: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Update/@Delete -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("update", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
                log("Table version: " + tableName + ", " + tableVersion);
                log("Table version map: <- ");
                log(tableVersionMap);
            }
            log("Update result: " + JSON.stringify(result));
            return result.affectedRows;
        }
    }
}
function Delete(sql: string) {
    return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
            if (cacheBean && result.affectedRows > 0) {
                const [tableName, tableVersion] = getTableAndVersion("delete", sql);
                tableVersionMap.set(tableName, tableVersion + 1);
                log("Table version: " + tableName + ", " + tableVersion);
                log("Table version map: <- ");
                log(tableVersionMap);
            }
            return result.affectedRows;
        };
    };
}
function Select(sql: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Select -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
            const resultType = resultTypeMap.get([target.constructor.name, propertyKey].toString());
            if (cacheBean && cacheDefinedMap.has([target.constructor.name, propertyKey].toString())) {
                const [tableName, tableVersion] = getTableAndVersion("select", newSql);
                log("Table version: " + tableName + ", " + tableVersion);
                const cacheKey = JSON.stringify([tableName, tableVersion, newSql, sqlValues]);
                if (cacheBean.get(cacheKey)) {
                    log("Cache hit: " + cacheKey);
                    return cacheBean.get(cacheKey);
                } else {
                    const rows = await actionQuery(newSql, sqlValues, resultType);
                    cacheBean.set(cacheKey, rows, cacheDefinedMap.get([target.constructor.name, propertyKey].toString()));
                    return rows;
                }
            }
            else {
                return await actionQuery(newSql, sqlValues, resultType);
            };
        }
    }
}
function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        log("@Param -> " + target.constructor.name + "." + propertyKey.toString() + "[" + parameterIndex + "] = " + name);
        const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey,);
    };
}

function ResultType(dataClass) {
    return function (target: any, propertyKey: string) {
        resultTypeMap.set([target.constructor.name, propertyKey].toString(), new dataClass());
        log("@ResultType -> " + '{' + target.constructor.name + propertyKey + ': ' + dataClass.name + '}');
    }
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string): Promise<ResultSetHeader> {
    const [newSql, sqlValues] = convertSQLParams(sql, target, propertyKey, args);
    log("Execute SQL: " + newSql);
    log("Execute sqlValues: " + sqlValues);
    return actionExecute(newSql, sqlValues);
}

// For insert, update, delete
async function actionExecute(newSql, sqlValues): Promise<ResultSetHeader> {
    const [result] = await pool.query(newSql, sqlValues);
    log("Execute result: " + JSON.stringify(result));
    return <ResultSetHeader>result;
}
// For select
async function actionQuery(newSql, sqlValues, dataClassType?) {
    const [rows] = await pool.query(newSql, sqlValues);
    if (rows === null || Object.keys(rows).length === 0 || !dataClassType) {
        return rows;
    }
    const records = [];
    for (const rowIndex in rows) {
        const entity = new dataClassType();
        Object.getOwnPropertyNames(entity).forEach((propertyRow) => {
            if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                Object.defineProperty(entity, propertyRow, Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow));
            }
        });
        records.push(entity);
    }
    return records;
}

function convertSQLParams(decoratorSQL: string, target: any, propertyKey: string, args: any[]): [string, any[]] {
    const queryValues = [];
    if (args.length > 0) {
        let argsVal;
        if (typeof args[0] === 'object') {
            argsVal = new Map(Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]));
        } else {
            const existingParameters: [string, number][] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
            log("existingParameters <-" + target.constructor.name + "." + propertyKey + "'s MetaData <-");
            log(existingParameters);
            argsVal = new Map(existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]));
        }
        log(argsVal);
        const regExp = /#{(\w+)}/;
        let match;
        while (match = regExp.exec(decoratorSQL)) {
            log('SQL before match: ' + decoratorSQL);
            const [replaceTag, matchName] = match;
            decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
            log('SQL after match: ' + decoratorSQL);
            queryValues.push(argsVal.get(matchName));
        }
    }
    return [decoratorSQL, queryValues];
}

function Cache(ttl: number) {
    return function (target: any, propertyKey: string) {
        cacheDefinedMap.set([target.constructor.name, propertyKey].toString(), ttl);
        log("@Cache -> " + '{' + target.constructor.name + propertyKey + ': ' + ttl + '}');
        if (cacheBean == null) {
            const cacheFactory = BeanFactory.getBean(CacheFactory);
            if (cacheFactory || cacheFactory['factory']) {
                cacheBean = cacheFactory['factory'];
            }
        }
        log("cacheDefinedMap: <- ");
        log(cacheDefinedMap);
    }
}

function getTableAndVersion(name: string, sql: string): [string, number] {
    const regExpMap = {
        // \s: space
        // \w: word
        // \w`: word with `
        insert: /insert\sinto\s+([\w`\'\"]+)/i,
        update: /update\s+([\w`\'\"]+)/i,
        delete: /delete\sfrom\s+([\w`\'\"]+)/i,
        select: /\s+from\s+([\w`\'\"]+)/i
    }
    const matchs = sql.match(regExpMap[name]);
    if (matchs && matchs.length > 1) {
        const tableName = matchs[1].replace(/[`\'\"]/g, "");
        const tableVersion = tableVersionMap.get(tableName) || 1;
        tableVersionMap.set(tableName, tableVersion);
        log("tableVersionMap: <- ");
        log(tableVersionMap);
        return [tableName, tableVersion];
    } else {
        throw new Error("can not find table name");
    }
}
export { Insert, Update, Delete, Select, Param, ResultType, Cache, actionQuery, actionExecute };