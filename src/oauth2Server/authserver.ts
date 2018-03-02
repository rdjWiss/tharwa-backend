export interface authRequest{
    grant_type:string,
    username:string,
    password:string,
    client_id:string,
    client_secret:string,
    scope:string[],
}


export interface accesTokenResponse{
    access_token:string,
    refresh_token:string,
    token_type:string,
    expires_in:number,
    scope:string,
    user:object
}

export const errorMsg=function(code,desc):JSON{
        return JSON.parse(`{
            error:`+code+`,
            error_description:`+desc+`
        }`)
}