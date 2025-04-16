# wsgi.py
from gem_rag_new import app  # make sure gem_rag_new.py defines app = Flask(__name__) or similar

# This is what Gunicorn looks for
application = app

