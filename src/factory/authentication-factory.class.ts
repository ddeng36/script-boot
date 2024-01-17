import * as express from 'express';
import { log } from '../script-boot';
export default abstract class AuthenticationFactory {
    public preHandle(req: express.Request, res: express.Response, next: express.NextFunction): void {
        log("AuthenticationFactory preHandle running");
        next();
    }
    public postHandle(req: express.Request, res: express.Response, next: express.NextFunction): void {
        log("AuthenticationFactory postHandle running");
        next();
    }
}