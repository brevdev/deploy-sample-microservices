from datetime import datetime

import brev

def handler(request):
    brev.db_query("SHOW DATABASES")
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    return "main.a - " + current_time

