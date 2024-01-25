import { Bean, config } from "../src/script-boot";
import AuthenticationFactory from "../src/factory/authentication-factory.class";
import express from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import * as jwt from 'jsonwebtoken';

const jwtConfig: {
    secret: jwt.Secret | GetVerificationKey;
    algorithms: jwt.Algorithm[];
    ignore: string[];
} = config("jwt");
export default class JwtAuthentication extends AuthenticationFactory {

    @Bean
    public getJwtAuthentication(): AuthenticationFactory {
        return new JwtAuthentication();
    }

    public preHandle(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if(!jwtConfig.ignore.includes(req.path)) {
            const jwtMiddleware = expressjwt(jwtConfig);
            jwtMiddleware(req, res, (err) => {  
                if (err) {
                    //next(err);
                }
            });
        }
        next();
    }
}