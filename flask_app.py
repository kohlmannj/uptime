from flask import Flask, jsonify, render_template
from flask_util_js.flask_util_js import FlaskUtilJs
import stats

# App Setup
app = Flask(__name__)

# flask_util.url_for() in JavaScript: https://github.com/kohlmannj/flask_util_js
fujs = FlaskUtilJs(app)


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/sample', methods=['GET'])
def sample():
    from sys import platform as _platform
    if _platform == "linux" or _platform == "linux2":
        # Linux
        return jsonify({})
    elif _platform == "darwin":
        # OS X
        return jsonify(stats.get_stats())
    elif _platform == "win32":
        # Windows
        return jsonify({})


if __name__ == '__main__':
    app.run()
