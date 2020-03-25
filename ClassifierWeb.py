from flask import Flask, request
from flask import render_template
from werkzeug import secure_filename
from SoundClassifier import *


app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def classify():
    data = request.get_json()
    print(data)
    return data


@app.route('/upload', methods = ['GET', 'POST'])
def upload_audio():
    print("form")
    print(request.form)
    print("headers")
    print(request.headers)
    if request.method == 'POST':
        print(request.files)
        f = request.files['file'] if request.files.get('file') else None
        # f.save(secure_filename(f.filename))
        return 'office'
    return 'womp womp'


if __name__=='__main__':
    # generate_plot(regenerate=True)
    app.run(host='0.0.0.0', port='9966')
