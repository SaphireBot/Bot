import Base from '../../../../classes/Base.js'
import {
    Config as config
} from '../../../../../util/Constants.js'
import { CodeGenerator } from '../../../../../functions/plugins/plugins.js'
import revalidateReminder from './reminder.daily.js'

export default class Daily extends Base {
    constructor(interaction) {
        super()
        this.interaction = interaction
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.member = interaction.member
        this.options = interaction.options
    }

    async execute() {

        const { interaction, Database, client, emojis: e, guild } = this

        const option = this.options.getString('options')
        const authorData = await Database.User.findOne({ id: this.user.id }, 'Timeouts DailyCount')
        const clientData = await Database.Client.findOne({ id: client.user.id }, 'Titles.BugHunter PremiumServers')
        const bugHunters = clientData?.Titles.BugHunter || []
        const dailyTimeout = authorData?.Timeouts?.Daily || 0
        const count = authorData?.DailyCount || 0
        const isReminder = option === 'reminder'

        if (option === 'sequency') return this.dailyUserInfo(count)

        if (count > 0 && dailyTimeout > 0 && !Date.Timeout(172800000, dailyTimeout)) {
            this.resetSequence()
            return await interaction.reply({
                content: `${e.SaphireCry} | Você perdeu a sequência do prêmio diário.`
            })
        }

        if (Date.Timeout(86400000, dailyTimeout)) {
            if (isReminder) return revalidateReminder(interaction, dailyTimeout, 86400000)
            return await interaction.reply({
                content: `⏱ | Calma calma, seu próximo daily é ${Date.Timestamp(((authorData?.Timeouts?.Daily || 0) - Date.now()) + 86400000, 'R')}.\n${e.Info} | Se você quiser ver os seus status, use </daily:${interaction.commandId}>, vá em \`options\` e \`Meu status do daily\``,
                ephemeral: true
            })
        }

        let data = { fields: [] }
        let prize = Daily.dailyPrizes[count]
        let over30 = { day: count, money: parseInt(Math.floor(Math.random() * 10000)), xp: parseInt(Math.floor(Math.random() * 10000)) }
        const isVip = await this.user.isVip()
        const moeda = await guild.getCoin()

        if (count > 30) {
            if (over30.money < 1000) over30.money = 1000
            if (over30.xp < 500) over30.xp = 500
            prize = over30
        }

        let money = prize.money
        let xp = prize.xp

        if (this.guild.id === config.guildId) {
            let moneyBonus = this.bonusCalculate(money, 0.5)
            let xpBonus = this.bonusCalculate(xp, 0.5)
            prize.money += moneyBonus
            prize.xp += xpBonus
            data.fields.push({ name: '🏡 Servidor Principal', value: `+${moneyBonus} ${moeda} | +${xpBonus} ${e.RedStar} Experiência` })
        }

        if (bugHunters.includes(this.user.id)) {
            let moneyBonus = this.bonusCalculate(money, 0.3)
            let xpBonus = this.bonusCalculate(xp, 0.3)
            prize.money += moneyBonus
            prize.xp += xpBonus
            data.fields.push({ name: `${e.Gear} Bug Hunter`, value: `+${moneyBonus} ${moeda} | +${xpBonus} ${e.RedStar} Experiência` })
        }

        if (clientData?.PremiumServers?.includes(this.guild.id)) {
            let moneyBonus = this.bonusCalculate(money, 0.6)
            let xpBonus = this.bonusCalculate(xp, 0.6)
            prize.money += moneyBonus
            prize.xp += xpBonus
            data.fields.push({ name: `${e.Star} Servidor Premium`, value: `+${moneyBonus} ${moeda} | +${xpBonus} ${e.RedStar} Experiência` })
        }

        if (isVip) {
            let moneyBonus = this.bonusCalculate(money, 0.7)
            let xpBonus = this.bonusCalculate(xp, 0.7)
            prize.money += moneyBonus
            prize.xp += xpBonus
            data.fields.push({ name: `${e.VipStar} Adicional Vip`, value: `+${moneyBonus} ${moeda} | +${xpBonus} ${e.RedStar} Experiência` })
        }

        if (this.member.premiumSinceTimestamp) {
            let moneyBonus = this.bonusCalculate(money, 0.35)
            let xpBonus = this.bonusCalculate(xp, 0.35)
            prize.money += moneyBonus
            prize.xp += xpBonus
            data.fields.push({ name: `${e.Boost} Server Booster`, value: `+${moneyBonus} ${moeda} | +${xpBonus} ${e.RedStar} Experiência` })
        }

        if (isReminder)
            data.fields.push({ name: '⏰ Lembrete automático', value: 'Como ativou essa funçao, então eu vou te ajudar. Quando o próximo daily estiver disponível, eu vou te avisar.' })

        let days = Daily.dailyPrizes.map(data => data.day)
        let daysCountFormat = prize.day <= 31 ? days.map((num, i) => this.formatCalendar(prize, num, i)).join('') : 'Um calendário comum não cabe a você.'

        data.fields.unshift({
            name: `${e.MoneyWings} Dinheiro e Experiências Adquiridas ${isVip || this.guild.id === config.guildId ? '*(total)*' : ''}`,
            value: `${prize.money} ${moeda} | ${prize.xp} ${e.RedStar} Experiência`
        })

        data.fields.push({ name: '📆 Calendário', value: `\`\`\`txt\n${daysCountFormat}\n\`\`\`` })
        this.setNewDaily(prize, isReminder)

        return await interaction.reply({
            embeds: [{
                color: client.green,
                title: `${e.SaphireLove} ${client.user.username} Daily Rewards`,
                description: `Parabéns! Você está no **${prize.day}º** dia do daily rewards.`,
                fields: [...data.fields]
            }]
        })

    }

    async setNewDaily(prize, isReminder) {

        const dateNow = Date.now()

        if (isReminder)
            new this.Database.Reminder({
                id: CodeGenerator(7).toUpperCase(),
                userId: this.user.id,
                RemindMessage: 'Daily Disponível',
                Time: 86400000,
                DateNow: dateNow,
                isAutomatic: true,
                ChannelId: this.channel.id
            }).save()

        const data = {
            'Timeouts.Daily': dateNow,
            $inc: {
                DailyCount: 1,
                Balance: prize.money,
                Xp: prize.xp,
            }
        }

        if (prize.day > 0)
            data.$push = {
                Transactions:
                {
                    $each: [{
                        time: `${Date.format(0, true)} - ${await this.user.balance()}`,
                        data: `${this.emojis.gain} Ganhou ${prize.money} Safiras no ${prize.day}º dia do *daily*.`
                    }],
                    $position: 0
                }
            }

        await this.Database.User.updateOne({ id: this.user.id }, data, { upsert: true })

    }

    formatCalendar(prize, num, i) {
        const breakLine = [7, 14, 21, 28].includes(i + 1) ? ' \n' : ' '
        if (num <= 9) num = `0${num}`
        return num <= prize.day ? `${num}${breakLine}` : `XX${breakLine}`
    }

    bonusCalculate(amount, porcent) {
        let bonus = parseInt(Math.floor(amount * porcent).toFixed(0))
        if (bonus <= 0) bonus++
        return bonus
    }

    async dailyUserInfo(count) {

        if (count === 0)
            return await this.interaction.reply({
                content: `${this.emojis.Info} | Você não tem nenhum dia consecutivo contabilizado.`,
                ephemeral: true
            })

        return await this.interaction.reply({
            content: `${this.emojis.Info} | Atualmente, você resgatou **${count - 1}** prêmios diários consecutivos.`
        })
    }

    async resetSequence() {

        await this.Database.User.updateOne(
            { id: this.user.id },
            {
                $unset: {
                    'Timeouts.Daily': 1,
                    DailyCount: 1
                }
            },
            { upsert: true }
        )
        return
    }

    static dailyPrizes = [
        { day: 1, money: 200, xp: 150 },
        { day: 2, money: 0, xp: 3000 },
        { day: 3, money: 300, xp: 100 },
        { day: 4, money: 400, xp: 4000 },
        { day: 5, money: 500, xp: 250 },
        { day: 6, money: 600, xp: 350 },
        { day: 7, money: 7000, xp: 7000 },
        { day: 8, money: 800, xp: 150 },
        { day: 9, money: 900, xp: 150 },
        { day: 10, money: 1000, xp: 1050 },
        { day: 11, money: 350, xp: 700 },
        { day: 12, money: 570, xp: 750 },
        { day: 13, money: 800, xp: 1250 },
        { day: 14, money: 14000, xp: 14000 },
        { day: 15, money: 200, xp: 150 },
        { day: 16, money: 200, xp: 150 },
        { day: 17, money: 1210, xp: 1150 },
        { day: 18, money: 1500, xp: 0 },
        { day: 19, money: 1500, xp: 9000 },
        { day: 20, money: 1000, xp: 150 },
        { day: 21, money: 3500, xp: 150 },
        { day: 22, money: 7500, xp: 150 },
        { day: 23, money: 1000, xp: 2000 },
        { day: 24, money: 2000, xp: 3000 },
        { day: 25, money: 3000, xp: 4000 },
        { day: 26, money: 5000, xp: 5000 },
        { day: 27, money: 6000, xp: 6000 },
        { day: 28, money: 7000, xp: 7000 },
        { day: 29, money: 8000, xp: 8000 },
        { day: 30, money: 9000, xp: 9000 },
        { day: 31, money: 30000, xp: 1000 }
    ]
}