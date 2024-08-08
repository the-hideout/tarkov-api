const usePaths = [
    '/twitch',
];

export async function getTwitchResponse(env) {
    try {
        const response = await fetch('https://api.twitch.tv/helix/streams?game_id=491931&first=100', {
            headers: {
                'Authorization': `Bearer ${env.TWITCH_TOKEN}`,
                'Client-ID': env.TWITCH_CLIENT_ID,
            },
        });
        const twitchJson = JSON.stringify(await response.json(), null, 2);

        return new Response(twitchJson, {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        });
    } catch (error) {
        return new Response('Error retrieving Twitch data', {
            status: 500,
        });
    }
}

export default function useTwitch(env) {
    return {
        async onRequest({ url, endResponse }) {
            if (!usePaths.includes(url.pathname)) {
                return;
            }
            endResponse(await getTwitchResponse(env));
        },
    }
}
