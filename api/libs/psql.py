import databases
import os

psql_conn_string = os.environ.get('PSQL_CONN_STRING', 'postgresql://marcin:jebacz1122@localhost/marcin')
db = databases.Database(psql_conn_string)
