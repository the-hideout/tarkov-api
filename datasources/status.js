const servicesURL = 'https://status.escapefromtarkov.com/api/services';
const statusMessagesURL = 'https://status.escapefromtarkov.com/api/message/list';
const globalStatusUrl = 'https://status.escapefromtarkov.com/api/global/status';

const statusMap = [
    'OK',
    'Updating',
    'Unstable',
    'Down',
];

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
    const response = await fetch(url, init);

    return await gatherResponse(response);
};

module.exports = async () => {
    let services = [];
    let messages = [];
    let globalStatus = {
        message: 'N/A',
        status: 2,
    };

    try {
        const [servicesResponse, messagesResponse, globalStatusResponse] = await Promise.allSettled([
            handleRequest(servicesURL),
            handleRequest(statusMessagesURL),
            handleRequest(globalStatusUrl),
        ]);

        if(servicesResponse && servicesResponse.status && servicesResponse.status === 'fulfilled' && servicesResponse.value){
            services = servicesResponse.value.map((serviceStatus) => {
                return {
                    ...serviceStatus,
                    statusCode: statusMap[serviceStatus.status],
                };
            });
        }

        if(messagesResponse && messagesResponse.status && messagesResponse.status === 'fulfilled' && messagesResponse.value){
            messages = messagesResponse.value.map((message) => {
                return {
                    ...message,
                    statusCode: statusMap[message.type],
                };
            });
        }

        if(globalStatusResponse && globalStatusResponse.status && globalStatusResponse.status === 'fulfilled' && globalStatusResponse.value){
            globalStatus = globalStatusResponse.value;
        }
    } catch (requestError){
        console.log('outer request error');
    }

    const generalStatus = {
        name: 'Global',
        message: globalStatus.message,
        status: globalStatus.status,
        statusCode: statusMap[globalStatus.status],
    };

    return {
        generalStatus: generalStatus,
        currentStatuses: [...services, generalStatus],
        messages: messages,
    };
};