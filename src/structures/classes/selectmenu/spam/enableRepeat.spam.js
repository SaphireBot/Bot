import { ButtonInteraction, ButtonStyle, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database, SpamManager } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { member, guildId } = interaction

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.Deny} | Apenas **administradores** podem acessar esta função.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Alterando informações de repetição...`, components: [], embeds: [] }).catch(() => { })
    return await Database.Guild.findOneAndUpdate(
        { id: guildId },
        { $set: { 'Spam.filters.repeat.enabled': true } },
        { upsert: true, new: true }
    )
        .then(doc => {
            Database.saveCacheData(doc.id, doc)
            SpamManager.guildData[guildId] = doc.Spam
            const repeat = doc.Spam?.filters?.repeat?.enabled ?? false
            return interaction.editReply({
                content: repeat
                    ? `${e.CheckV} | O filtro de mensagens repetidas está **ativado**. Mensagens iguais serão deletadas.`
                    : `${e.DenyX} | O filtro de mensagens repetidas está **desativado**. Mensagens iguais não serão deletadas.`,
                components: [
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
                                label: repeat ? 'Desativar' : 'Ativar',
                                emoji: repeat ? e.DenyX : e.CheckV,
                                custom_id: JSON.stringify({ c: 'spam', src: repeat ? 'disableRepeat' : 'enableRepeat' }),
                                style: repeat ? ButtonStyle.Danger : ButtonStyle.Success
                            }
                        ]
                    }
                ]
            }).catch(() => { })

        })
        .catch(err => interaction.editReply({
            content: `${e.SaphireDesespero} | Não foi possível alterar o estado de repetição.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}