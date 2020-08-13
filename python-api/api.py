#!/usr/bin/env python3
from flask import Flask,request,Response
from worker import Worker
from json import decoder, encoder
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import time
import atexit
import os

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "http://latex.manueldeprada.com"}})
workers = {};

def garbage_collect():
	print(time.strftime("%d-%m,%H:%M")+" - Collecting garbage...")
	workers.clear()


scheduler = BackgroundScheduler()
scheduler.add_job(func=garbage_collect, trigger="interval", days=1)
scheduler.start()

# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())



@app.route('/')
def main():
	return 'wonky donky'

# def subrayar(texto,worker):
# 	worker.preprocesar_texto(texto)
	# lista = worker.calcular_resaltado()
	# j = 0
	# k = 0
	# nuevo = ""
	# while j < len(texto):
	# 	if k < len(lista):
	# 		if (lista[k][0] == j):
	# 			nuevo += "<mark>"
	# 		if (lista[k][0] + lista[k][1] == j):
	# 			nuevo += "</mark>"
	# 			k += 1
	# 	if texto[j] == '\n':
	# 		nuevo += "</br>"
	# 	else:
	# 		nuevo += texto[j]
	# 	j += 1
	# return nuevo
	# return worker.textoSubrayado()

# @app.route('/downloadXML')
# def downloadXML():
# 	file = request.args.get('file')
# 	if file not in workers:
# 		print("ERROR")
# 	res=workers[file].get_xml_file()
# 	return Response(
#         res,
#         mimetype="text/xml",
#         headers={"Content-disposition":
#                  "attachment; filename=translatable_fields.xml"})

@app.route('/downloadTex')
def downloadTex():
	file = request.args.get('file')
	if file not in workers:
		print("ERROR")
	res=workers[file].reconstruir()
	split=os.path.splitext(file)
	return Response(
        res,
        mimetype="text/tex",
        headers={"Content-disposition":
                 "attachment; filename="+split[0]+"_translated"+split[1].strip("_")})

@app.route('/uploadXML',methods=['POST'])
def uploadXML():
	file = request.args.get('file')
	if file not in workers:
		print("ERROR,"+file)
	#res=workers[file].get_xml_file()
	#print(request.files['file'].read())
	#print(request.files['file'])
	upload=request.files['file'].read().decode("utf-8")
	try:
		workers[file].set_xml_to_campos(upload)
	except:
		del workers[file]
		raise
	return "allright"

@app.route('/preprocesar')
def preprocesar():
	file = request.args.get('file')
	f = open("/home/prada/translatex_front/uploads/"+file, "r")
	if file not in workers:
		workers[file] = Worker()
	workers[file].preprocesar_texto(f)
	#res=subrayar(f.read(),workers[file])
	return workers[file].textoSubrayado().replace("\n","<br>\n")

@app.route('/makeFile')
def makeFile():
	file = request.args.get('file')
	f = open("/home/prada/translatex_front/uploads/"+file, "r")
	if file not in workers:
		workers[file] = Worker()
	return workers[file].get_html()


if __name__ == '__main__':
	#app.debug = True
	app.run(host = '0.0.0.0',port=5000)
