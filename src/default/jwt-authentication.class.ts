import { Bean, config,log } from "../script-boot";
import AuthenticationFactory from "../factory/authentication-factory.class";
import express from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import * as jwt from 'jsonwebtoken';
import { Jwt } from "../route.decorate";

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
    
    // @Jwt({ secret: "shhhhhhared-secret", algorithms: ["HS256"] })
    public preHandle(req: express.Request, res: express.Response, next: express.NextFunction): void {
        if(!jwtConfig.ignore.includes(req.path)) {
            log("preHandle")
            const jwtMiddleware = expressjwt(jwtConfig);
            jwtMiddleware(req, res, (err) => {  
                if (err) {
                    next(err);
                }
                // const checkIsUser = checkFromDatabase(req.auth?.user, req.auth?.token);
                // if(checkIsUser){
                //     req["user"] = req.auth?.user;
                // }
            });
        }
        next();
    }
}