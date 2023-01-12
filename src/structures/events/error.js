import { SaphireClient as client } from '../../classes/index.js'

client.on('error', error => {

    if (error.code === 10062)
        return
    console.log(error)
})

client.on('debug', message => {

    if (message.includes('Heartbeat acknowledged') || message.includes('Sending a heartbeat'))
        return client.Heartbeat++

    return console.log(message)
})