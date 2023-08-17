import { ButtonInteraction, ButtonStyle, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { member, guildId, message } = interaction

    if (
        !member.permissions.has(PermissionsBitField.Flags.Administrator)
        || member.id !== message.interaction?.user?.id
    )
        return interaction.reply({
            content: `${e.Deny} | Apenas **administradores** podem acessar esta função.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Salvando alterações...`, components: [], embeds: [] }).catch(() => { })
    return await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { 'Spam.filters.messagesTimer.enabled': false } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveGuildCache(doc.id, doc)
            SpamManager.guildData[guildId] = doc.Spam
            const messagesTimer = doc.Spam?.filters?.messagesTimer
            const amount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

            return interaction.editReply({
                content: `${messagesTimer.enabled ? e.CheckV : e.DenyX} | O filtro de mensagem está ${messagesTimer.enabled ? '**ativo**' : '**desativado**'}.\n📝 | Configurado o envio de **${messagesTimer.amount || 0} mensagens** em **${messagesTimer.seconds || 0} segundos**.`,
                components: [
                    {
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: JSON.stringify({ c: 'spam', src: 'messagesAmount' }),
                            placeholder: 'Quantidade de Mensagens',
                            options: amount.map(num => ({ label: `${num} Mensagens`, emoji: '💬', value: `${num}` }))
                        }]
                    },
                    {
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: JSON.stringify({ c: 'spam', src: 'messagesSeconds' }),
                            placeholder: 'Segundos de Intervalo',
                            options: amount.map(num => ({ label: `${num} Segundos`, emoji: '⏱️', value: `${num}` }))
                        }]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Voltar',
                                emoji: e.saphireLeft,
                                custom_id: JSON.stringify({ c: 'spam', src: 'back' }),
                                style: ButtonStyle.Primary
                            },
                            {
                                type: 2,
                                label: messagesTimer.enabled ? 'Desativar Filtro de Mensagens' : 'Ativar Filtro de Mensagens',
                                emoji: messagesTimer.enabled ? e.DenyX : e.CheckV,
                                custom_id: JSON.stringify({ c: 'spam', src: messagesTimer.enabled ? 'messageDisable' : 'messageEnable' }),
                                style: messagesTimer.enabled ? ButtonStyle.Danger : ButtonStyle.Success
                            }
                        ]
                    }
                ]
            }).catch(() => { })

        })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphirePanic} | Não foi possível alterar o estado de repetição.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}