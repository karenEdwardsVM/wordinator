const get_user_email = () => {
    return new Promise((resolve, reject) => {
        $.get("/wordinator/api/get_user_email", {}, (result) => {
            return resolve(result);
        });
    });
};

const redirect_to = url => {
    window.location.href = url;
};
