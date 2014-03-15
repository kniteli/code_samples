import tornado.ioloop
import tornado.web
import tornado.options
import tornado.httpserver
from config.urls import urls
from config.settings import settings

class Application(tornado.web.Application):

    def __init__(self, handlers, settings):
    	tornado.web.Application.__init__(self, handlers, **settings)

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(Application(urls, settings))
    http_server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()