import {
    SaphireClient as client,
    Discloud
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async interaction => {

    await interaction.deferReply({})

    const response = await Discloud.user.fetch()

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível obter as informações do usuário.`
        })

    const locale = {
        'pt-BR': 'Brasil/Português',
        'en-US': 'Estados Unidos/Inglês'
    }

    const plans = {
        Free: 'Free',
        Carbon: 'Carbon',
        Gold: 'Gold',
        Platinum: 'Platinum',
        Diamond: 'Diamond',
        Ruby: 'Ruby',
        Sapphire: 'Sapphire',
        Krypton: 'Krypton',
        Special: 'Special',
        Booster: 'Booster',
    }

    return await interaction.editReply({
        embeds: [{
            color: client.blue,
            title: `Informações do usuário - Discloud User`,
            fields: [
                {
                    name: '🤖 Apps',
                    value: `${response.appIDs.length} Apps hospedados`
                },
                {
                    name: '🚩 Locale',
                    value: locale[response.locale] || 'Não encontrado'
                },
                {
                    name: '🛠 Plano atual',
                    value: plans[response.plan] || 'Sem plano'
                },
                {
                    name: '📆 Data de término do plano',
                    value: Date.Timestamp(new Date(response.planDataEnd), 'f', true) + '\n' + Date.Timestamp(new Date(response.planDataEnd), 'R', true)
                },
                {
                    name: `${e.Ram} Memória RAM`,
                    value: `${response.ramUsedMb}/${response.totalRamMb}MB`
                },
                {
                    name: `🔗 Sub-domínios`,
                    value: response.subdomains.map(subdomain => `\`${subdomain}\``).join(', ') || 'Nenhum subdomínio registrado.'.limit('MessageEmbedFieldValue')
                }
            ]
        }]
    }).catch(() => { })

}