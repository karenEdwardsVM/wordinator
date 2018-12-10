#@auth.requires_signature()
#def add_post():
#    post_id = db.post.insert(
#        post_title=request.vars.post_title,
#        post_content=request.vars.post_content,
#    )
#    # We return the id of the new post, so we can insert it along all the others.
#    return response.json(dict(post_id=post_id))
#
#@auth.requires_signature()
#def edit_post():
#    post_id = int(request.vars.post_id)
#    content = request.vars.content or ""
#    db(db.post.id == post_id).update(
#        post_content = content
#    )
#    return "ok"
#
#def get_reply_list(post_id):
#    if request.vars.post_id:
#        post_id = int(request.vars.post_id)
#
#    return db(db.reply.post_id == post_id).select(db.reply.ALL, orderby=~db.reply.post_time)

#@auth.requires_signature()

import time
import json

def add_list():
    list_name = request.vars.list_name
    content = request.vars.content
    print("Running add_list: ", list_name, content)

    # add list to list table
    list_id = db.lists.insert(name = list_name)

    # fill word table with list words, definitions, 1 by 1
    for s in content.split("|"):
        word, definition = s.split(",")
        db.words.insert(
            list_id = list_id,
            word = word,
            definition = definition,
            seen = 0,
            correct = 0,
            ts = 0,
        )
    return response.json(dict(list_id = list_id, inserted = len(content.split("|"))))

#@auth.requires_signature()
def get_word():
    update_seen = int(request.vars.update_seen or 0)
    list_id = int(request.vars.list_id or 0)

    word = db(db.words.seen < 6 & list_id == db.words.list_id).select(
        db.words.ALL,
        orderby = '<random>',
        limitby = (0,1),
    )
    word = word[0].as_dict()

    if update_seen == 1:
        db(db.words.id == word["id"]).update(
            ts = int(time.time()),
            seen = int(word.seen) + 1,
        )

    return json.dumps(word)

def get_words():
    count = int(request.vars.count)
    return json.dumps([json.loads(get_word()) for i in range(0, count)])

#def get_high_scores
