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

    const emoji = { stone: '👊 pedra', paper: '🤚 papel', scissors: '✌️ tesoura' }[gameData.creatorOption]
    const usersId = [gameData.creatorOption, gameData.userId]
    const { user, channel, guild } = interaction
    const value = `**${gameData.value.currency()} Safiras**`
    const halfValue = `**${parseInt(gameData.value / 2).currency()} Safiras**`

    const content = `🏳️ | Você e **${gameData?.creatorData?.tag || "Not Found"} - \`${gameData.creatorId}\`** empataram, com ambos jogando **${emoji}**.\n${e.Tax} | Os dois, ganharam metade do valor apostado: ${value} => ${halfValue}`
    interaction.update({ content, components: [] })
        .catch(() => channel.send({ content }).catch(() => { }))

    await Database.User.updateMany(
        { id: { $in: usersId } },
        {
            $inc: { Balance: parseInt(gameData.value / 2) },
            $push: {
                Transactions: {
                    $each: [{
                        time: `${Date.format(0, true)}`,
                        data: `${e.gain} Recebeu ${gameData.value.currency()} Safiras jogando *Jokempo Global*`
                    }],
                    $position: 0
                }
            }
        }
    )

    Database.refreshUsersData(usersId)

    const webhookUrl = await webhookJokempo(gameData.channelOrigin)

    if (webhookUrl)
        return new WebhookClient({ url: webhookUrl })
            .send({
                content: `${e.Notification} | <@${gameData.creatorId}>, tenho resultados da sua **Aposta Global no Jokempo** \`${gameData.id || "0x00x"}\`.\n🏳️ | Os dois jogaram **${emoji} X ${emoji}** e resultou em um **empate**.\n⚔️ | Você jogou contra **${user.tag} \`${user.id}\`** do servidor **${guild.name} \`${guild.id}\`**\n${e.Tax} | O valor da aposta foi de ${value} e você recebeu ${halfValue} pelo **empate**.`,
                username: 'Saphire Jokempo Global System',
                avatarURL: Config.WebhookJokempoIcon
            })
            .catch(err => console.log(err))

    return;
}