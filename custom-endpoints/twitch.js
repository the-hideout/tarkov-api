import envHandler from '../environment_handler';
// The Twitch API url to hit for EFT data
const url = "https://api.twitch.tv/helix/streams?game_id=491931&first=100"

// Response content-type headers
const contentType = 'application/json;charset=UTF-8';

// Make a request to the Twitch API to get data for EFT streams
async function getTwitchData() {
    let response = await fetch(url, {
        // Twitch API headers for authentication
        headers: {
            'Authorization': `Bearer ${envHandler.getEnv().TWITCH_TOKEN}`,
            'Client-ID': envHandler.getEnv().TWITCH_CLIENT_ID,
        },
    });
    let responseJson = JSON.stringify(await response.json(), null, 2);
    return responseJson;
}

module.exports = async (request) => {
    let twitchJson = await getTwitchData();

    return new Response(twitchJson, {
        headers: {
            'content-type': contentType,
        },
    });
};
