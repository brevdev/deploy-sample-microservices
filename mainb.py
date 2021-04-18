import brev

def handler(request, context):
    response = brev.service("foonode").get("/foo", "")
    print(response)
    return response

