from __future__ import print_function
from flask import Flask, render_template,request,redirect, url_for, session
import re
import requests
import json

app = Flask(__name__)
app.secret_key = "super secret key"
url="http://localhost:8080"
@app.route('/')
def home():

    return render_template('home.html')

@app.route('/log_in/')
def log_in():
    return render_template('log_in.html', error=None)

@app.route('/sign_up/')
def sign_up():
    return render_template('sign_up.html', error=None)

@app.route('/profile/',methods = ['POST', 'GET'])
def profile():
    error = None
    done=0
    data = None
    if request.method == 'POST':
        usrid = request.form['id']
        pass_word=request.form['password']
        email = request.form['email']
        r= requests.post(url+"/login",data={"username":usrid,"password":pass_word})
        print(r.text)
        y=json.loads(r.text)
        un="naveen"
        pw=12345
        if "login" in y:
            if y["login"]=="success":
                done=1
                username=y["username"]
                session['username'] = username
                session['email'] = email
                session.modified = True
                r= requests.post(url+"/list",data={"username":username})
                y=json.loads(r.text);
                print(y)
                return render_template('profile.html',username=username,data=y)
            else:
                error= 'INVALID CREDENTIALS'
                return render_template('log_in.html', error=error)
        else:
            error= y["error"]
            return render_template('log_in.html', error=error)

@app.route('/addnotes/',methods = ['POST', 'GET'])
def addnotes():
    if request.method == 'POST':
        note= request.form['notes']
        usrid= session['username']
        r= requests.post(url+"/note",data={"username":usrid,"note":note})
        y=json.loads(r.text)
        print(y)
        r= requests.post(url+"/list",data={"username":usrid})
        y=json.loads(r.text);
        print(y)
        return render_template('profile.html',username=usrid,data=y)

# @app.route('/addfriend/',methods = ['POST', 'GET'])
# def addnotes():
#     if request.method == 'POST':
#         friend= request.form['friend']
#         usrid= session["username"]
#         r= requests.post(url+"/addfriend",data={"username":usrid,"friend":friend})
#         y=json.loads(r.text)
#         print(y)
#         r= requests.post(url+"/list",data={"username":usrid})
#         y=json.loads(r.text);
#         print(y)
#         return render_template('profile.html',username=usrid,data=y)

@app.route('/addaccount/',methods = ['POST', 'GET'])
def addaccount():
    error = None
    done=0
    data = None
    if request.method == 'POST':
        usrid = request.form['id']
        pass_word=request.form['password']
        confirm_password=request.form['confirm_password']
        r= requests.post(url+"/register",data={"username":usrid,"password":pass_word,"confirm":confirm_password})
        print(r.text)
        y=json.loads(r.text)
        un="naveen"
        pw=12345
        if "success" in y:
            if y["success"]=="Account created":
                done=1
                error= y["success"]
                username=y["username"]
                return render_template('log_in.html',success=error)
        else:
            error= y["error"]
            return render_template('sign_up.html', error=error)

@app.route('/log_out/')
def log_out():
     session.pop('username', None)
     session.pop('email',None)
     return render_template('log_out.html')

if __name__ == '__main__':
    app.run(debug=True)
