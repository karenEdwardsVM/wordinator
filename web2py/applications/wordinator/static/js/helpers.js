const redirect_to = url => {
    window.location.href = url;
};

const call_api = (url, parameters) => {
    return new Promise((resolve, reject) => {
        $.get(url, parameters, (result) => {
            return resolve(result);
        });
    });
};

const get_user_email = () => call_api("/wordinator/api/get_user_email", {});

const get_unread_messages = user_email => {
    return call_api("/wordinator/api/get_messages", {
        user_email,
        unread_only: 1
    }).then(str => JSON.parse(str));
};

const get_all_messages = user_email => {
    return call_api("/wordinator/api/get_messages", {
        user_email,
        unread_only: 0
    }).then(str => JSON.parse(str));
};

const send_message = (from, to, content) => {
    return call_api("/wordinator/api/send_message", {
      from, to, content
    }).then(str => JSON.parse(str));
};
