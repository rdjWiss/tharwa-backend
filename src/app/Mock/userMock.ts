import {User} from '../models/User'

export const tabUser=[
    new User('djamel','dahmane','ed_dahmane@esi.dz'),
    new User('test1','test1','test1@gmail.com'),
    new User('test2','test2','test2@gmail.com'),
    new User('test3','test3','test3@gmail.com'),
    new User('test4','test4','test4@gmail.com'),
    new User('test5','test5','test5@gmail.com'),
    new User('test6','test6','test6@gmail.com'),
    new User('test7','test7','test7@gmail.com'),
    new User('test8','test8','test8@gmail.com'),

]
export function findOne(email:string){
    tabUser.forEach(element => {
        if(element.email ===email) return element;

    });
    return null;
}