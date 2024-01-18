import { createPool, ResultSetHeader } from 'mysql2';
import { config, log } from '../script-boot';
const pool = createPool(config('database')).promise();

function Insert(sql: string) {
    // 1. replace it's self with a queryFunction(sql)
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Insert -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql);
            log("Insert result: " + JSON.stringify(result));
            return result.insertId;
        }
    }
}

function Update(sql: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Update/@Delete -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const result: ResultSetHeader = await queryForExecute(sql);
            log("Update result: " + JSON.stringify(result));
            return result.affectedRows;
        }
    }
}
function Select(sql: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        log("@Select -> " + target.constructor.name + "." + propertyKey);
        descriptor.value = async (...args: any[]) => {
            const [rows] = await pool.query(sql);
            log("Select result: " + JSON.stringify(rows));
            return rows;
        };
    }
}

async function queryForExecute(sql: string): Promise<ResultSetHeader> {
    const [result] = await pool.query(sql);
    return <ResultSetHeader>result;
}

export { Insert, Update, Update as Delete, Select };