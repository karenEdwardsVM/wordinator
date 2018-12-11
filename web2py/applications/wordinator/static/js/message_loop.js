let message_loop = null;

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
                    });
                });
            });
        }, 5000);
    }
});
