import { ButtonInteraction, ButtonStyle, PermissionsBitField } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SpamManager } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50' | '55' | '60' | '65' | '70' | '75' | '80' | '85' | '90' | '95' | '100' } value
 */
export default async (interaction, value) => {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({
            content: `${e.DenyX} | Nop! Só os administradores desse servidor podem acessar essa área.`,
            ephemeral: true
        })

    if (!value) return buildSelectMenuAndEdit()

    function buildSelectMenuAndEdit() {
        const selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'spam',
                placeholder: 'Porcentagem de Caps Lock permitida',
                options: []
            }]
        }

        for (let i = 5; i <= 100; i += 5)
            selectMenuObject.components[0].options.push({ label: `${i}%`, emoji: '📝', value: `${i}` })

        const enabled = SpamManager.guildsEnabled.includes(interaction.guildId)

        return interaction.update({
            components: [
                selectMenuObject,
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Voltar',
                            emoji: e.saphireLeft,
                            custom_id: JSON.stringify({ c: 'spam', src: 'capslock' }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: enabled ? 'Desativar' : 'Ativar',
                            emoji: enabled ? e.DenyX : e.CheckV,
                            custom_id: JSON.stringify({ c: 'spam', src: enabled ? 'disablePercent' : 'enablePercent' }),
                            style: enabled ? ButtonStyle.Danger : ButtonStyle.Success
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }

}