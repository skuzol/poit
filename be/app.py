from flask import Flask, request, jsonify
from flask_serial import Serial
import mysql.connector
import json
from flask_cors import CORS

app = Flask(__name__)
app.config['SERIAL_TIMEOUT'] = 0.1
app.config['SERIAL_PORT'] = '/dev/ttyACM0'
app.config['SERIAL_BAUDRATE'] = 9600
app.config['SERIAL_BYTESIZE'] = 8
app.config['SERIAL_PARITY'] = 'N'
app.config['SERIAL_STOPBITS'] = 1

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'notSecureChangeMe'
app.config['MYSQL_DB'] = 'poit'

CORS(app)
ser = Serial(app)

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="notSecureChangeMe",
  database="poit",
  port=3306
)
mycursor = mydb.cursor(buffered=True)

@app.route('/send', methods = ['POST'])
def handle_send():
    data = request.get_json()
    ser.on_send(data['message'].encode())
    print("send to serial: %s"%data['message'])
    return "OK"

@ser.on_message()
def handle_message(msg):
    data = json.loads(msg.decode())
    save_data(data["temperature"], data["humidity"])

@ser.on_log()
def handle_logging(level, info):
    print(level, info)
    
@app.route('/led', methods = ['POST'])
def changeLedStatus():
    data = request.get_json()
    print(data)
    ser.on_send(json.dumps(data).encode())
    return "OK"

@app.route('/data', methods=['GET'])
def get_data_from_db():    
    mycursor.execute("""SELECT * FROM data""")
    results = mycursor.fetchall()
    return jsonify(results)

@app.route('/data/last', methods=['GET'])
def get_last_data_from_db():    
    mycursor.execute("""SELECT * FROM data ORDER BY id DESC LIMIT 1""")
    results = mycursor.fetchall()
    return jsonify(results)

def save_data(temperature, humidity):
    try:
        mycursor.execute("""Insert Into data (temperature, humidity) Values(%s, %s)""", (temperature, humidity))
        mydb.commit()
    except Exception as e:
        print(e)
    return "OK"

if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")