from pathlib import Path
import cv2, re, json
from PIL import Image, ImageOps
root=Path(__file__).resolve().parent
data=(root/'dados.js').read_text()
items=re.findall(r'\bid:\s*"(P\d+)"[^\n]*?\bfoto:\s*"([^"]+)"',data)

out=root/'miniaturas';out.mkdir(exist_ok=True)
face=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')
profile=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_profileface.xml')
log=[]
for pid, rel in items:
    src=root/rel
    if not src.is_file(): log.append((pid,'missing',rel));continue
    im=ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    w,h=im.size
    import numpy as np
    a=cv2.cvtColor(np.array(im),cv2.COLOR_RGB2GRAY)
    ratio=min(1,900/max(w,h))
    small=cv2.resize(a,None,fx=ratio,fy=ratio) if ratio<1 else a
    faces=face.detectMultiScale(small,scaleFactor=1.08,minNeighbors=5,minSize=(24,24))
    if len(faces):
        # Favor the largest face; photos with multiple faces can be manually overridden.
        x,y,fw,fh=max(faces,key=lambda v:v[2]*v[3]);x,y,fw,fh=[v/ratio for v in (x,y,fw,fh)]
        # Crop at approx 2.6 face widths, head slightly above center.
        side=min(max(fw*2.65,fh*2.65),max(w,h))
        cx=x+fw/2;cy=y+fh*.78
        state='rosto detectado'
    else:
        side=min(w,h);cx=w/2;cy=h/2;state='enquadramento central (revisar)'
    side=min(side,w,h)
    left=max(0,min(w-side,cx-side/2));top=max(0,min(h-side,cy-side/2))
    crop=im.crop((int(left),int(top),int(left+side),int(top+side))).resize((320,320),Image.Resampling.LANCZOS)
    crop.save(out/f'{pid}.webp','WEBP',quality=86,method=5)
    log.append((pid,state,rel))
(root/'RELATORIO_MINIATURAS.txt').write_text('RESULTADO DO ENQUADRAMENTO AUTOMÁTICO\n\n'+'\n'.join(f'{pid}: {status} — {rel}' for pid,status,rel in log)+'\n\nAs fotografias originais permanecem na pasta fotos/.\n',encoding='utf8')
print(f'Miniaturas geradas: {sum(x[1] != "missing" for x in log)}; rostos detectados: {sum(x[1] == "rosto detectado" for x in log)}')
