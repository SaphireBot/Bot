import { StringSelectMenuInteraction, WebhookClient } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { CodeGenerator } from "../../../../../functions/plugins/plugins.js"
import { Emojis as e } from "../../../../../util/util.js"
import { setTimeout as sleep } from 'node:timers/promises'
import { Config } from "../../../../../util/Constants.js"
import getWebhookURL from "./webhook.jokempo.js"
import { socket } from "../../../../../websocket/websocket.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { { option: "stone" | "paper" | "scissors", value: number } } commandData
 */
export default async (interaction, commandData) => {

    const { user, guild, channel } = interaction
    const MoedaCustom = await guild.getCoin()
    const { value, option } = commandData

    await interaction.update({
        content: `${e.Loading} | Autenticando validadores...`,
        embeds: [], components: []
    }).catch(() => { })

    const webhookUrl = await getWebhookURL(channel.id)
    await sleep(2000)

    if (!webhookUrl) {
        const channelPermissions = channel.permissionsFor(client.user, true)
        const permissions = channelPermissions.serialize()
        if (!permissions.ManageWebhooks)
            return interaction.update({
                content: `${e.DenyX} | Eu não tenho a permissão **Gerenciar Webhooks**. Eu preciso desta permissão para configurar as Webhook responsável por te avisar sobre suas apostas.`,
                embeds: [], components: []
            }).catch(() => { })

        return interaction.update({
            content: `${e.DenyX} | Não foi possível obter/criar nenhuma webhook para notificação posterior as apostas. Verifique se eu tenho a permissão **Gerenciar Webhooks**.`,
            embeds: [], components: []
        }).catch(() => { })
    }

    if (typeof webhookUrl !== 'string' || !webhookUrl.isURL())
        return interaction.message.edit({
            content: `${e.DenyX} | Não foi possível obter/criar nenhuma webhook para notificação posterior as apostas. Verifique se eu tenho a permissão **Gerenciar Webhooks**.`,
            embeds: [], components: []
        }).catch(() => { })

    const id = CodeGenerator(10)

    return new Database.Jokempo({ creatorId: user.id, id, value, webhookUrl, creatorOption: `${option}`, channelOrigin: channel.id })
        .save().then(() => feedback()).catch(error => feebbackError(error))

    async function feedback() {

        const transaction = {
            time: `${Date.format(0, true)}`,
            data: `${e.loss} Apostou ${value.currency()} Safiras no *Jokempo Global*`
        }

        socket?.send({
            type: "transactions",
            transactionsData: { value, userId: user.id, transaction }
        })

        await Database.User.findOneAndUpdate(
            { id: user.id },
            {
                $push: {
                    Transactions: {
                        $each: [transaction],
                        $position: 0
                    }
                }
            },
            { upsert: true, new: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

        await sleep(1000)

        const content = `${e.Info} | Tudo certo, ${user}. Eu salvei a sua aposta de **${value.currency()} ${MoedaCustom}** no Jokempo Global mas tive problemas na execução da Webhook. Verifique se eu tenho a permissão de **Gerenciar Webhooks**.`
        const emojis = { stone: e.pedra, scissors: e.tesoura, paper: e.papel }
        const translate = { stone: 'pedra', scissors: 'tesoura', paper: 'papel' }

        interaction.message.delete().catch(() => { })
        await sleep(2000)
        return new WebhookClient({ url: webhookUrl })
            .send({
                content: `${e.CheckV} | <@${user.id}>, a sua aposta no valor de **${value.currency()} ${MoedaCustom}** foi registrada.\n${e.Notification} | Quando alguém apostar contra você, eu te notificarei sobre o resultado.`,
                username: 'Saphire Jokempo Global System',
                avatarURL: Config.WebhookJokempoIcon
            })
            .then(() => interaction.followUp({
                content: `${e.Check} | Hey, segredo nosso. A sua escolha desta aposta global foi **${emojis[option]} ${translate[option]}** no valor de **${value.currency()} ${MoedaCustom}**.\n${e.Info} | Se não apareceu nenhuma mensagem de \`Saphire Jokempo Global System\`, por favor, verifique se eu tenho a permissão **Gerenciar Webhooks**.`,
                ephemeral: true
            }).catch(() => { }))
            .catch(() => interaction.message.edit({ content }).catch(() => channel.send({ content }).catch(() => null)))
    }

}