import { DiscordPermissons, ErrorResponse, PermissionsTranslate } from "../../../../../util/Constants.js"
import { createWriteStream, readFileSync, rm } from 'fs'
import { ChatInputCommandInteraction } from "discord.js"
import { SaphireClient as client } from "../../../../../classes/index.js"
import { setTimeout as sleep } from "timers/promises"
import { CodeGenerator } from "../../../../../functions/plugins/plugins.js"
import { Emojis as e } from "../../../../../util/util.js"
import axios from "axios"

/**
 * @param { ChatInputCommandInteraction } interaction
*/
export default async interaction => {

    if (!interaction.guild.members.me.permissions.has(DiscordPermissons.ManageEmojisAndStickers, true))
        return interaction.reply({
            content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ManageEmojisAndStickers}\`** para executar este comando.`,
            ephemeral: true
        })

    if (!interaction.member.permissions.has(DiscordPermissons.ManageEmojisAndStickers, true))
        return interaction.reply({
            content: `${e.Deny} | Você precisa da permissão **\`${PermissionsTranslate.ManageEmojisAndStickers}\`** para executar este comando.`,
            ephemeral: true
        })

    let collector = undefined
    const emojisAdded = []

    const embed = {
        color: client.blue,
        title: `${e.plus} ${client.user.username}'s Emoji Add System`,
        description: 'Nada por aqui',
        fields: [
            {
                name: `${e.Info} Estado Atual`,
                value: `${e.Loading} Reaja nesta mensagem com o emoji que você quer neste servidor.`
            }
        ],
        footer: {
            text: '0 emojis adicionados'
        }
    }

    const message = await interaction.reply({ embeds: [embed], fetchReply: true })

    return enableEmojiCollector()

    async function collected(reaction) {

        if (!reaction?.emoji?.url) {
            embed.color = client.red
            embed.fields[0].value = `\n${reaction?.emoji} Este emoji é do Discord, não pode ser adicionado.\n${e.Loading} Por favor, escolha outro.`
            return message.edit({ embeds: [embed] }).catch(() => collector.stop())
        }

        if (reaction.emoji?.guild?.id == interaction.guild.id) {
            embed.color = client.red
            embed.fields[0].value = `\n${reaction.emoji} Este emoji já pertence a este servidor.\n${e.Loading} Por favor, escolha outro.`
            return message.edit({ embeds: [embed] }).catch(() => collector.stop())
        }

        collector.stop("pause")
        embed.color = client.blue
        embed.fields[0].value = `${e.Loading} Analisando e adicionando emoji...`
        await message.edit({ embeds: [embed] }).catch(() => { })

        const { emoji } = reaction
        const format = emoji.url.endsWith('.gif') ? 'gif' : 'png'

        return axios({ method: 'GET', url: emoji.url, responseType: 'stream' })
            .then(async res => {
                const WriteStream = res.data.pipe(createWriteStream(`temp/${CodeGenerator(5)}.${emoji.name}.${format}`))
                await sleep(2000)
                return addEmoji(WriteStream.path, reaction)
            })
            .catch(err => {
                collector.stop()
                embed.color = client.red
                embed.fields[0].value = `${e.Animated.SaphirePanic} Aconteceu algo que não deveria acontecer.\n${e.bug} \`${err}\``
                return message.edit({ embeds: [embed] }).catch(() => { })
            })
    }

    function addEmoji(fileName, reaction) {
        const emojiImage = readFileSync('./' + fileName)
        interaction.guild.emojis.create({
            attachment: emojiImage,
            name: reaction.emoji.name,
            reason: `${interaction.user.username} roubou este emoji`
        })
            .then(emoji => deleteFileAndRestart(emoji, fileName, reaction.emoji.url))
            .catch(err => {
                rm(fileName, () => { })
                embed.color = client.red
                let error = `\`${ErrorResponse[err.code] || err}\``

                if (err.code === 50013)
                    error = `Eu preciso da permissão **\`${PermissionsTranslate.ManageEmojisAndStickers}\`**`

                embed.fields[0].value = `${e.Animated.SaphirePanic} Epa! Deu ruim aqui...\n${e.bug} (${err.code}) ${error}.`
                return message.edit({ embeds: [embed] }).catch(() => { })
            })
        return
    }

    function deleteFileAndRestart(emoji, fileName, emojiUrl) {

        return rm(fileName, err => {

            if (err) {
                embed.color = client.red
                embed.fields[0].value = `${e.Animated.SaphireCry} Não deu certo dentro do meu sistema, mas o emoji foi adicionado.\n${emoji} Emoji adicionado com sucesso. O nome dele é \`:${emoji.name}:\``
                return message.edit({ embeds: [] }).catch(() => { })
            }

            emoji.origin = emojiUrl
            emojisAdded.push(emoji)
            enableEmojiCollector()

            embed.color = client.green
            embed.description = `${emojisAdded.length ? buildList() : 'Nada por aqui'}`.limit('MessageEmbedDescription')
            embed.footer.text = `${emojisAdded.length} emojis adicionados.`
            embed.fields[0].value = `${e.Loading} Reaja nesta mensagem com o emoji que você quer neste servidor.`

            if (message.reactions.cache.size >= 20) return collector.stop("emojisLimitReached")

            return message.edit({ embeds: [embed] }).catch(() => { })
        })
    }

    function buildList() {
        const toBuild = []

        for (const emoji of emojisAdded) {
            const has = toBuild.find(em => em.origin == emoji.origin)

            if (has) {
                has.length++
                continue
            }

            emoji.length = 1
            toBuild.push(emoji)
        }

        const mapped = toBuild.map(emoji => `${emoji} \`:${emoji.name}:\`${emoji.length > 1 ? ` (${emoji.length}x)` : ''}`)
        return mapped.join('\n')
    }

    function ended(reason) {

        if (reason == "pause") return

        if (reason == "emojisLimitReached") {
            embed.color = client.red
            embed.fields[0].value = `${e.Animated.SaphireReading} O limite de emojis na mensagem chegou a 20 e esse é o limite permitido pelo Discord.`
            return message.edit({ embeds: [embed] }).catch(() => { })
        }

        if (reason !== 'idle') return
        embed.color = client.red
        embed.fields[0].value = `${e.Animated.SaphireCry} O tempo limite deste comando acabou.`
        return message.edit({ embeds: [embed] }).catch(() => { })
    }

    function enableEmojiCollector() {
        collector = message.createReactionCollector({
            filter: (_, u) => u.id === interaction.user.id,
            idle: 1000 * 60 * 3
        })
            .on('collect', reaction => collected(reaction))
            .on('end', (_, reason) => ended(reason))
    }
}