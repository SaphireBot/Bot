import { Emojis as e } from "../../../../../util/util.js"

export default [
    {
        JSON: 'Baka',
        name: 'Baka',
        description: 'Chame alguém de baka',
        embedTextOne: '🗣️ $user está te chamando de baka, $member.',
        embedTextTwo: '🗣️ $member e $user estão se chamando de baka, oh my God'
    },
    {
        JSON: 'Soco',
        name: 'Dar um soco',
        description: 'Dê um soco bem dado em alguém',
        embedTextOne: '👊 $user está te dando socos $member',
        embedTextTwo: '👊 $member retribuiu o soco $user'
    },
    {
        JSON: 'Onegai',
        name: 'Implorar',
        description: 'Implorar não faz mal',
        embedTextOne: '🙏 $user está te implorando $member'
    },
    {
        JSON: 'Olhando',
        name: 'Olhando...',
        description: 'Apeans olhando...',
        embedTextOne: '👀 $user está te olhando $member',
        embedTextTwo: '👀 $member também está te olhando $user'
    },
    {
        JSON: 'Beijar',
        name: 'Beijar',
        description: 'Beije e beije',
        embedTextOne: '💋 $user está te beijando $member',
        embedTextTwo: '💋 $member devolvou seu beijo $user'
    },
    {
        JSON: 'Morder',
        name: 'Morder',
        description: 'As vezes, mordem faz bem',
        embedTextOne: `😬 $user está mordendo $member`, embedTextTwo: `$😬 $member & $user estão se mordendo`
    },
    {
        JSON: 'Chupar',
        name: 'Chupar',
        description: 'Cuidado com isso aqui',
        embedTextOne: '$user está te chupando $member',
        embedTextTwo: '$member devolveu a chupada $user'
    },
    {
        JSON: 'Matar',
        name: 'Matar',
        description: 'Kill kill kill!',
        embedTextOne: '🔪 $user está te matando $member',
        embedTextTwo: '🔪 $member & $user estão se MATANDO'
    },
    {
        JSON: 'Atirar',
        name: 'Atirar',
        description: 'Atire em quem merece',
        embedTextOne: `${e.GunRight} $user está atirando em você $member`, embedTextTwo: `${e.GunRight} $member & $user estão em uma troca de tiros insana ${e.GunLeft}`
    },
    {
        JSON: 'Carinho',
        name: 'Dar carinho',
        description: 'Mostre seu lado fofo',
        embedTextOne: `${e.pat} $user está te dando carinho $member`, embedTextTwo: `${e.pat} $member também está te dando carinho $user`
    },
    {
        JSON: 'Dedo',
        name: 'Mostrar o dedo',
        description: 'Tem pessoa que merece',
        embedTextOne: '🖕 $user está te mostrando o dedo $member',
        embedTextTwo: '🖕 $member te devolveu o dedo $user'
    },
    {
        JSON: 'Hug',
        name: 'Dar um abraço',
        description: 'Abraçar faz bem',
        embedTextOne: '🫂 $user está te dando um abraço $member',
        embedTextTwo: '🫂 $member também está te abraçando $user'
    },
    {
        JSON: 'Lamber',
        name: 'Lamber',
        description: 'Você é um cachorro?',
        embedTextOne: '👅 $user está te lambendo $member',
        embedTextTwo: '👅 $member & $user estão se lambendo. Que nojo'
    },
    {
        JSON: 'Cutucar',
        name: 'Cutucar',
        description: 'Isso irrita de vez em quando',
        embedTextOne: '👉 $user está te cutucando $member',
        embedTextTwo: '👉 $member está te cutucando de volta $user'
    },
    {
        JSON: 'Tapa',
        name: 'Dar um tapa',
        description: 'Um tapa bem dado conserta muita coisa',
        embedTextOne: '🖐️ $user está te estapeando $member',
        embedTextTwo: '🖐️ $member te devolveu o tapa $user'
    },
    {
        JSON: 'Explodir',
        name: 'Explodir, fazer KABUM',
        description: 'EXPLOOOOOSION',
        embedTextOne: '💥 $user está te explodindo $member',
        embedTextTwo: '💥 $member te explodiu $user'
    },
    {
        JSON: 'Tocaai',
        name: 'Toca aí',
        description: 'High Five',
        embedTextOne: '$user mandou um toca aí $member',
        embedTextTwo: '$member retribuiu o toca aí $user'
    },
    {
        JSON: 'Pisar',
        name: 'Pisar',
        description: 'Pise e esmague',
        embedTextOne: '🦵 $user está pisando em você $member',
        embedTextTwo: '🦵 $member devolveu as pisadas'
    },
    {
        JSON: 'TeAmo',
        name: 'Te Amo',
        description: 'I love you',
        embedTextOne: '❤️ $user te ama $member',
        embedTextTwo: '❤️ $member também te ama $user'
    },
    {
        JSON: 'Cumprimentar',
        name: 'Cumprimentar',
        description: 'Eai, de boa?',
        embedTextOne: '$user está te cumprimentando $member',
        embedTextTwo: '$member retribuiu o cumprimento $user'
    },
    {
        JSON: 'Lutar',
        name: 'Lutar',
        description: 'Fight! I\'m better than you!',
        embedTextOne: '⚔️ $user está lutando com você $member',
        embedTextTwo: '⚔️ $member entrou na briga e a coisa ficou séria com $user'
    },
    {
        JSON: 'Chutar',
        name: 'Chutar',
        description: 'Chutar não é pisar!',
        embedTextOne: '🦶 $user está te chutando $member',
        embedTextTwo: '🦶 $member devolveu o chute $user'
    }
].sort((a, b) => b.name > a.name ? -1 : true)