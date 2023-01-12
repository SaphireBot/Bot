import { ApplicationCommandOptionType, ButtonStyle } from "discord.js";

/**
 * Créditos a criação do comando
 * Graças ao ser humano "Juaum - 518207099302576160" que fez um gambiarra criptografada
 * Esse comando surgiu pelo "NewLayer - 732954224090021920" por me encher o saco enquanto eu estava com sono
 */

export default {
    name: 'cripto',
    description: '[util] Criptografe frases e envie para um amigo descriptografar ela.',
    category: "util",
    dm_permission: false,
    database: false,
    type: 1,
    options: [
        {
            name: 'criptografar',
            description: 'Criptografe textos para ninguém saber seus textos',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'texto',
                    description: 'Texto a ser criptografado.',
                    type: ApplicationCommandOptionType.String,
                    min_length: 2,
                    max_length: 1000,
                    required: true
                },
                {
                    name: 'senha',
                    description: 'Um senha para descriptografar (1~100)',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 1000,
                    required: true
                }
            ]
        },
        {
            name: 'descriptografar',
            description: 'Descriptografe textos para saber os textos criptografado',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'texto',
                    description: 'Texto a ser descriptografado.',
                    type: ApplicationCommandOptionType.String,
                    min_length: 2,
                    max_length: 1015,
                    required: true
                },
                {
                    name: 'senha',
                    description: 'Senha de origem da criptografia',
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        },
    ],
    helpData: {
        description: 'Um pequeno sistema de criptografia',
        fields: [
            {
                name: 'Caracteres Inválidos',
                value: '\`-\`'
            }
        ]
    },
    async execute({ interaction, client, e }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()
        const text = options.getString('texto')
        const number = options.getInteger('senha')

        const embed = {
            color: client.blue,
            title: `👨‍💻 ${client.user.username} Cripto`
        }

        return subCommand === 'criptografar' ? cript() : descript()

        async function cript() {

            if (text.includes('-'))
                return await interaction.reply({
                    content: `${e.Deny} | O caracter \`-\` não é permitido.`,
                    ephemeral: true
                })

            embed.fields = [
                {
                    name: '📜 Mensagem Original',
                    value: `\`\`\`\n${text}\`\`\``.limit('MessageEmbedFieldValue')
                },
                {
                    name: '⚙️ Mensagem Criptografada',
                    value: `\`\`\`\n${text.cript(number)}\`\`\``.limit('MessageEmbedFieldValue')
                }
            ]

            embed.footer = { text: `Senha para descriptografia: ${number}` }

            return await interaction.reply({
                embeds: [embed],
                ephemeral: true,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Copia e Cola',
                                custom_id: JSON.stringify({ c: 'cripto', src: 'copy' }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }
                ]
            })

        }

        async function descript() {

            if (number < 0 || number > 100)
                return await interaction.reply({
                    content: `${e.Deny} | Senha para descriptografia inválida.`,
                    ephemeral: true
                })

            embed.fields = [
                {
                    name: '⚙️ Mensagem Criptografada',
                    value: `\`\`\`\n${text}\`\`\``.limit('MessageEmbedFieldValue')
                },
                {
                    name: '📜 Mensagem Descriptografada',
                    value: `\`\`\`\n${text.descript(number)}\`\`\``.limit('MessageEmbedFieldValue')
                }
            ]

            embed.footer = { text: 'Se o texto não foi traduzido, a senha está incorreta.' }

            return await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })

        }

    }
}