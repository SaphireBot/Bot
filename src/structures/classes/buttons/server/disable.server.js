import { ButtonInteraction, ButtonStyle } from "discord.js"
import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'server', src: 'disable', type: 'welcome' | 'leave', confirm: 't' | 'f' } } data
 */
export default async (interaction, data) => {

    if (data.confirm == 'f')
        return interaction.update({
            content: `${e.QuestionMark} | Você realmente deseja excluir todos os dados da mensagem de Boas-Vindas do servidor?`,
            embeds: [],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Deletar',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'server', src: 'disable', type: data.type, confirm: 't' }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            emoji: e.CheckV,
                            custom_id: JSON.stringify({ c: 'delete' }),
                            style: ButtonStyle.Success
                        }
                    ]
                }
            ]
        })

    return await Database.Guild.findOneAndUpdate(
        { id: interaction.guildId },
        {
            $unset: {
                [
                    data.type == 'welcome'
                        ? 'WelcomeChannel'
                        : 'LeaveChannel'
                ]: true
            }
        },
        { new: true }
    )
        .then(data => {
            Database.saveGuildCache(data.id, data)
            interaction.update({
                content: `${e.CheckV} | Tudo ok! Os dados de notificação foram deletados e desativados.`,
                components: []
            }).catch(() => { })
            return
        })
        .catch(err => interaction.update({
            content: `${e.Animated.SaphirePanic} | EU RUIM AQUIII.\n${e.bug} | \`${err}\``,
            components: []
        }).catch(() => { }))

}