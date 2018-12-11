let message_loop = null;
let on_messages = [];

const on_message = handler => {
    if (!on_messages.includes(handler)) {
        on_messages.push(handler);
    }
};

Notification.requestPermission().then(permission => {
    if (permission == "granted") {
        message_loop = setInterval(() => {
            get_user_email().then(email => {
                if (email == "None") {
                    clearInterval(message_loop);
                    return;
                }
                get_unread_messages("mine").then(messages => {
                    messages.forEach(m => {
                        new Notification(`Message from ${m.from}: ${m.content}`);
                        on_messages.forEach(handler => {
                            handler(m);
                        });
                    });
                });
            });
        }, 5000);
    }
});
