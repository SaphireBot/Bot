import { SaphireClient as client } from "../../classes/index.js";
import { Config } from "../../util/Constants.js";
import { Emojis as e } from "../../util/util.js";

client.on('shardReconnecting', async shardId => {
    return client.pushMessage({
        channelId: Config.statusChannelNotification,
        body: {
            content: `${e.Loading} | Iniciando a reconecção da **Shard ${shardId}**.`
        }
    })
})