export default
    async ({ interaction, client, e }) =>
        await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e['+w']} Wordle Game`,
                url: 'https://wordlegame.org/pt',
                description: 'Você tem que adivinhar a palavra escondida em 6 tentativas e a cor das letras muda para mostrar o quão perto você está.',
                fields: [
                    {
                        name: `${e.saphireLendo} Iniciar o jogo`,
                        value: 'O primeiro passo é escolher quantas letras você vai querer no comando `/wordle`.\nDepois disso, só clicar no botão `Tentar Palavra` e escrever a palavra que você acha que é a oculta.'
                    },
                    {
                        name: `${e.Info} Letras, cores e emojis`,
                        value: `Digamos que você escreveu a palavra "JUROS"\nAs letras entrarão nos espaços vázios "${e.WordleGameRaw}".\n"JUROS" se torna "${e.J}${e.u}${e['+r']}${e['+o']}${e.s}"\n \n${e.J} VERDE: Está na palavra e no lugar correto.\n${e['+r']}${e['+o']} AZUL: Está na palavra, mas no lugar errado.\n${e.u}${e.s} PRETO: Não está na palavra oculta.`
                    },
                    {
                        name: `${e.Stonks} Ganhando o jogo`,
                        value: `Após algumas tentativas, você consegue a palavra "${e.l}${e.u}${e.G}${e.A}${e.R}". G A R estão na mesma posição da palavra oculta. Ou seja, se você pensar um pouquinho você vai ganhar o jogo escrevendo "${e.J}${e.O}${e.G}${e.A}${e.R}"`
                    },
                    {
                        name: `${e.saphirePolicial} Regras`,
                        value: '1. A palavra deve existir\n2. Não pode usar palavras repetidas\n3. Existem apenas 6 chances\n4. Palavras com acentos e "ç" não tem lugar neste jogo. (Faltou emojis pra isso rs)'
                    },
                    {
                        name: `${e.Deny} Jogo inválido`,
                        value: 'Se esta frase aparece para você, quer dizer que algo deu errado ou não deveria acontecer. Basta começar um novo jogo.'
                    },
                    {
                        name: `${e.saphireOlhadinha} Intelligence`,
                        value: `Com este novo sistema, mesmo que eu reinicie ou desligue, o seu jogo não vai "morrer". Você pode jogar e voltar depois de horas que o seu jogo vai se manter online. Legal, né?`
                    }
                ]
            }],
            ephemeral: true
        })