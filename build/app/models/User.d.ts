export declare class User {
    name: string;
    email: string;
    private password;
    constructor(name: string, password: string, email: string);
    verifyPassword(pass: string): boolean;
    static findUser(email: string): void;
}
