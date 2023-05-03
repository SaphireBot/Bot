import { ButtonStyle, ChatInputCommandInteraction, PermissionsBitField } from "discord.js"
import { SaphireClient as client, Database, ChestManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { { c: 'chest', src: 'enable' | 'disable' | 'info' } } commandData
 */
export default async (interaction, commandData) => {

    const execute = { info, enable, disable }[commandData?.src]

    return execute
        ? execute()
        : interaction.update({
            content: `${e.SaphireDesespero} | SubFunction was'nt found. #86435444`,
            components: []
        }).catch(() => { })

    function info() {
        return interaction.reply({
            ephemeral: true,
            embeds: [{
                color: client.blue,
                title: `${e.SaphireChest} ${client.user.username}'s Chest`,
                description: `O **Sapphire Chest** é um baú lendário que viaja por todos os universos.\nEle aparece misteriosamente em canais distintos que chamam a atenção.`,
                fields: [
                    {
                        name: '🗺️ Canal de Aparecimento',
                        value: 'Os canais com mais mensagens. Os canais mais ativos.\nEles chamam a atenção do baú.'
                    },
                    {
                        name: '⏳ Tempo de Aparecimento',
                        value: 'O baú viaja e viaja. Ele pousa a cada 1 hora para resfriar os motores.'
                    },
                    {
                        name: `${e.Animated.SaphireQuestion} O que há no Baú?`,
                        value: 'Safiras & Experiências de montão.\nMax: 50.000 Safiras & 4.000 Experiências'
                    },
                    {
                        name: `${e.QuestionMark} Quão ativo precisa ser o canal?`,
                        value: 'Apenas 5 canais receberão o Sapphire Chest.\nCada servidor poderá receber apenas 1 Sapphire Chest.\nRequisito mínimo é de 1000 mensagens dentro de 1 hora.'
                    },
                    {
                        name: '⚙️ Comando',
                        value: '`/servidor opções: Sapphire Chest`\nNecessita da permissão **Administrador**.\nEste recurso vem ativado por padrão.'
                    }
                ],
                footer: {
                    text: `${client.user.username}'s Automatic System`
                }
            }]
        })
    }

    async function enable() {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({
                content: `${e.Animated.SaphireQuestion} | Eu acho que você não é **Administrador** para ativar o Sapphire Chest...`,
                ephemeral: true
            })

        await interaction.update({ content: `${e.Loading} | Ativando o Sapphire Chest...`, components: [] }).catch(() => { })

        await Database.Guild.findOneAndUpdate(
            { id: interaction.guildId },
            { $set: { Chest: true } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveCacheData(data.id, data))

        ChestManager.guildEnabled[interaction.guildId] = true
        return interaction.editReply({
            content: `${e.Animated.SaphireDance} | O sistema de Sapphire Chest está ativado.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Desativar',
                            emoji: e.DenyX,
                            custom_id: JSON.stringify({ c: 'chest', src: 'disable' }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: 'O que é Sapphire Chest?',
                            emoji: e.Animated.SaphireQuestion,
                            custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }

    async function disable() {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({
                content: `${e.Animated.SaphireQuestion} | Eu acho que você não é **Administrador** para desativar o Sapphire Chest...`,
                ephemeral: true
            })

        await interaction.update({ content: `${e.Loading} | Desativando o Sapphire Chest...`, components: [] }).catch(() => { })

        await Database.Guild.findOneAndUpdate(
            { id: interaction.guildId },
            { $set: { Chest: true } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveCacheData(data.id, data))

        delete ChestManager.guildEnabled[interaction.guildId]
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | O sistema de Sapphire Chest está desativado.`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Ativar',
                            emoji: e.CheckV,
                            custom_id: JSON.stringify({ c: 'chest', src: 'enable' }),
                            style: ButtonStyle.Success
                        },
                        {
                            type: 2,
                            label: 'O que é Sapphire Chest?',
                            emoji: e.Animated.SaphireQuestion,
                            custom_id: JSON.stringify({ c: 'chest', src: 'info' }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }
}