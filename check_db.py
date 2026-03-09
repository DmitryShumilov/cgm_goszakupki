import psycopg2
import sys
import os

os.environ['POSTGRES_PASSWORD'] = 'Paravoz12'

try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='Paravoz12',
        database='cgm_dashboard'
    )
    sys.stdout.write("PostgreSQL connected!\n")
    sys.stdout.flush()
    
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM purchases")
    result = cur.fetchone()
    sys.stdout.write(f"Records in purchases: {result[0]}\n")
    cur.close()
    conn.close()
except Exception as e:
    sys.stdout.write(f"Error: {str(e)}\n")
    sys.stdout.flush()
