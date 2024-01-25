import AuthenticationFactory from "../factory/authentication-factory.class";
import { Bean } from "../script-boot";

export default class DefaultAuthentication extends AuthenticationFactory{
    @Bean
    public getAuthentication(): AuthenticationFactory {
        return new DefaultAuthentication();
    }
}