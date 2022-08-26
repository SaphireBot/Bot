import { DiscloudApp } from 'discloud.app'

export default new class Discloud extends DiscloudApp {
    constructor() {
        super({ token: process.env.DISCLOUD_API_TOKEN })
    }

    login() {
        return super.login()
            .then(() => 'Discloud Api Logged')
            .catch(() => 'Discloud Host Not Connected')
    }

}