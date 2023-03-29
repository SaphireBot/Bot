// import axios from "axios"
// import { WebSocket } from "ws"
// import { Emojis as e } from "../../util/util.js"
// import { SaphireClient as client } from "../index.js"

// const socketClass = class Socket extends WebSocket {
//     constructor(shardId) {
//         super(process.env.WEBSOCKET_URL, {
//             headers: {
//                 authorization: process.env.WEBSOCKET_CONNECTION_AUTHORIZATION,
//                 shardid: shardId
//             }
//         })
//     }

//     static connectionInterval = undefined

//     enableListeners() {

//         this
//             .on("close", (code, reason) => this.event_close(code, reason))
//             .on('open', () => console.log("[WEBSOCKET-open] Connection was made successfully."))
//             .on('message', message => console.log(`[WEBSOCKET-message] ${message}`))
//             .on('error', error => console.log(`[WEBSOCKET-error] Novo erro detectado\n${error.stack}`))
//             .on('ping', data => console.log(`[WEBSOCKET-ping] ${data.toString()}`))
//             .on('pong', data => console.log(`[WEBSOCKET-pong] ${data.toString()}`))
//             .on('unexpected-response', (request, response) => this.unexpected_response(request, response))
//     }

//     async event_close(code, reason) {

//         const error = reason.toJSON()

//         if (error.data === [] || !error.data || [1006].includes(code)) return
        
//         console.log(`[WEBSOCKET-close] (${code}) - ${reason.toString()}`)

//         if (reason.syscall == "connect") {

//             await axios({
//                 url: process.env.WEBHOOK_STATUS,
//                 method: 'POST',
//                 data: {
//                     content: `${e.bug} | Não foi possível conectar ao Websocket da API. Tentando reconexão...\n📝 | Error Code: \`${code}\``,
//                     username: '[SAPHIRE] Saphire Connection Failed'
//                 }
//             })
//                 .catch(err => console.log(err))

//             return tryReconnect(reason)
//         }

//         console.log("[SAPHIRE] Tentando nova conexão com o Websocket...")
//         return
//     }

//     unexpected_response(request, response) {
//         console.log('[WEBSOCKET-unexpected-response]')
//         console.log(request.headersSent)
//         console.log(response.headers)
//         return
//     }

// }

// export default socketClass

// function tryReconnect(reason) {
//     console.log(reason.toString())
//     socketClass.connectionInterval = setTimeout(() => {
//         client.socket = new socketClass(client.shardId).enableListeners()
//     }, 15000)
//     return
// }