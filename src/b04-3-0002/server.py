
import os
import webbrowser

import sys
import http.server
from http.server import SimpleHTTPRequestHandler

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = http.server.HTTPServer
Protocol     = "HTTP/1.0"

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8081
server_address = ('127.0.0.1', port)

# HandlerClass.protocol_version = Protocol
httpd = ServerClass(server_address, HandlerClass)


root = os.path.dirname(os.path.abspath(__file__))

webbrowser.open_new("http://localhost:8081/")

sa = httpd.socket.getsockname()
print("Serving HTTP on", sa[0], "port", sa[1], "...")
httpd.serve_forever()