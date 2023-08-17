import { SaphireClient as client } from '../../classes/index.js'
import unhandledRejection from '../../classes/modules/errors/process/unhandledRejection.js'

client.on('error', error => {

    if (
        [
            10062, // Unknown interaction
            40060
        ]
            .includes(error?.code)) return

    return unhandledRejection(error)
})