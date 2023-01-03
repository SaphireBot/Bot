import dicio from 'vxdicionario'

export default {
    name: 'dicionario',
    description: '[util] Pesquise por significados de palavras',
    category: "util",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'palavra',
            description: 'Palavra que você busca pelo significado',
            required: true,
            type: 3,
            min_length: 1,
            max_length: 46
        }
    ],
    helpData: {
        color: 'Blue',
        description: 'Pesquise pelos significados das palavras usando este comando.',
        fields: [
            {
                name: 'Campo: Palavra',
                value: 'Escreva a palavra que você deseja pegar o significado neste campo. Exemplo: `/dicionario palavra: céu`'
            }
        ]
    },
    async execute({ interaction, client, e }) {

        const query = interaction.options.getString('palavra')
        await interaction.deferReply()
        const embeds = []

        return await dicio(query?.toLowerCase())
            .then(result => buildEmbed(result))
            .catch(async (err) => await interaction.editReply({ content: `${e.Deny} | Não foi possível executar o comando.\n${e.bug} | \`${err}\`` }))

        async function buildEmbed(result) {

            if (result.status === 404 || result === 'Defina uma palavra para pesquisar!')
                return await interaction.editReply({
                    content: `${e.Deny} | Nenhum significado para a palavra \`${query}\` foi encontrada.`
                })

            embeds.push({
                color: client.blue,
                title: `🔍 Palavra Pesquisada: ${query.toLowerCase().captalize()}`.limit('MessageEmbedTitle'),
                description: `${e.Info} ${result.sinonimos || 'Nenhum sinônino encontrado.'}\n🔄️ ${result.antonimos || 'Nenhum antônimo encontrado.'}\n✍️ ${result.etimologia || 'Sem etimogolia'}\n🇵 Plural: ${result.plural || 'Sem Plural'}\n💭 Separação Silábica: ${result.separacaoSilabica || 'Sem Separação'}`.limit('MessageEmbedDescription'),
            })

            for (let data of result.data) {
                console.log(data.significados)
                embeds.push({
                    color: client.blue,
                    title: `📑 ${data.classe.captalize()}`.limit('MessageEmbedTitle'),
                    description: `${data.significados.filter(i => i).map(str => `> ${str.replace(/\[|\]/g, '`')}`).join('\n \n') || 'Nenhum significado encontrado'}`.limit('MessageEmbedDescription'),
                })
            }

            if (result.frases.length)
                embeds.push({
                    color: client.blue,
                    title: `📖 Frases com ${query.captalize()}`,
                    description: result.frases.join('\n').limit('MessageEmbedDescription')
                })

            if (embeds.length <= 10)
                return await interaction.editReply({ embeds })

            await interaction.editReply({ embeds: embeds.slice(0, 10) })
            return await interaction.followUp({ embeds: embeds.slice(10, embeds.length) })
        }

    }
}