import { ButtonInteraction, WebhookClient } from "discord.js";
import { Database, SaphireClient as client } from "../../../../../classes/index.js";
import { Config } from "../../../../../util/Constants.js";
import { Emojis as e } from "../../../../../util/util.js";
import webhookJokempo from "./webhook.jokempo.js";
import { socket } from "../../../../../websocket/websocket.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { {
 *      id: string,
 *      value: number,
 *      webhookUrl: string,
 *      creatorId: string,
 *      creatorOption:  "stone" | "paper" | "scissors",
 *      userId: string,
 *      channelId: string,
 *      channelOrigin: string,
 *      userPlay: "stone" | "paper" | "scissors",
 *      creatorData: {
 *          id: string,
 *          username: string,
 *          tag: string,
 *          avatar: string | null
 *      }
 *   } } gameData
 */
export default async (interaction, gameData) => {

    const emojis = { stone: '👊 pedra', paper: '🤚 papel', scissors: '✌️ tesoura' }
    const creatorOption = emojis[gameData.creatorOption]
    const userOption = emojis[gameData.userPlay]
    const { user, channel, guild } = interaction
    const value = `**${gameData.value.currency()} Safiras**`
    const prize = `**${parseInt(gameData.value * 2).currency()} Safiras**`

    const content = `👑 | Você ganhou, jogando **${userOption}** contra **${gameData?.creatorData?.username || "Not Found"} - \`${gameData.creatorId}\`** que jogou **${creatorOption}**.\n${e.Tax} | Por vencer, você ganhou o dobro do valor: ${value} => ${prize}`
    interaction.update({ content, components: [] })
        .catch(() => channel.send({ content }).catch(() => { }))

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.gain} Recebeu ${(gameData.value * 2).currency()} Safiras jogando *Jokempo Global*`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: gameData.value * 2, userId: user.id, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: gameData.value * 2 },
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

    const webhookUrl = await webhookJokempo(gameData.channelOrigin)

    if (webhookUrl)
        return new WebhookClient({ url: webhookUrl })
            .send({
                content: `${e.Notification} | <@${gameData.creatorId}>, tenho resultados da sua **Aposta Global no Jokempo** \`${gameData.id || "0x00x"}\`.\n😢 | Você jogou **${creatorOption}** mas **perdeu**. ${user.username} jogou **${userOption}**.\n⚔️ | Você jogou contra **${user.username} \`${user.id}\`** do servidor **${guild.name} \`${guild.id}\`**\n${e.Tax} | O valor da aposta foi de ${value} e você não recebeu nada.`,
                username: 'Saphire Jokempo Global System',
                avatarURL: Config.WebhookJokempoIcon
            })
            .catch(err => console.log(err))
    else client.pushMessage({
        method: "post",
        channelId: gameData?.channelId,
        body: {
            content: `${e.Notification} | <@${gameData.creatorId}>, tenho resultados da sua **Aposta Global no Jokempo** \`${gameData.id || "0x00x"}\`.\n😢 | Você jogou **${creatorOption}** mas **perdeu**. ${user.username} jogou **${userOption}**.\n⚔️ | Você jogou contra **${user.username} \`${user.id}\`** do servidor **${guild.name} \`${guild.id}\`**\n${e.Tax} | O valor da aposta foi de ${value} e você não recebeu nada.`,
            method: "post",
            channelId: gameData?.channelId
        }
    })

    return;
}