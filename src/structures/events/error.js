import { SaphireClient as client } from '../../classes/index.js'
import unhandledRejection from '../../classes/modules/errors/process/unhandledRejection.js'

client.on('error', error => {
    const codesToIgnore = [10062, 40060]
    if (codesToIgnore.includes(error.code)) return

    return unhandledRejection(error)
})