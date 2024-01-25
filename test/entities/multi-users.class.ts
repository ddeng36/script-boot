import UserDto from "./user-dto.class";

export default class MultiUsers {
    constructor(public group: string, public users: UserDto[]){}
}