import {
    SaphireClient as client,
    Database
} from '../../classes/index.js'
import { Config as config } from '../../util/Constants.js'
import { Emojis as e } from '../../util/util.js'

client.on('giveawayStart', async giveaway => {

    const { guildId } = giveaway
    const guild = await client.guilds.fetch(guildId)

})