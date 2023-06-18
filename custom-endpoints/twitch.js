var twitch_token_value = '';
var twitch_client_id_value = '';
try {
    // this value comes from our wrangler environment variables as a secret
    twitch_token_value = TWITCH_TOKEN
    twitch_client_id_value = TWITCH_CLIENT_ID
} catch (e) {
    console.warn('TWITCH_TOKEN or TWITCH_CLIENT_ID not set; twitch features disabled');
}


// The Twitch API url to hit for EFT data
const url = "https://api.twitch.tv/helix/streams?game_id=491931&first=100"
// Twitch API headers for authentication
const init = {
    headers: {
        'Authorization': `Bearer ${twitch_token_value}`,
        'Client-ID': twitch_client_id_value,
    },
};
// Response content-type headers
const contentType = 'application/json;charset=UTF-8';

// Make a request to the Twitch API to get data for EFT streams
async function getTwitchData() {
    let response = await fetch(url, init);
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
