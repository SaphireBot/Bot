import { SaphireClient as client } from '../../classes/index.js'
import unhandledRejection from '../../classes/modules/errors/process/unhandledRejection.js'

client.on('error', error => {

    const codesToIgnore = [10062, 40060]
    if (codesToIgnore.includes(error.code)) return

    unhandledRejection(error)
    console.log(error)
})

client.on('shardError', async (error, shardId) => {

    if (error.code == 'ShardingReadyDied')
        return console.log(`A shard ${shardId} foi de comes e bebes antes de ligar.`)

    return console.log(error)
})