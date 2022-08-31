export default async (data) => {

    const { options } = data
    const mode = options.getString('mode')

    if (mode === 'luck') return import('./luck.blackjack.js').then(luck => luck.default(data))

}