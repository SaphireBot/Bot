import { ButtonInteraction, WebhookClient } from "discord.js";
import { Database } from "../../../../../classes/index.js";
import { Config } from "../../../../../util/Constants.js";
import { Emojis as e } from "../../../../../util/util.js";
import webhookJokempo from "./webhook.jokempo.js";

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
 *          discriminator: string,
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

    const content = `😢 | Você perdeu, jogando **${userOption}** contra **${gameData?.creatorData?.tag || "Not Found"} - \`${gameData.creatorId}\`** que jogou **${creatorOption}**.\n${e.Tax} | Por perder, você ganhou não ganhou nada do valor apostado: ${value} => **0 Safiras**`
    interaction.update({ content, components: [] })
        .catch(() => channel.send({ content }).catch(() => { }))

    await Database.User.findOneAndUpdate(
        { id: gameData.creatorId },
        {
            $inc: { Balance: gameData.value * 2 },
            $push: {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.gain} Recebeu ${(gameData.value * 2).currency()} Safiras jogando *Jokempo Global*`
                    }],
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
                content: `${e.Notification} | <@${gameData.creatorId}>, tenho resultados da sua **Aposta Global no Jokempo** \`${gameData.id || "0x00x"}\`.\n👑 | Você **GANHOU**! Você jogou **${creatorOption}** e venceu contra **${userOption}**.\n⚔️ | Você jogou contra **${user.tag} \`${user.id}\`** do servidor **${guild.name} \`${guild.id}\`**\n${e.Tax} | Pela vitória, você ganhou o dobro do valor apostado ${value} => ${prize}.`,
                username: 'Saphire Jokempo Global System',
                avatarURL: Config.WebhookJokempoIcon
            })
            .catch(err => console.log(err))

    return;
}