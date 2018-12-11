# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

# users table
db.define_table(
    'users',
    Field('email', default=get_user_email()),
    Field('name', 'text'),
)

# words table
db.define_table(
    'words',
    Field('list_id'),
    Field('word', 'text'),
    Field('definition', 'text'),
    Field('seen', default=0),
    Field('correct', default=0),
    Field('incorrect', default=0),
    Field('ts', default=0),
)

db.define_table(
    'lists',
    Field('name', 'text'),
)

db.define_table(
    'user_lists',
    Field('user_email', 'text'),
    Field('list_id'),
    Field('correct', default=0),
    Field('played', default=0)
)

db.define_table(
    'user_messages',
    Field('from_email', 'text'),
    Field('to_email', 'text'),
    Field('mcontent', 'text'),
    Field('sent_at', default=0),
    Field('has_been_read', default=0)
)
