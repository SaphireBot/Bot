import { discloud } from 'discloud.app'
import('dotenv/config')

discloud.login()
    .catch(err => {
        console.log(err)
        return 'Discloud Host Not Connected'
    })