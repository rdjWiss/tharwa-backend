export interface authRequest{
    grant_type:string,
    username:string,
    password:string,
    client_id:string,
    client_secret:string,
    scope:string[],
}


export interface accesTokenResponse{
    verification_token:string,
    access_token:string,
    refresh_token:string,
    token_type:string,
    expires_in:number,
    scope:string,
    user:object
}

export const errorMsg=function(code:any,desc:any):JSON{
        return JSON.parse(`{
            error:`+code+`,
            error_description:`+desc+`
        }`)
}