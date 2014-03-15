import os

settings = dict(
    blog_title=u"Magic: The Gathering",
    template_path=os.path.join(os.path.dirname(__file__), "..", "templates"),
    static_path=os.path.join(os.path.dirname(__file__), "..", "assets"),
    static_url_prefix="/assets/",
    cookie_secret="sagsdgasgd",
    debug=True,
)