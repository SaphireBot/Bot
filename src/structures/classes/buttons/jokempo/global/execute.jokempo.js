import { ButtonStyle, StringSelectMenuInteraction } from "discord.js"
import { SaphireClient as client, Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import { setTimeout as sleep } from 'node:timers/promises'

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { { value: number } } commandData
 */
export default async (interaction, commandData) => {

    let { message, user, guild } = interaction

    if (user.id != message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | Você não pode usar ele comando, sabia? Que tal você mesmo usar o \`/jokempo global\`?`,
            ephemeral: true
        })

    const { value } = commandData

    await interaction.update({ content: `${e.Loading} | Validando e buscando dados globais...`, components: [], embeds: [] }).catch(() => { })

    let jokempo = undefined

    const MoedaCustom = await guild.getCoin()
    const globalActive = await Database.Cache.Jokempo.get('Global') || {}
    const values = Object.entries(globalActive).filter(data => data[1]?.userId == user.id)

    if (values.length > 0) {
        jokempo = values[0][1]
        message.edit({ content: `${e.Loading} | Encontrei uma aposta global não finalizada... Recalculando dados...` })
            .catch(err => revert(err))

        const messageUrl = await client.getMessageUrl(jokempo?.channelId, values[0][0])
        if (messageUrl) return hasGameOpen(messageUrl, values[0][0])

        await Database.Cache.Jokempo.delete(`Global.${values[0][0]}`)
        await sleep(3000)
    } else {
        const jokempos = await Database.Jokempo.find({ value }) || []
        jokempo = jokempos.filter(jkp => jkp?.creatorId !== user.id)[0]
    }

    if (!jokempo)
        return message.edit({
            content: `${e.DenyX} | Nenhum jokempo global foi encontrado no valor **${value.currency()} ${MoedaCustom}**.\n${e.Info} | Se apareceu algum Jokempo disponível, provavelmente é o seu.`,
            ephemeral: true
        }).catch(() => { })

    const betUser = await client.getUser(jokempo.creatorId)
    if (!betUser) return userNotFound()

    if (!jokempo.userId) {
        const userData = await Database.getUser(user.id)
        const balance = userData?.Balance || 0
        if (balance < value)
            return message.edit({
                content: `${e.DenyX} | Você não tem dinheiro suficiente para apostar no jokempo global na categoria de **${value} ${MoedaCustom}**.`,
                ephemeral: true
            }).catch(() => { })
    }

    return tradeGlobalJokempo().catch(err => revert(err))

    async function userNotFound() {

        const content = `${e.Animated.SaphireCry} | O usuário da aposta do Jokempo Global \`${jokempo?.id || '0'}\` não foi encontrado.\n${e.Info} | Aposta removida do escopo global. Por favor, tente novamente e desculpe o incomodo.`
        message.edit({ content }).catch(() => message.channel.send({ content }).catch(() => { }))

        await Database.User.findOneAndUpdate(
            { id: jokempo.creatorId },
            {
                $inc: {
                    Balance: jokempo.value || 0
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Reembolso de ${jokempo.value?.currency()} Safiras no *Jokempo Global User Not Found*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))
        await Database.Jokempo.deleteOne({ id: jokempo.id })
        return
    }

    async function tradeGlobalJokempo() {
        await Database.Jokempo.deleteOne({ id: jokempo.id })
        await Database.Cache.Jokempo.set(`Global.${message.id}`, {
            id: jokempo.id,
            value: jokempo.value,
            webhookUrl: jokempo.webhookUrl,
            creatorId: jokempo.creatorId,
            creatorOption: jokempo.creatorOption,
            channelOrigin: jokempo.channelOrigin,
            userId: user.id,
            channelId: message.channel.id
        })

        if (!jokempo.userId) {
            await Database.User.findOneAndUpdate(
                { id: user.id },
                {
                    $inc: {
                        Balance: -jokempo.value || 0
                    },
                    $push: {
                        Transactions: {
                            $each: [{
                                time: `${Date.format(0, true)}`,
                                data: `${e.loss} Apostou ${jokempo.value?.currency()} Safiras no *Jokempo Global*`
                            }],
                            $position: 0
                        }
                    }
                },
                { upsert: true, new: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

        }
        await sleep(2000)
        return sendMessage()
    }

    async function sendMessage() {
        return message.edit({
            content: `${e.Loading} | Muito bem. Você está apostando **${value.currency()} ${MoedaCustom}** contra **${betUser.tag} - \`${betUser.id}\`**\n${e.Info} | Qual é a sua jogada?`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: e.pedra,
                            custom_id: JSON.stringify({ c: 'jkp', type: 'play', play: 'stone', id: message.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            emoji: e.tesoura,
                            custom_id: JSON.stringify({ c: 'jkp', type: 'play', play: 'scissors', id: message.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            emoji: e.papel,
                            custom_id: JSON.stringify({ c: 'jkp', type: 'play', play: 'paper', id: message.id }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(err => revert(err))
    }

    async function revert(err) {
        await Database.Cache.Jokempo.delete(`Global.${message.id}`)
        delete jokempo.userId
        delete jokempo.channelId
        new Database.Jokempo(jokempo).save()

        await Database.User.findOneAndUpdate(
            { id: user.id },
            {
                $inc: {
                    Balance: jokempo.value || 0
                },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Reembolso de ${jokempo.value?.currency()} Safiras no *Jokempo Global Error*`
                        }],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

        return interaction.channel.send({ content: `${e.DenyX} | Não foi possível iniciar a aposta. Valores devolvidos.\n${e.bug} | \`${err}\`` }).catch(() => { })
    }

    async function hasGameOpen(messageUrl, messageId) {
        message.delete().catch(() => { })
        return message.channel.send({
            content: `${e.Info} | ${user}, você já tem uma aposta global em aberto.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Jogar',
                            emoji: '🖇️',
                            url: messageUrl,
                            style: ButtonStyle.Link,
                        },
                        {
                            type: 2,
                            label: 'Desativar',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'jkp', type: 'disabled', messageId: messageId }),
                            style: ButtonStyle.Danger
                        }
                    ]
                }
            ]
        })
    }

}