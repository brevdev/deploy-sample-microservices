from datetime import datetime

import brev

def handler(request):
    brev.db_query("foo", "SHOW TABLES;")
    brev.db_query("foo", "SELECT COUNT(1);")
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    return {
        "message": "main.a - " + current_time,
    }

