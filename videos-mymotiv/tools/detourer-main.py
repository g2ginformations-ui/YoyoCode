# Détourage de la photo de main (usage : python3 tools/detourer-main.py photo.webp) : fond gris et manche retirés,
# poignet fondu, image retournée en main droite → public/mains/main-photo.png (bout du doigt actif : x 179, y 45).
import sys
from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage as nd
im=Image.open(sys.argv[1]).convert('RGB')
a=np.asarray(im).astype(int); R,G,B=a[...,0],a[...,1],a[...,2]
H,W=R.shape; yy,xx=np.mgrid[0:H,0:W]
m=((R-G)>7)|((R-B)>14)
m=nd.binary_opening(m,iterations=2)
lab,n=nd.label(m); sizes=nd.sum(m,lab,range(1,n+1)); keep=lab==(np.argmax(sizes)+1)
keep=nd.binary_fill_holes(keep)
bright=(a.mean(-1)>218)&~((xx<620)&(yy>740))
keep2=keep|(bright&nd.binary_dilation(keep,iterations=28))
keep2=nd.binary_opening(keep2,iterations=1)
lab,n=nd.label(keep2); sizes=nd.sum(keep2,lab,range(1,n+1)); keep2=lab==(np.argmax(sizes)+1)
keep2=nd.binary_fill_holes(keep2)
# fond gris visible entre les doigts (hors bague et ongles brillants)
ring=(xx>300)&(xx<540)&(yy>800)&(yy<1010)
grey=(np.abs(R-G)<7)&((R-B)<9)&(a.mean(-1)<222)&keep2&~ring
grey=nd.binary_opening(grey,iterations=1)
keep3=keep2&~grey
alpha=np.asarray(Image.fromarray((keep3*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.4))).astype(float)/255
p0=np.array([0,800.]); p1=np.array([720,1200.]); d=(p1-p0)/np.linalg.norm(p1-p0); nrm=np.array([d[1],-d[0]])
dist=(xx-p0[0])*nrm[0]+(yy-p0[1])*nrm[1]
alpha*=np.clip((dist+15)/75,0,1)*np.clip((H-8-yy)/150,0,1)
img=Image.fromarray(np.dstack([a.astype(np.uint8),(alpha*255).astype(np.uint8)]),'RGBA').transpose(Image.FLIP_LEFT_RIGHT)
img=img.crop(img.getbbox()); print(img.size)
img.save('public/mains/main-photo.png')
