// The Twitch API url to hit for EFT data
const url = "https://api.twitch.tv/helix/streams?game_id=491931&first=100"

// Response content-type headers
const contentType = 'application/json;charset=UTF-8';

// Make a request to the Twitch API to get data for EFT streams
async function getTwitchData(env) {
    let response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${env.TWITCH_TOKEN}`,
            'Client-ID': env.TWITCH_CLIENT_ID,
        },
    });
    let responseJson = JSON.stringify(await response.json(), null, 2);
    return responseJson;
}

export default async function (env) {
    let twitchJson = await getTwitchData(env);

    return new Response(twitchJson, {
        headers: {
            'content-type': contentType,
        },
    });
};
