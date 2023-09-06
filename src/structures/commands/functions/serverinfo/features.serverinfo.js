import { StringSelectMenuInteraction, ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { GuildFeaturesTranslate } from "../../../../util/Constants.js";
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { import("discord.js").APIGuild } guild
 */
export default async (interaction, guild) => {

    const indexComponent = interaction.message.components.length > 1 ? 1 : 0
    const selectMenu = interaction.message.components[indexComponent].toJSON()

    await interaction.update({
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: 'Carregando...',
                emoji: e.Loading,
                custom_id: 'loading',
                style: ButtonStyle.Secondary,
                disabled: true
            }]
        }]
    }).catch(() => { })

    const guildFeatures = guild.features
    const features =  guild.features.map(feature => GuildFeaturesTranslate[feature] || feature).join('\n') || 'Nenhum Recurso Disponível'

    const embed = {
        color: client.blue,
        title: '🔎 Informações do Servidor | RECURSOS',
        description: `\`\`\`txt\n${features}\n\`\`\``,
        fields: [
            {
                name: `${e.Info} Observação`,
                value: `Os **${guildFeatures.length} recursos** acima são fornecidos pelo Discord.\nA bot ${client.user.username} **não possui nenhuma ligação** com isso.`
            }
        ],
        footer: {
            text: `Server ID: ${guild.id}`,
            iconURL: guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.includes('a_') ? 'gif' : 'png'}`
                : null
        }
    }

    return interaction.message.edit({ embeds: [embed], components: [selectMenu] }).catch(() => { })
}