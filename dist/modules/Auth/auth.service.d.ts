import { Connection } from 'jsforce';
export declare class AuthService {
    private conn2;
    private oauth2;
    connections: Map<string, Connection>;
    constructor();
    salesforceOauth2(req: any, res: any): Promise<void>;
    getAccessToken(req: any, response: any): Promise<void>;
    getConnection(userId: string): Promise<any>;
    getalldata(connection: Connection): Promise<any>;
    GenerageDocxFile(body: any): Promise<void>;
}
