import twitch from '../../../../../functions/update/twitch/manager.twitch.js'

export default async interaction => {

    setInterval(() => request(), 500)
    setInterval(() => request(), 500)
    setInterval(() => request(), 500)
    setInterval(() => request(), 500)
    setInterval(() => request(), 500)
    setInterval(() => request(), 500)

    function request() {
        twitch.fetcher('https://api.twitch.tv/helix/users?login=alanzoka')
            .then(data => {
                if (!Array.isArray(data)) console.log(data)
                else console.log('Respondido')
            })
    }

}