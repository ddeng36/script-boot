import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../script-boot';
const paramMetadataKey = Symbol("param");
const pool = createPool(config('database')).promise();
const resultTypeMap = new Map<string, object>();

function Insert(sql: string) {
    // 1. replace it's self with a queryFunction(sql)
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Insert -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql, args, target, propertyKey);
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
            log("Update result: " + JSON.stringify(result));
            return result.affectedRows;
        }
    }
}
function Select(sql: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Select -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            let newSql = sql;
            let sqlValues = [];
            if (args.length > 0) {
                [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
            }
            const [rows] = await pool.query(newSql, sqlValues);
            log("Select SQL: " + newSql);
            log("Select sqlValues: " + sqlValues);
            log("Select result: " + JSON.stringify(rows));

            if (Object.keys(rows).length === 0) {
                return;
            }

            const records = [];
            const resultType = resultTypeMap.get(
                [target.constructor.name, propertyKey].toString(),
            );
            for (const rowIndex in rows) {
                // !!! Important !!!
                // We have to create a new object by Object.create() to avoid the same reference, even if we have new object in @ResultType.
                const entity = Object.create(resultType);
                Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
                    if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                        Object.defineProperty(
                            entity,
                            propertyRow,
                            Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow),
                        );
                    }
                });
                records.push(entity);
            }
            return records;
        };
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
        log("@ResultType -> " + '{' + target.constructor.name + propertyKey +': ' + dataClass.name + '}');
    }
}

async function queryForExecute(sql: string, args: any[], target, propertyKey: string): Promise<ResultSetHeader> {
    let sqlValues = [];
    let newSql = sql;
    if (args.length > 0) {
        [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
    }
    log("newSql: " + newSql);
    log("sqlValues: " + sqlValues);
    const [result] = await pool.query(newSql, sqlValues);
    return <ResultSetHeader>result;
}
    
function convertSQLParams(args: any[], target: any, propertyKey: string, decoratorSQL: string,): [string, any[]] {
    const queryValues = [];
    let argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(
            Object.getOwnPropertyNames(args[0]).map((valName) => [valName, args[0][valName]]),
        );
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
    return [decoratorSQL, queryValues];
}

export { Insert, Update, Update as Delete, Select, Param, ResultType };