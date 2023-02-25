import axios from "axios"
import { WebSocket } from "ws"
import { Emojis as e } from "../../util/util.js"
console.log(process.env.WEBSOCKET_CONNECTION_AUTHORIZATION)

export default class Socket extends WebSocket {
    constructor(shardId) {
        super(process.env.WEBSOCKET_URL, {
            headers: {
                authorization: process.env.WEBSOCKET_CONNECTION_AUTHORIZATION,
                shardid: shardId
            },

        })
    }

    enableListeners() {

        this
            .on("close", async (code, reason) => {

                if (reason.syscall == "connect") {
                    console.log(reason.toString())
                    await axios({
                        url: process.env.WEBHOOK_STATUS,
                        method: 'POST',
                        data: {
                            content: `${e.bug} | Não foi possível conectar ao Websocket da API. Inicialização cancelada.\n📝 | Error Code: \`${code}\``,
                            username: 'Saphire Connection Failed'
                        }
                    })
                        .catch(err => console.log(err))

                    return process.exit(1)
                }

                return console.log(reason.toString())
            })
            .on('open', () => console.log("[WEBSOCKET] Connection was made."))
            .on('message', (message) => console.log(message.toString()))
            .on('error', error => console.log(error))
    }

}