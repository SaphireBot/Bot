import { SaphireClient as client } from "../../../classes/index.js";
import { Message, Routes } from "discord.js";

Message.prototype.getUser = async function (id = "") {

    if (id && /^\w+$/.test(id))
        return this.mentions.members.get(id)?.user
            || client.users.cache.get(id)
            || await client.users.fetch(id).catch(() => undefined)
            || await client.rest.get(Routes.user(id))
                .then(user => {
                    client.users.cache.set(user.id, user)
                    return client.users.cache.get(user.id)
                })
                .catch(() => undefined)

    return this.mentions.members.first()?.user || this.author
}

Message.prototype.getMember = async function (id = "") {

    if (id && /^\w+$/.test(id))
        return this.mentions.members.get(id)
            || this.guild.members.cache.get(id)
            || await this.guild.members.fetch(id).catch(() => undefined)

    return this.mentions.members.first() || this.member
}

Message.prototype.getRole = async function (id = "") {

    if (id && /^\w+$/.test(id))
        return this.guild.roles.cache.get(id)
            || await this.guild.roles.fetch(id).catch(() => undefined)

    return this.mentions.roles.first()
}

Message.prototype.getUsers = async function (ids = []) {

    const users = []
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            users.push(await this.getUser(id))
        return users.filter(i => i)
    }

    return this.mentions.members.map(member => member.user)
}

Message.prototype.getMultipleUsers = async function () {
    const ids = this.formatIds()

    const users = []
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            users.push(await this.getUser(id))
        return users.filter(i => i)
    }

    return this.mentions.members.map(member => member.user)
}

Message.prototype.getMultipleMembers = async function () {
    const ids = this.formatIds()

    const members = new Map()
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            members.set(id, await this.getMember(id))
        return Array.from(members.values()).filter(v => v?.id)
    }

    return this.mentions.members
}

Message.prototype.getMultipleRoles = async function () {
    const ids = this.formatIds()

    const roles = new Map()
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            roles.set(id, await this.getRole(id))
        return Array.from(roles.values()).filter(i => i)
    }

    return this.mentions.roles
}

Message.prototype.getMembers = async function (ids = []) {

    const members = []
    if (ids.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            members.push(await this.getMember(id))
        return members.filter(i => i)
    }

    return this.mentions.members.toJSON()
}

Message.prototype.formatIds = function () {
    const ids = new Set()
    this.mentions.members.forEach(member => ids.add(member.id))

    for (
        const id
        of this.content
            .trim()
            .split(/ +/g)
            .filter(str => /^\w+$/.test(str))
    )
        ids.add(id)

    return Array.from(ids).filter(i => i)
}