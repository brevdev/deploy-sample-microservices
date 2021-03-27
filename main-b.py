from datetime import datetime

def handler(request):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    return "main.b - " + current_time

