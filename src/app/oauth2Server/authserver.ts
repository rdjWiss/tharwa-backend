export interface authRequest{
    grant_type:string,
    username:string,
    password:string,
    client_id:string,
    client_secret:string,
    scope:string[],
}


export interface accesTokenResponse{
    acces_token:string,
    refresh_token:string,
    token_type:string,
    expires_in:string,
    state:number,
    scope:string[],
}