import databases
import os

psql_conn_string = os.environ.get('PSQL_CONN_STRING', 'postgresql://postgres:1122@localhost/tmp')
db = databases.Database(psql_conn_string)
