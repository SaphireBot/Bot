import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { channel } = interaction
    await Database.Cache.Running.pull(`${client.shardId}.Channels`, channel.id)

    return await interaction.update({
        content: `${e.Check} | Canal resetado com sucesso.`,
        components: []
    }).catch(() => { })
}