const usePaths = [
    '/twitch',
];

export default function useTwitch() {
    return {
        async onRequest({ url, endResponse, serverContext }) {
            if (!usePaths.includes(url.pathname)) {
                return;
            }
            
            try {
                const response = await fetch('https://api.twitch.tv/helix/streams?game_id=491931&first=100', {
                    headers: {
                        'Authorization': `Bearer ${serverContext.TWITCH_TOKEN}`,
                        'Client-ID': serverContext.TWITCH_CLIENT_ID,
                    },
                });
                const twitchJson = JSON.stringify(await response.json(), null, 2);
    
                endResponse(new Response(twitchJson, {
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                    },
                }));
            } catch (error) {
                endResponse(new Response('Error retrieving Twitch data', {
                    status: 500,
                }));
            }
        },
    }
}
