import { Bean } from "../script-boot";
import LogFactory from "../factory/log-factory.class";

export default class LogDefault implements LogFactory {
  @Bean
  createLog(): LogFactory {
    return new LogDefault();
  }

  public log(message?: any, ...optionalParams: any[]): void {
    console.log("Defalt log: " + message);
  }
}
