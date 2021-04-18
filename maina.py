from datetime import datetime

def handler(request, context):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    return "main.a - " + current_time

