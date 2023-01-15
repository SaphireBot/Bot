import { SaphireClient as client } from '../../classes/index.js'

client.on('error', error => {

    const codesToIgnore = [10062, 40060]
    if (codesToIgnore.includes(error.code)) return
    console.log(error)
})

client.on('debug', message => {

    if (message.includes('Heartbeat acknowledged') || message.includes('Sending a heartbeat'))
        return client.Heartbeat++

    return console.log(message)
})