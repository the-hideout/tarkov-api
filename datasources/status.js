const servicesURL = 'https://status.escapefromtarkov.com/api/services';
const statusMessagesURL = 'https://status.escapefromtarkov.com/api/message/list';
const globalStatusUrl = 'https://status.escapefromtarkov.com/api/global/status';

async function gatherResponse(response) {
    let responseOutput = false;
    try {
        const responseData = await response.json();

        responseOutput = responseData;
    } catch (jsonError){
        console.log('json error');
    }

    return responseOutput;

    /* It's the wrong content-type so this doesn't apply */

    // const { headers } = response;

    // const contentType = headers.get("content-type") || "";

    // if (contentType.includes("application/json")) {
    //     console.log('is json');
    // }

    // if (contentType.includes("application/text")) {
    //     return response.text();
    // }

    // if (contentType.includes("text/html")) {
    //     return response.text();
    // }

    // return response.text();
};

async function handleRequest(url) {
    const init = {
        headers: {
            'accept': 'application/json, text/plain, */*',
        },
    };
    try {
        const response = await fetch(url, init);

        return await gatherResponse(response);
    } catch (requestError){
        console.log('request error');

        return false;
    }
};

module.exports = async () => {
    let services = [];
    let messages = [];
    let globalStatus = false;

    try {
        const [servicesResponse, messagesResponse, globalStatusResponse] = await Promise.allSettled([
            handleRequest(servicesURL),
            handleRequest(statusMessagesURL),
            handleRequest(globalStatusUrl),
        ]);

        if(servicesResponse){
            services = servicesResponse;
        }

        if(messagesResponse){
            messages = messagesResponse;
        }

        if(globalStatusResponse){
            globalStatus = globalStatusResponse;
        }
    } catch (requestError){
        console.log('outer request error');
    }

    const generalStatus = {
        name: 'Global',
        message: globalStatus.message,
        status: globalStatus.status,
    };

    // console.log(services);
    // console.log(messages);
    // console.log(globalStatus);

    return {
        generalStatus: generalStatus,
        currentStatuses: [...services, generalStatus],
        messages: messages,
    };
};