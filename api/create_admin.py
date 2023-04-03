import psycopg2

from libs.common import get_hashed_password

conn = psycopg2.connect(host='localhost', dbname='tmp', user='postgres', password='1122')
cur = conn.cursor()

hashed_password = get_hashed_password('123')
print(hashed_password)
cur.execute('insert into users(username, password, is_admin) values (%s, %s, %s)', ('admin', hashed_password, True))
conn.commit()