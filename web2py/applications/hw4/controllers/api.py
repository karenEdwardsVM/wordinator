# Here go your api methods.

@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            count_up = (db((db.thumb.post_id == row.id) &
                           (db.thumb.thumb_state == "u")).count())
            count_down = (db((db.thumb.post_id == row.id) &
                            (db.thumb.thumb_state == "d")).count())
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_content=row.post_content,
                post_author=row.post_author,
                thumb = None,
                thumb_difference = count_up - count_down
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL,
                            left=[
                                db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                            ],
                            orderby=~db.post.post_time)
        for row in rows:
            print row
            count_up = (db((db.thumb.post_id == row.post.id) &
                            (db.thumb.thumb_state == "u") &
                            (db.thumb.user_email != auth.user.email)).count())
            count_down = (db((db.thumb.post_id == row.post.id) &
                            (db.thumb.thumb_state == "d") &
                            (db.thumb.user_email != auth.user.email)).count())
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                thumb = None if row.thumb.id is None else row.thumb.thumb_state,
                thumb_difference = count_up - count_down
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))

def edit_post():
    db(db.post.id == request.vars.id).update(
        post_id = request.vars.id,
        post_title = request.vars.title,
        post_content = request.vars.content
    )
    return "post edited"

def get_replies():
    replies = db(db.replies.post_id == request.vars.id).select();
    print(replies)
    return response.json(dict(replies=replies))

def save_reply():
    post_id = int(request.vars.post_id)
    new_reply_id = db.replies.insert(
        post_id = request.vars.post_id,
        body = request.vars.body
    )
    return response.json(dict(new_reply_id=new_reply_id))

def edit_reply():
    db(db.replies.id == request.vars.id).update(
        id = request.vars.id,
        body = request.vars.body
    )
    return "reply edited"

@auth.requires_signature()
def set_thumb():
    print "We got here"
    post_id = int(request.vars.post_id)
    thumb_state = request.vars.thumb_state;
    print "State is:", post_id, thumb_state
    db.thumb.update_or_insert(
        (db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email),
        post_id = post_id,
        user_email = auth.user.email,
        thumb_state = thumb_state
    )
    return "ok" # Might be useful in debugging.
