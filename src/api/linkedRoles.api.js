import crypto from "crypto";
import * as storage from "./storage.api.js";
import { Database, SaphireClient as client } from "../classes/index.js";
import { User } from "discord.js";

export function getOAuthUrl() {
    const state = crypto.randomUUID();

    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', client.user.id);
    url.searchParams.set('redirect_uri', 'https://saphire.one/discord-oauth-linkedRoles');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'role_connections.write identify');
    url.searchParams.set('prompt', 'consent');
    return { state, url: url.toString() };
}

export async function getOAuthTokens(code) {
    if (!code) return null

    const response = await fetch(
        'https://discord.com/api/v10/oauth2/token',
        {
            method: 'POST',
            body: new URLSearchParams({
                client_id: client.user.id,
                client_secret: client.secretId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'https://saphire.one/discord-oauth-linkedRoles'
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

    if (response.ok)
        return await response.json()

    console.log(`#51515151 Error fetching OAuth tokens: [${response.status}] ${response.statusText}`)
    return null
}

/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
export async function getAccessToken(userId, tokens) {
    if (!userId || !tokens) return

    if (Date.now() < tokens.expires_at)
        return tokens.access_token;

    const response = await fetch(
        'https://discord.com/api/v10/oauth2/token',
        {
            method: 'POST',
            body: new URLSearchParams({
                client_id: client.user.id,
                client_secret: client.secretId,
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })

    if (response.ok) {
        const tokens = await response.json();
        tokens.expires_at = Date.now() + tokens.expires_in * 1000;
        await storage.storeDiscordTokens(userId, tokens);
        return tokens.access_token;
    }

    return console.log(`Error refreshing access token: [${response.status}] ${response.statusText}`)
}

/**
 * Given a user based access token, fetch profile information for the current user.
 */
export async function getUserData(tokens) {
    const response = await fetch(
        'https://discord.com/api/v10/oauth2/@me',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )

    if (response.ok)
        return await response.json()

    console.log(`Error fetching user data: [${response.status}] ${response.statusText}`)
    return null
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
export async function pushMetadata(userId, tokens, metadata) {
    if (!userId || !tokens || !metadata) return

    const accessToken = await getAccessToken(userId, tokens);

    const response = await fetch(
        `https://discord.com/api/v10/users/@me/applications/${client.user.id}/role-connection`,
        {
            method: 'PUT',
            body: JSON.stringify({
                platform_name: 'Saphire Moon Verification',
                metadata
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

    if (response.ok) return 'success'
    return `Error pushing discord metadata: [${response.status}] ${response.statusText}`
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
export async function getMetadata(userId, tokens) {
    const accessToken = await getAccessToken(userId, tokens);
    const response = await fetch(
        `https://discord.com/api/v10/users/@me/applications/${client.user.id}/role-connection`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (response.ok) return await response.json();
    return console.log(`Error getting discord metadata: [${response.status}] ${response.statusText}`)
}

export async function updateMetadata(userId) {

    const metadata = {}
    const tokens = await storage.getDiscordTokens(userId);
    const userData = await Database.User.findOne({ id: userId }, 'Balance Level Likes')

    const userAccountData = await fetch(
        `https://discord.com/api/v10/users/${userId}`,
        { headers: { authorization: `Bot ${process.env.BOT_TOKEN_REQUEST}` } }
    )
        .then(data => data.json())
    const user = new User(client, userAccountData)
    metadata.date_create = user?.createdAt
        ? parseInt((new Date() - new Date(user?.createdAt.valueOf())) / (1000 * 60 * 60 * 24))
        : 0

    metadata.balance = userData?.Balance || 0
    metadata.level = userData?.Level || 0
    metadata.likes = userData?.Likes || 0

    const pushResponse = await pushMetadata(userId, tokens, metadata);
    return pushResponse
}