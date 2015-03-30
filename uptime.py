from flask import Flask, render_template
from flask_util_js.flask_util_js import FlaskUtilJs

# App Setup
app = Flask(__name__)

# flask_util.url_for() in JavaScript: https://github.com/kohlmannj/flask_util_js
fujs = FlaskUtilJs(app)


@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run()
    print app.config
