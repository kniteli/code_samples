from handlers import homehandler
from handlers import websockethandler
import tornado.web

urls = [
    (r"/", homehandler.HomeHandler),
    (r"/ws", websockethandler.WebSocketHandler)
]