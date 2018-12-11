import time
import json

def get_user_email():
    return None if auth.user is None else auth.user.email

def add_list():
    list_name = request.vars.list_name
    content = request.vars.content
    print("Running add_list: ", list_name, content)

    # add list to list table
    list_id = db.lists.insert(name = list_name)

    # add owner to the user lists table
    if get_user_email():
        print("Adding list to email", get_user_email(), list_id)
        db.user_lists.insert(user_email = get_user_email(), list_id = list_id)

    inserted = 0
    # fill word table with list words, definitions, 1 by 1
    for s in content.split("|"):
        if len(s) > 2:
            word, definition = s.split(",")
            db.words.insert(
                list_id = list_id,
                word = word,
                definition = definition,
                seen = 0,
                correct = 0,
                ts = 0,
            )
            inserted = inserted + 1

    return json.dumps(dict(list_id = list_id, inserted = inserted))

#@auth.requires_signature()
def get_word():
    update_seen = int(request.vars.update_seen or 0)
    list_id = int(request.vars.list_id or 0)

    word = db(list_id == db.words.list_id).select(
        db.words.ALL,
        orderby = '<random>',
        limitby = (0,1),
    )

    word = word[0].as_dict()

    if update_seen == 1:
        db(db.words.id == word["id"]).update(
            ts = int(time.time()),
            seen = int(word["seen"]) + 1,
        )

    return json.dumps(word)

#@auth.requires_signature()
def get_words():
    count = int(request.vars.count or 0)
    return json.dumps([json.loads(get_word()) for i in range(0, count)])

def get_high_scores():
    if not request.vars.list_id:
        return json.dumps([])

    list_id = int(request.vars.list_id)

    scores = db.executesql("""
SELECT
    user_email, list_id, correct, played,
    ((correct * 10) - ((played - correct) * 5)) as score
FROM user_lists WHERE list_id = {query_list_id}
ORDER BY score DESC;
    """.format(
        query_list_id = list_id
    ))

    out = []

    for s in scores:
        out.append({
            "user_email": str(s[0]),
            "list_id": int(s[1]),
            "correct": int(s[2]),
            "played": int(s[3]),
            "score": int(s[4])
        })

    return json.dumps(out)

#@auth.requires_signature()
def get_user_lists():
    user_email = request.vars.email or get_user_email()

    if not user_email:
        return json.dumps([])

    lists = db.executesql("""
SELECT
    list_id,
    lists.name
FROM user_lists
LEFT JOIN lists ON (lists.id == user_lists.list_id)
WHERE user_email = '{email}';
    """.format(
        email = user_email
    ))

    out = []

    for l in lists:
        out.append({
            "name": l[1],
            "list_id": int(l[0])
        })

    return json.dumps(out)

#@auth.requires_signature()
def score_word():
    print("SW called with", request.vars)
    if (not request.vars.word_id) or (not request.vars.correct) or (not get_user_email()):
        return False

    word_id = int(request.vars.word_id)
    correct = int(request.vars.correct)

    word = db(db.words.id == word_id).select(db.words.ALL)

    if len(word) == 0:
        return "{\"error\": \"Couldn't find word: " + str(word_id) + "\"}"
    else:
        word = word[0].as_dict()

    list_entry = db.executesql("""
SELECT
    id,
    user_email,
    list_id,
    correct,
    played
FROM user_lists
WHERE user_email = '{email}' AND list_id = {list_id};
    """.format(
        email = get_user_email(),
        list_id = word["list_id"]
    ))

    if len(list_entry) == 0:
        list_entry = {
            "user_email": get_user_email(),
            "list_id": word["list_id"],
            "correct": 0,
            "played": 0
        }
        list_entry["id"] = db.user_lists.insert(
            user_email = get_user_email(),
            list_id = word["list_id"],
            correct = 0,
            played = 0
        )
    else:
        list_entry = list_entry[0]
        list_entry = {
            "id": int(list_entry[0]),
            "user_email": str(list_entry[1]),
            "list_id": int(list_entry[2]),
            "correct": int(list_entry[3]),
            "played": int(list_entry[4]),
        }

    list_entry["correct"] = list_entry["correct"] + correct
    list_entry["played"] = list_entry["played"] + 1

    db(db.user_lists.id == list_entry["id"]).update(
        correct = list_entry["correct"],
        played = list_entry["played"]
    )

    if correct == 1:
        db(db.words.id == word_id).update(
            correct = int(word["correct"]) + 1
        )
    else:
        db(db.words.id == word_id).update(
            incorrect = int(word["incorrect"]) + 1
        )

    return "ok"
