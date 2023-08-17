import { ButtonStyle, parseEmoji } from 'discord.js'
import { Database, SaphireClient as client } from '../../classes/index.js'

client.on('messageUpdate', async (oldMessage, newMessage) => {

    if (!newMessage || !newMessage.id || newMessage?.author?.bot) return
    if (!oldMessage || !oldMessage.id || newMessage?.author?.bot) return

    if (oldMessage.partial || newMessage.partial) {
        newMessage = await newMessage.fetch().catch(() => null)
        oldMessage = await oldMessage.fetch().catch(() => null)
    }

    if (!newMessage || !oldMessage) return

    const oldContent = oldMessage?.content
    const newContent = newMessage?.content

    const isEdited = oldContent !== newContent
    if (!isEdited || !oldContent?.length || !newContent?.length) return

    const { guild, author, type } = newMessage
    if (type !== 0) return

    // const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    const guildData = await Database.getGuild(guild.id)
    if (!guildData || !guildData.LogSystem?.channel || !guildData.LogSystem?.messages?.active) return

    const embeds = [{
        color: client.blue,
        title: "Dados da mensagem editada",
        description: `Esta mensagem foi editada no canal ${newMessage.channel}`,
        fields: [
            {
                name: '👤 Quem editou?',
                value: `- ${author?.username || "Not Found"} - \`${author?.id}\`\n- ${Date.Timestamp()}`
            }
        ]
    }]

    if (oldContent) {
        if (oldContent?.length <= 1018)
            embeds[0].fields.push({
                name: '📝 Conteúdo Antigo',
                value: `\`\`\`${oldContent?.slice(0, 1018)}\`\`\``
            })
        else embeds.push({
            color: client.blue,
            title: '📝 Conteúdo Antigo',
            description: `\`\`\`${oldContent?.slice(0, 4090)?.limit('MessageEmbedDescription')}\`\`\``
        })
    }

    if (newContent) {
        if (newContent?.length <= 1018)
            embeds[0].fields.push({
                name: '📝 Conteúdo Novo',
                value: `\`\`\`${newContent?.slice(0, 1018)}\`\`\``
            })
        else embeds.push({
            color: client.blue,
            title: '📝 Conteúdo Novo',
            description: `\`\`\`${newContent?.slice(0, 4090)}\`\`\``.limit('MessageEmbedDescription')
        })
    }

    return client.pushMessage({
        channelId: guildData.LogSystem?.channel,
        method: 'post',
        guildId: guild.id,
        LogType: 'messages',
        body: {
            channelId: guildData.LogSystem?.channel,
            method: 'post',
            guildId: guild.id,
            LogType: 'messages',
            content: `🛰️ | **Global System Notification** | Message Edited`,
            embeds,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: "Ir até a mensagem",
                        emoji: parseEmoji('📎'),
                        url: newMessage.url,
                        style: ButtonStyle.Link
                    }
                ]
            }]
        }
    })

})