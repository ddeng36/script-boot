import { bean, onClass } from "../src/speed";
import LogFactory from "./log-factory.class";

export default class LogDefault implements LogFactory {
  @bean
  createLog(): LogFactory {
    return new LogDefault();
  }

  public log(message?: any, ...optionalParams: any[]): void {
    console.log("Defalt log: " + message);
  }
}
