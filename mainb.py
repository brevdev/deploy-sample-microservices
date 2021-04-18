import brev

def handler(request):
    response = brev.service("foonode").get("/foo", "")
    print(response)
    return response

