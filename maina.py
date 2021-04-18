from datetime import datetime

def handler(request, context):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    return {
        "statusCode": 200,
        "body": "main.a - " + current_time
    }

