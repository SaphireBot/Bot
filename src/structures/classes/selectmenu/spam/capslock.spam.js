import { ButtonStyle, StringSelectMenuInteraction } from "discord.js"
import { Database, SpamManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    const { guild } = interaction
    const guildData = SpamManager.guildData[guild.id]
        ? { Spam: SpamManager.guildData[guild.id] }
        : await Database.Guild.findOne({ id: guild.id }, "Spam")
    const enabled = guildData.Spam?.filters?.capsLock?.enabled || false
    const percent = guildData.Spam?.filters?.capsLock?.percent || 0

    return interaction.update({
        content: enabled
            ? `${e.CheckV} | Sistema **ativado** com **${percent}%** de Caps Lock permitido`
            : `${e.DenyX} | Sistema **desativado** com **${percent}%** de Caps Lock permitido`,
        embeds: [],
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
                        label: enabled ? 'Desativar' : 'Ativar',
                        emoji: enabled ? e.DenyX : e.CheckV,
                        custom_id: JSON.stringify({ c: 'spam', src: enabled ? 'disablePercent' : 'enablePercent' }),
                        style: enabled ? ButtonStyle.Danger : ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Definir Porcentagem',
                        emoji: e.saphireLendo,
                        custom_id: JSON.stringify({ c: 'spam', src: 'percent' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    }).catch(() => { })

}