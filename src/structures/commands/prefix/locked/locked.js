import { Emojis as e } from '../../../../util/util.js';
import { Message } from 'discord.js';

export default {
    name: 'locked',
    description: 'Apenas em Slash Commands',
    aliases: [
        'bug',
        'bugs',

        'mydata',

        'saphire',

        'bet',
        'aposta',

        'cards',

        'run',
        'corrida',

        'emoji',
        'emojis',

        'rifa',

        'amongus',
        'blackjack',

        'memory',
        'memoria',
        'memória',

        'quiz',

        'prefere',
        'rather',

        'wordle',
        'termo',

        'gifs',

        'images',

        'phub',
        'pornhub',

        'youtube',

        'announce',

        'channel',
        'canal',

        'clear',
        'limpar',

        'giveaway',
        'sorteio',

        'logs',
        'gsn',

        'roles',

        'server',
        'servidor',

        'stars',
        'estrelas',

        'twitch',

        'nsfw',

        'vip',

        'traduzir',
        'translate',

        'anime',

        'cantada',

        'weather',
        'clima',

        'cripto',

        'dicionario',
        'dicionário',
        'dictionary',

        'reminder',
        'lembrete',

        'poll',
        'votação',

        'rank',
        'ranking',

        'spotify',
        
        'wallpaper',
        'admin',
        'blacklist',
        'discloud',
        'host',
        'staff'
    ],
    category: "Saphire",
    api_data: {
        tags: ['admin'],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     */
    async execute(message) {
        return message.reply({
            content: `${e.Animated.SaphireReading} | Comando disponível apenas em /slashcommands.`
        }).then(msg => setTimeout(() => msg?.delete().catch(() => { }), 5000)).catch(() => { })
    }
}