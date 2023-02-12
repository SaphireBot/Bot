import uncaughtException from "../modules/errors/process/uncaughtException.js"
import unhandledRejection from "../modules/errors/process/unhandledRejection.js"

process.on('unhandledRejection', error => unhandledRejection(error))

process.on('uncaughtException', (error, origin) => {

    const ignore = ['ERR_IPC_CHANNEL_CLOSED']
    if (ignore.includes(error.code)) return

    return uncaughtException(error, origin)
})

process.on('exit', async code => {
    const reason = {
        1: "Host Disabled Application",
        10: "No host name provided #6815",
        11: "Bot is already online in another host",
        12: "Mongoose Database Connection Failed",
        13: "Cluster has been disconnected."
    }[code] || "Motivo desconhecido"
    console.log(`[${code}] ${reason}`)
})