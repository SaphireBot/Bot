import { ButtonStyle, StringSelectMenuInteraction, Guild, PermissionFlagsBits } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";
const paginationData = {}

/**
 * @param { StringSelectMenuInteraction } interaction
 * @param { Guild } guild
 */
export default async (interaction, guild, commandData) => {

    return commandData || paginationData[guild.id] ? tradePage() : build()

    async function build() {
        const indexComponent = interaction.message.components.length > 1 ? 1 : 0
        const components = [interaction.message.components[indexComponent].toJSON()]

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

        const roles = await guild.roles.fetch(undefined, { force: true }).catch(() => null)

        if (!roles)
            return await interaction.message.edit({
                embeds: [{ color: client.blue, description: `${e.Animated.SaphireCry} Nenhum cargo foi encontrado.` }]
            }).catch(() => { })

        const rolesFormated = mapRole(roles)

        const paginationCustomData = { pages: [], total: rolesFormated.length }

        if (rolesFormated.length) {
            let counter = rolesFormated.length
            let amount = 0
            let toSlice = 15

            while (counter > 0) {
                const dataToPush = rolesFormated.slice(amount, toSlice)
                if (!dataToPush.length) break
                paginationCustomData.pages.push(dataToPush)
                amount += 15
                toSlice += 15
                counter -= 15
                continue
            }
        } else paginationCustomData.pages.push(rolesFormated)

        const embed = {
            color: client.blue,
            title: '🔎 Informações do Servidor | CARGOS',
            description: `${paginationCustomData.pages[0].join('\n') || 'Nada por aqui'}`.limit('MessageEmbedDescription'),
            fields: [
                {
                    name: `${e.Info} Observação`,
                    value: `1. Cargos com ${e.ModShield} possui a permissão Administrador\n2. Cargos com 🤖 são cargos de bots.\n3. Cargos com 👤 são os demais cargos.\n4. Calculei um total de **${rolesFormated.length} cargos**.\n5. A sequência dos cargos é a mesma do servidor.\n6. A quantidade de membros é fornecida pelo Discord e não segue o número real.\n7. Clique em **Visualizar os Cargos** novamente para atualizar.`
                }
            ],
            footer: {
                text: `Server ID: ${guild.id}`,
                iconURL: guild.iconURL() || null
            }
        }

        paginationData[guild.id] = paginationCustomData

        if (paginationCustomData.pages.length > 1)
            components.unshift({
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏪',
                        custom_id: 'firstPage',
                        style: ButtonStyle.Primary,
                        disabled: true,
                    },
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: 'previous',
                        style: ButtonStyle.Primary,
                        disabled: true
                    },
                    {
                        type: 2,
                        label: `1/${paginationCustomData?.pages?.length}`,
                        custom_id: 'counter',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guild.id, uid: interaction.user.id, index: 1 }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⏩',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guild.id, uid: interaction.user.id, index: 'last' }),
                        style: ButtonStyle.Primary
                    }
                ]
            })

        return await interaction.message.edit({ embeds: [embed], components }).catch(() => { })

    }

    async function tradePage() {

        const guildId = commandData?.id || guild.id
        const componentIndex = interaction.message.components.length > 1 ? 1 : 0
        const components = [interaction.message.components[componentIndex].toJSON()]
        const rolesData = paginationData[guildId]
        const index = commandData?.index == 'last' ? rolesData?.pages?.length - 1 : commandData?.index == 'first' ? 0 : commandData?.index || 0
        const data = rolesData?.pages[index]

        if (!rolesData || !data || !data.length) return build()

        const embed = {
            color: client.blue,
            title: '🔎 Informações do Servidor | CARGOS',
            description: `${data.join('\n') || 'Nada por aqui'}`.limit('MessageEmbedDescription'),
            fields: [
                {
                    name: `${e.Info} Observação`,
                    value: `1. Cargos com ${e.ModShield} possui a permissão Administrador\n2. Cargos com 🤖 são cargos de bots.\n3. Cargos com 👤 são os demais cargos.\n4. Calculei um total de **${rolesData.total} cargos**.\n5. A sequência dos cargos é a mesma do servidor.\n6. A quantidade de membros é fornecida pelo Discord e não segue o número real.\n7. Clique em **Visualizar os Cargos** novamente para atualizar.`
                }
            ],
            footer: {
                text: `Server ID: ${guild.id}`,
                iconURL: guild.iconURL() || null
            }
        }

        if (rolesData?.pages?.length > 1)
            components.unshift({
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏪',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guildId, uid: interaction.user.id, index: 'first' }),
                        style: ButtonStyle.Primary,
                        disabled: index == 0,
                    },
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guildId, uid: interaction.user.id, index: index - 1 }),
                        style: ButtonStyle.Primary,
                        disabled: index == 0
                    },
                    {
                        type: 2,
                        label: `${index + 1}/${rolesData?.pages?.length}`,
                        custom_id: 'counter',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guildId, uid: interaction.user.id, index: index + 1 }),
                        style: ButtonStyle.Primary,
                        disabled: index == rolesData?.pages?.length - 1
                    },
                    {
                        type: 2,
                        emoji: '⏩',
                        custom_id: JSON.stringify({ c: 'sinfo', sub: 'roles', id: guildId, uid: interaction.user.id, index: 'last' }),
                        style: ButtonStyle.Primary,
                        disabled: index == rolesData?.pages?.length - 1
                    }
                ]
            })

        return await interaction.update({ embeds: [embed], components }).catch(() => { })
    }

    function mapRole(roles) {
        const mapped = roles.map(role => ({
            role: role.guild.id == interaction.guild.id ? `<@&${role.id}>` : role.name,
            admin: role.permissions.has(PermissionFlagsBits.Administrator),
            id: `\`${role.id}\``,
            position: role.rawPosition,
            managed: role.managed
        }))
            .filter(role => role.role)
            .sort((a, b) => b.position - a.position)
            .map(role => `${role.managed ? '🤖' : role.admin ? e.ModShield : '👤'} ${role.role} - ${role.id}`)

        return mapped
    }
}