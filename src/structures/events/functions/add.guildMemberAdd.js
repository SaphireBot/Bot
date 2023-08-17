import { GuildMember } from "discord.js"
import { replacePlaceholder } from "../../../functions/plugins/plugins.js"
import { SaphireClient as client } from "../../../classes/index.js"

/**
 * @param { GuildMember } member
 */
export default (member, data) => {

    if (!data.body) return

    const body = {
        content: replacePlaceholder(data.body.content, member) || null,
        embeds: data.body.embeds || []
    }

    if (body.embeds[0]) {
        body.embeds[0].description = replacePlaceholder(body.embeds[0]?.description, member)
        body.embeds[0].title = replacePlaceholder(body.embeds[0]?.title, member)
        if (body.embeds[0]?.footer?.text)
            body.embeds[0].footer.text = replacePlaceholder(body.embeds[0]?.footer?.text, member)
    }

    body.channelId = data.channelId
    body.LogType = 'WelcomeChannel'
    body.method = 'post'
    body.guildId = member.guild.id
    client.pushMessage({
        channelId: data.channelId,
        LogType: 'WelcomeChannel',
        method: 'post',
        guildId: member.guild.id,
        body
    })

    return
}   