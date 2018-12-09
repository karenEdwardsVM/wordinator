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
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

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
                    post_content: sent_content,
                    thumb: null,
                    thumb_difference: 0
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function(after) {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list");

                if (typeof(after) == 'function') {
                  after();
                }
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
            Vue.set(e, 'thumb_difference', e.thumb_difference);
            Vue.set(e, 'thumbsdown', e.thumbsdown);
            Vue.set(e, 'thumbsup', e.thumbsup);
        });
    };

    self.edit_post = function (post_idx, content) {
      var p = self.vue.post_list[post_idx];
      console.log("Editing", post_idx, content, p.id);

      Vue.set(p, 'post_content', content);
      Vue.set(p, 'editing', false);

      $.post(edit_post_url, {
        post_id: p.id,
        content: content
      });
    };

    self.toggle_add_reply = function (post_idx) {
      var p = self.vue.post_list[post_idx];
      Vue.set(p, 'adding_reply', !p.adding_reply);
    };

    self.add_reply = function (post_idx, content) {
      var p = self.vue.post_list[post_idx];
      Vue.set(p, 'adding_reply', false);

      const id = p.id;

      $.post(add_reply_url, {
        post_id: p.id,
        content: content
      }, function () {
        self.get_posts(function () {
          self.vue.post_list.forEach(function (post) {
            if (post.id == id) {
              Vue.set(post, 'show_replies', true);
            }
          });
        });
      });
    };

    self.toggle_edit_reply = function (post_idx, reply_id) {
      var p = self.vue.post_list[post_idx];
      Vue.set(p, 'replies', p.replies.map(function (reply) {
        if (reply_id == reply.id) {
          reply.editing = !reply.editing;
        }
        return reply;
      }));
    };

    self.edit_reply = function (post_idx, reply_id, content) {
      const id = self.vue.post_list[post_idx].id;

      $.post(edit_reply_url, {
        id: reply_id,
        content: content
      }, function () {
        self.get_posts(function () {
          self.vue.post_list.forEach(function (post) {
            if (post.id == id) {
              Vue.set(post, 'show_replies', true);
            }
          });
        });
      });
    };

    self.thumbs_mouseover = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        p.thumbsup = (thumb == 'u');
        p.thumbsdown = (thumb == 'd');
    };

    self.thumbs_mouseout = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        p.thumbsup = false;
        p.thumbsdown = false;
    };

    self.toggle_edit_post = function(post_idx) {
      var p = self.vue.post_list[post_idx];
      Vue.set(p, 'editing', !p.editing);
    };

    self.toggle_show_replies = function(post_idx) {
      var p = self.vue.post_list[post_idx];
      Vue.set(p, 'show_replies', !p.show_replies);

      $.get(get_reply_url, {
        post_id: p.id
      }, function (replies) {
        Vue.set(p, 'replies', replies);
      });
    };

    self.thumbs_click = function(post_idx, thumb) {
        var p = self.vue.post_list[post_idx];

        p.thumb = (p.thumb == thumb ? null : thumb);

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
            form_title: "",
            form_content: "",
            post_list: []
        },
        methods: {
            toggle_add_reply: self.toggle_add_reply,
            toggle_show_replies: self.toggle_show_replies,
            toggle_edit_post: self.toggle_edit_post,
            toggle_edit_reply: self.toggle_edit_reply,
            add_post: self.add_post,
            edit_post: self.edit_post,
            add_reply: self.add_reply,
            edit_reply: self.edit_reply,
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
