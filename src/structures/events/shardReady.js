import {
    SaphireClient as client
} from "../../classes/index.js";
import { Emojis as e } from "../../util/util.js";

client.on('shardReady', async shardId => {

    return await client.sendWebhook(
        process.env.WEBHOOK_STATUS,
        {
            username: '[Saphire] Connection Status',
            content: `${e.Check} | A **Shard ${shardId}** está online.`
        }
    ).catch(() => { })

})