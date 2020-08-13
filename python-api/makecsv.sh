echo "Nombre;Tamano;Tiempo" > tiempos.csv
paste -d ';' <(cut -d':' -f1 <tiempos.txt) <(cut -d':' -f1 <tiempos.txt | xargs -d '\n' stat --printf="%s\n") <( cut -d':' -f2 <tiempos.txt)  >>tiempos.csv
