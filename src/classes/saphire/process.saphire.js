import uncaughtException from "../modules/errors/process/uncaughtException.js"
import unhandledRejection from "../modules/errors/process/unhandledRejection.js"

process.on('unhandledRejection', error => unhandledRejection(error))
process.on('uncaughtException', (error, origin) => uncaughtException(error, origin))

process.on('exit', async exitCode => {
    const reason = {
        10: "No host name provided #6815",
        11: "Bot is already online in another host",
        12: "Mongoose Database Connection Failed",
        1: "Host Disabled Application"
    }[exitCode] || "Motivo desconhecido"
    console.log(`[${exitCode}] ${reason}`)
})