const servicesURL = 'https://status.escapefromtarkov.com/api/services';
const statusMessagesURL = 'https://status.escapefromtarkov.com/api/message/list';
const globalStatusUrl = 'https://status.escapefromtarkov.com/api/global/status';

async function gatherResponse(response) {
    return await response.json();

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
    const [services, messages, globalStatus] = await Promise.all([
        handleRequest(servicesURL),
        handleRequest(statusMessagesURL),
        handleRequest(globalStatusUrl),
    ]);

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