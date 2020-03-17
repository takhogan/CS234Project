from flask import Flask, request
from flask import render_template
from SoundClassifier import *


app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def classify():
    data = request.get_json()
    return str(data)


if __name__=='__main__':
    # generate_plot(regenerate=True)
    app.run()
