export interface authRequest{
    grant_type:string,
    username:string,
    password:string,
    client_id:string,
    client_secret:string,
    scope:string[],
}


export interface accesTokenResponse{
    code_pin:string,
    access_token:string,
    refresh_token:string,
    token_type:string,
    expires_in:number,
    scope:string,
    user:object,
    comptes:Array<object>
}

export const errorMsg=function(code:any,desc:any):JSON{
        return JSON.parse(`{
            error:`+code+`,
            error_description:`+desc+`
        }`)
}