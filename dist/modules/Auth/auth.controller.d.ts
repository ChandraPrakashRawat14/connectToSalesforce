import { AuthService } from "./auth.service";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    salesforceOauth2(req: any, res: any): Promise<void>;
    getAccessToken(req: any, res: any): Promise<void>;
    GenerateReport(body: any): Promise<void>;
}
