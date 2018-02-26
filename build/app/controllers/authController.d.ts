/// <reference types="express" />
import { Response, Request, NextFunction } from "express";
export declare function loginController(req: Request, res: Response, next: NextFunction): void;
export declare function getAuthToken(req: Request, res: Response): void;
