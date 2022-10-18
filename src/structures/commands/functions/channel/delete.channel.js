import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, channel) => {

    const channelType = {
        0: 'o canal de texto',
        1: 'o canal privado',
        2: 'o canal de voz',
        3: 'o canal de mensagens em grupo',
        4: 'a categoria',
        5: 'o canal de anúncios',
        10: 'a thread de anúncios',
        11: 'a thread pública',
        12: 'a thread privada',
        13: 'o canal de palco',
        14: 'o canal Student Hub',
        15: 'o canal de fórum'
    }[channel.type] || 'o canal desconhecido'

    return await interaction.reply({
        content: `${e.Loading} | Você realmente deseja deletar ${channelType} ${channel}?`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Excluir',
                        custom_id: JSON.stringify({ c: 'channel', src: 'delete', id: channel.id }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: JSON.stringify({ c: 'delete' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}