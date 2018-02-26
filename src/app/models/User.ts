export class User{


    public name:string;
    public email:string;
    private password:string;

    constructor (name:string,password:string,email:string){
        this.email=email
        this.name=name
        this.password=password
    }
    public verifyPassword(pass:string):boolean{
            return this.password===pass;
    }

    public static findUser(email:string){

    }


}