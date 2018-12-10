// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    // self.extend = function(a, b) {
    //     for (var i = 0; i < b.length; i++) {
    //         a.push(b[i]);
    //     }
    // };

    // Enumerates an array.
    // var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    // self.get_posts = function(after) {
    //     $.getJSON(get_post_list_url,
    //         function(data) {
    //             // I am assuming here that the server gives me a nice list
    //             // of posts, all ready for display.
    //             self.vue.post_list = data.post_list;
    //             // Post-processing.
    //             self.process_posts();
    //             console.log("I got my list");
    //
    //             if (typeof(after) == 'function') {
    //               after();
    //             }
    //         }
    //     );
    //     console.log("I fired the get");
    // };

    // self.process_posts = function() {
    //     // This function is used to post-process posts, after the list has been modified
    //     // or after we have gotten new posts.
    //     // We add the _idx attribute to the posts.
    //     enumerate(self.vue.post_list);
    //     // We initialize the smile status to match the like.
    //     self.vue.post_list.map(function (e) {
    //         // I need to use Vue.set here, because I am adding a new watched attribute
    //         // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
    //         // The code below is commented out, as we don't have smiles any more.
    //         // Replace it with the appropriate code for thumbs.
    //         // // Did I like it?
    //         // // If I do e._smile = e.like, then Vue won't see the changes to e._smile .
    //         // Vue.set(e, '_smile', e.like);
    //     });
    // };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            list_name: "",
            content: "",
            post_list: []
        },
        methods: {
            add_list: self.add_list,
        }

    });

    // If we are logged in, shows the form to add posts.
    // if (is_logged_in) {
    //     $("#add_list").show();
    // }

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
