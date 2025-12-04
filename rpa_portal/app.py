from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import time
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle form submission
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == 'admin' and password == 'password':
            session['logged_in'] = True
            return redirect(url_for('check_eligibility'))
        else:
            return render_template('login.html', error="Invalid credentials")
            
    return render_template('login.html')

@app.route('/eligibility', methods=['GET', 'POST'])
def check_eligibility():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        # Simulate processing time
        time.sleep(1)
        
        # Mock results based on input (optional: vary results based on member_id)
        result = {
            "status": "Active",
            "plan": "PPO Gold",
            "deductible_remaining": 500.00,
            "copay": 25.00
        }
        return render_template('eligibility.html', result=result)
        
    return render_template('eligibility.html')

if __name__ == '__main__':
    app.run(port=5001, debug=True)
