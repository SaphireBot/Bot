import crypto from "crypto";
import * as storage from "./storage.api.js";
import { SaphireClient as client } from "../classes/index.js";

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
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log(`#51515151 Error fetching OAuth tokens: [${response.status}] ${response.statusText}`)
        return null
    }
}

/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
export async function getAccessToken(userId, tokens) {
    if (Date.now() > tokens.expires_at) {
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
                },
            });
        if (response.ok) {
            const tokens = await response.json();
            tokens.expires_at = Date.now() + tokens.expires_in * 1000;
            // await storage.storeDiscordTokens(userId, tokens);
            return tokens.access_token;
        } else {
            throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
        }
    }
    return tokens.access_token;
}

/**
 * Given a user based access token, fetch profile information for the current user.
 */
export async function getUserData(tokens) {
    const response = await fetch(
        'https://discord.com/api/v10/oauth2/@me',
        {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
    }
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
export async function pushMetadata(userId, tokens, metadata) {
    // PUT /users/@me/applications/:id/role-connection
    const accessToken = await getAccessToken(userId, tokens);

    const response = await fetch(
        `https://discord.com/api/v10/users/@me/applications/${client.user.id}/role-connection`,
        {
            method: 'PUT',
            body: JSON.stringify({
                platform_name: 'Example Linked Role Discord Bot',
                metadata,
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    if (!response.ok) {
        throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
    }
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
export async function getMetadata(userId, tokens) {
    // GET /users/@me/applications/:id/role-connection
    const accessToken = await getAccessToken(userId, tokens);
    const response = await fetch(
        `https://discord.com/api/v10/users/@me/applications/${client.user.id}/role-connection`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`);
    }
}

export async function updateMetadata(userId) {
    // Fetch the Discord tokens from storage
    const tokens = await storage.getDiscordTokens(userId);

    let metadata = {}
    try {
        // Fetch the new metadata you want to use from an external source. 
        // This data could be POST-ed to this endpoint, but every service
        // is going to be different.  To keep the example simple, we'll
        // just generate some random data.
        // metadata = {
        //     cookieseaten: 1483,
        //     allergictonuts: 0, // 0 for false, 1 for true
        //     firstcookiebaked: '2003-12-20',
        // }
    } catch (e) {
        e.message = `Error fetching external data: ${e.message}`;
        console.error(e);
        // If fetching the profile data for the external service fails for any reason,
        // ensure metadata on the Discord side is nulled out. This prevents cases
        // where the user revokes an external app permissions, and is left with
        // stale linked role data.
    }

    // Push the data to Discord.
    pushMetadata(
        userId,
        tokens,
        {
            safiras: 5000
        });
    return
}