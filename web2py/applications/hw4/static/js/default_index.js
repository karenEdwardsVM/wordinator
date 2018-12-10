// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0; return v.map(function(e) {
            e._idx = k++;
            Vue.set(e, 'editing', false);
            Vue.set(e, 'replyEdit', false);
            Vue.set(e, 'showReplies', false);
            Vue.set(e, 'replies', []);
            Vue.set(e, 'addingReply', false);
            Vue.set(e, 'newReply', '');
        });
    };

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy
        var sent_content = self.vue.form_content; //
        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                // Adds the post to the list of posts.
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_content: sent_content
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };

    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like.
        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // The code below is commented out, as we don't have smiles any more.
            // Replace it with the appropriate code for thumbs.
            // // Did I like it?
            // // If I do e._smile = e.like, then Vue won't see the changes to e._smile .
            // Vue.set(e, '_smile', e.like);
            Vue.set(e, 'thumbsup', e.thumbsup);
            Vue.set(e, 'thumbsdown', e.thumbsdown);
            //Vue.set(e, 'thumb_difference', e.thumb_difference + (e.thumb == 'u' ? 1 : (e.thumb == 'd' ? -1 : 0)));
        });
    };

    var editPost = function(post_idx) {
        self.vue.post_list[post_idx].editing = true;
    };

    var savePost = function(post_idx) {
        self.vue.post_list[post_idx].editing = false;
        var postToEdit = self.vue.post_list[post_idx];
        $.post(editPostUrl, {
            id: postToEdit.id,
            title: postToEdit.post_title,
            content: postToEdit.post_content
        });
    };

    var showReplies = function(post_idx) {
        var id = self.vue.post_list[post_idx].id;
        var url = getRepliesUrl + '?id=' + id;

        //console.log(self.vue.post_list);
        self.vue.post_list[post_idx].showReplies = true;
        //console.log("showing replies");
        $.post(url, function(response) {
            //console.log(self.vue.post_list);
            //console.log(response);
            self.vue.post_list[post_idx].replies = response.replies;
        });
    };

    var hideReplies = function(post_idx) {
        //console.log("calling hide");
        self.vue.post_list[post_idx].showReplies = false;
    };

    var toggleAddingReplies = function(post_idx) {
        self.vue.post_list[post_idx].addingReply = !self.vue.post_list[post_idx].addingReply;
    };

    var saveReply = function(post_idx) {

        var newReply = {
            post_id: self.vue.post_list[post_idx].id,
            body: self.vue.post_list[post_idx].newReply,
        };
        $.post(saveReplyUrl, newReply, function(response) {
            newReply['id'] = response.new_reply_id;
            // unshift puts at the top
            self.vue.post_list[post_idx].replies.unshift(newReply);
        });

    };


    var editReply = function(post_idx) {
        //var replying = self.vue.post_list[post_idx]
        //console.log(self.vue.post_list[post_idx].replies[reply_idx]);
        //var id = self.vue.post_list[post_idx].id;
        //console.log(self.vue.post_list[post_idx].replies[0]);
        //self.vue.post_list[post_idx].replies.replyEdit = true;
        //console.log(self.vue.post_list[post_idx].replies[reply_idx].editing);
        self.vue.post_list[post_idx].replyEdit = true;
    };

    var saveReplyEdit = function(post_idx) {
        self.vue.post_list[post_idx].replyEdit = false;
        var replyToEdit = self.vue.post_list[post_idx].replies;
        console.log(replyToEdit);
        //var newEdit = {
        //    post_id: self.vue.post_list[post_idx].id,
        //    body: self.vue.post_list[post_idx].newEdit,
        //};
        $.post(editReplyUrl, {
            //newEdit['id'] = response.new_reply_id;
            post_id: self.vue.post_list[post_idx],
            body: replyToEdit.body
            //self.vue.post_list[post_idx].replies.unshift(newEdit);
        });
    };

    self.thumbs_mouseover = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        if (thumb == 'u') {
            p.thumbsup = true;
        } else {
            p.thumbsdown = true;
        }
    };

    self.thumbs_mouseout = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        if (thumb == 'u') {
            p.thumbsup = false;
        } else {
            p.thumbsdown = false;
        }
    };

    self.thumbs_click = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        if (p.thumb == thumb) {
            p.thumb = null;
        }
        else {
            p.thumb = thumb;
        }

        // We need to post back the change to the server.
        $.post(set_thumb_url, {
           post_id: p.id,
           thumb_state: thumb
       }); // Nothing to do upon completion.
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_email: user_email,
            form_title: "",
            form_content: "",
            post_list: [],
        },
        methods: {
            add_post: self.add_post,
            editPost: editPost,
            savePost: savePost,
            showReplies: showReplies,
            hideReplies: hideReplies,
            toggleAddingReplies: toggleAddingReplies,
            saveReply: saveReply,
            editReply: editReply,
            saveReplyEdit: saveReplyEdit,
            thumbs_mouseover: self.thumbs_mouseover,
            thumbs_mouseout: self.thumbs_mouseout,
            thumbs_click: self.thumbs_click,
            count_thumbsup: self.count_thumbsup,
            count_thumbsdown: self.count_thumbsdown,

        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();
    }

    // Gets the posts.
    self.get_posts();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
