# coding=utf-8
from TexSoup import TexSoup, TexNode, TokenWithPosition, RArg
import itertools
import time
from urllib.parse import quote
from lxml import etree
import requests
from lxml.html import tostring
from lxml.html import fromstring
import html
from os.path import basename

DEBUG_FILE = "fields.debug"



class Worker(object):

	def __init__(self):
		self.noTexto = {"$", "$$","displaymath","align","tikzpicture","equation","label","fbox","parbox","tikzset"}
		self.argTraducibles = {"proof","theorem", "lemma"}
		self.preprocesado = False
		self.arbol = None
		self.traducibles=dict()
		self.header = ""
		self.nombre=""
		self.tokensConTraducciones=[]



	def preprocesar_texto(self, tex_file):
		if self.preprocesado:
			return
		start_time = time.time()
		tex_text = ''.join(itertools.chain(*tex_file))
		tex_parts = tex_text.split("\\begin{document}",1)
		self.nombre=tex_file.name
		self.header=tex_parts[0]
		self.arbol = TexSoup("\\begin{document}"+tex_parts[1])
		self.explorarArbol(self.arbol)
		self.preprocesado=True
		timee=(time.time() - start_time)
		with open("tiempos.txt", "a") as myfile:
			myfile.write(tex_file.name+":"+str(timee)+"\n")

	def textoSubrayado(self):
		TokenWithPosition.highlight = True
		text=str(self.arbol)
		TokenWithPosition.highlight = False
		return self.header+text

	def explorarArbol(self,arbol):
		for i in arbol.contents:
			if isinstance(i,TokenWithPosition):
				i.setTranslatable(True)
				if i._translatable:
					self.tokensConTraducciones.append(i)
			if isinstance(i,TexNode):
				if i.name.strip("*") not in self.noTexto:
					self.explorarArbol(i)
					if i.name in self.argTraducibles and len(i.args)>0:
						for j in [k for k in i.args[0].contents if isinstance(k,TokenWithPosition)]:
							j.setTranslatable(True)
				else:
					node= next(i.contents)
					if isinstance(node,TokenWithPosition) and "\\text{" in node:
						node.splitText()
						self.tokensConTraducciones.append(node)

	def make_traducibles(self):
		u = 0
		for i in self.tokensConTraducciones:
			for j in i.segments:
				if j.bool:
					self.traducibles[str(u)]=j
					u+=1

	def get_html(self):
		htmlTree = etree.Element("html")
		self.make_traducibles()
		for key, value in self.traducibles.items():
			etree.SubElement(htmlTree, "label", name=key).text = '"'+value+'"'
		#print(etree.tostring(htmlTree))
		return etree.tostring(htmlTree,encoding="utf8")


	def parse_html(self,langpair):
		session = requests.Session()
		session.get("http://gaio.xunta.gal/Tradutor/traducir/index")
		self.make_traducibles()
		r = session.get("http://gaio.xunta.gal/Tradutor/traducir/url?langpair="+langpair+"&tematicos=cidadania&url=http%3A%2F%2Flatex.manueldeprada.com%3A5000%2FmakeFile%3Ffile%3D"+quote(basename(self.nombre)))
		#print("http://gaio.xunta.gal/Tradutor/traducir/url?langpair="+langpair+"&tematicos=cidadania&url=http%3A%2F%2Flatex.manueldeprada.com%3A5000%2FmakeFile%3Ffile%3D"+quote(basename(self.nombre)))
		html2 = fromstring(html.unescape(r.text))
		lista = html2[0]
		for i in lista:
			self.traducibles[i.attrib["name"]].trad=str(i.text)[1:-1]
		#print(tostring(html2, encoding="utf-8"))

	def traducir(self,langpair='es-gl'):
		self.parse_html(langpair)

	def reconstruir(self):
		self.traducir()
		TokenWithPosition.reconstruir = True
		text = str(self.arbol)
		TokenWithPosition.reconstruir = False
		return self.header+text
