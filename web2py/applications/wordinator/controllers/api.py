@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))

@auth.requires_signature()
def edit_post():
    post_id = int(request.vars.post_id)
    content = request.vars.content or ""
    db(db.post.id == post_id).update(
        post_content = content
    )
    return "ok"

@auth.requires_signature()
def add_reply():
    post_id = int(request.vars.post_id)
    content = request.vars.content or ""
    db.reply.insert(
        post_id=post_id,
        reply_content=content
    )
    return "ok"

@auth.requires_signature()
def edit_reply():
    reply_id = int(request.vars.id)
    content = request.vars.content or ""
    db(db.reply.id == reply_id).update(
        reply_content = content
    )
    return "ok"

def get_reply_list(post_id):
    if request.vars.post_id:
        post_id = int(request.vars.post_id)

    return db(db.reply.post_id == post_id).select(db.reply.ALL, orderby=~db.reply.post_time)

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
                thumb_difference = count_up - count_down,
                replies = get_reply_list(row.id),
                editing = False,
                show_replies = False,
                adding_reply = False,
                useremail = None,
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL,
                            left=[
                                db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                            ],
                            orderby=~db.post.post_time)
        for row in rows:
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
                thumb_difference = count_up - count_down,
                replies = get_reply_list(row.post.id),
                editing = False,
                show_replies = False,
                adding_reply = False,
                useremail = auth.user.email,
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))

@auth.requires_signature()
def set_thumb():
    post_id = int(request.vars.post_id)
    thumb_state = request.vars.thumb_state
    db.thumb.update_or_insert(
        (db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email),
        post_id = post_id,
        user_email = auth.user.email,
        thumb_state = thumb_state
    )
    return "ok" # Might be useful in debugging.
