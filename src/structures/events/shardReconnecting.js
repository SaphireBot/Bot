import {
    SaphireClient as client
} from "../../classes/index.js";
import { Emojis as e } from "../../util/util.js";

client.on('shardReconnecting', async shardId => {

    return await client.sendWebhook(
        process.env.WEBHOOK_STATUS,
        {
            username: '[Saphire] Connection Status',
            content: `${e.Loading} | Iniciando a reconecção da **Shard ${shardId}**.`
        }
    ).catch(() => { })

})