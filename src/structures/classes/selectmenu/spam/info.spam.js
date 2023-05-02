import { StringSelectMenuInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { SaphireClient as client } from "../../../../classes/index.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
export default async interaction => {

    return interaction.reply({
        ephemeral: true,
        embeds: [{
            color: client.blue,
            title: `${e.Animated.SaphireQuestion} Anti-Spam Info`,
            description: 'Anti-Spam é um sistema automático que previne usuários de enviar muitas mensagens de uma só vez.',
            fields: [
                {
                    name: '📖 Significado de SPAM',
                    value: 'O termo Spam pode ser um acrónimo derivado da expressão em inglês "Sending and Posting Advertisement in Mass", em português "Enviar e Postar Propagandas em Massa".'
                },
                {
                    name: `🔃 ${client.user.username} & AutoMod`,
                    value: `A ${client.user.username} **não substitui** o AutoMod. A função deste sistema é adicionar e melhorar o controle de mensagens com funções que o AutoMod não possui.`
                },
                {
                    name: '🪄 Filtros',
                    value: 'Este sistema contém filtros opcionais e cada um consta com um sistema diferente.\n**- Caps Lock**: Deleta mensagens que ultrapasse uma quantidade em porcentagem de letras maiúsculas.\n**- Mensagens por Segundo**: Deleta mensagens que ultrapasse o limite de envios por segundo.\n**- Mensagens Repetidas**: Deleta mensagens que são enviadas repetidas vezes.'
                },
                {
                    name: '📝 Condições dos Filtros',
                    value: 'Os administradores do servidor podem escolher o poder do filtro.\n1. Porcentagem de Caps Lock permetido na mensagem\n2. Quantidade de mensagens e segundos\n3. Se mensagens repetidas são permitidas'
                },
                {
                    name: '🛡️ Canais e Cargos Imunes',
                    value: 'Os administradores podem selecionar cargos e canais que serão completamente ignorados por este sistema.'
                }
            ]
        }]
    })

}