import { User } from "../../classes/database/Models.js"

export default async () => {

    const users = await User.find({})
    return users

}