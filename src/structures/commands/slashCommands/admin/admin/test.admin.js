import twitch from '../../../../../functions/update/twitch/manager.twitch.js'

export default async interaction => {

    setInterval(() => {
        twitch.fetcher('https://api.twitch.tv/helix/users?login=alanzoka')
            .then(data => {
                if (!Array.isArray(data)) console.log(data)
                else console.log('Respondido')
            })
    }, 500)

    setInterval(() => {
        twitch.fetcher('https://api.twitch.tv/helix/users?login=alanzoka')
            .then(data => {
                if (!Array.isArray(data)) console.log(data)
                else console.log('Respondido')
            })
    }, 500)

    setInterval(() => {
        twitch.fetcher('https://api.twitch.tv/helix/users?login=alanzoka')
            .then(data => {
                if (!Array.isArray(data)) console.log(data)
                else console.log('Respondido')
            })
    }, 500)

    setInterval(() => {
        twitch.fetcher('https://api.twitch.tv/helix/users?login=alanzoka')
            .then(data => {
                if (!Array.isArray(data)) console.log(data)
                else console.log('Respondido')
            })
    }, 500)

}