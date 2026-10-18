// Edge-preserving colour smoothing. No channel posterization, face models or uploads.
function softenPixels(pixels,width,height){
 const out=new Uint8ClampedArray(pixels),range=new Float32Array(766);
 for(let i=0;i<range.length;i++)range[i]=Math.exp(-i*i/(2*55*55));
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;let total=0,r=0,g=0,b=0;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
   const nx=Math.max(0,Math.min(width-1,x+dx)),ny=Math.max(0,Math.min(height-1,y+dy)),j=(ny*width+nx)*4;
   const distance=Math.abs(pixels[i]-pixels[j])+Math.abs(pixels[i+1]-pixels[j+1])+Math.abs(pixels[i+2]-pixels[j+2]);
   const weight=range[distance]/(1+(dx*dx+dy*dy)*.22);total+=weight;r+=pixels[j]*weight;g+=pixels[j+1]*weight;b+=pixels[j+2]*weight;
  }
  out[i]=r/total;out[i+1]=g/total;out[i+2]=b/total;
 }
 return out;
}
function cartoonPixels(pixels,width,height,mode,strength=.65){
 if(mode==='original')return new Uint8ClampedArray(pixels);
 const amount=Math.max(0,Math.min(1,Number.isFinite(strength)?strength:.65));if(!amount)return new Uint8ClampedArray(pixels);
 const smooth=softenPixels(pixels,width,height),out=new Uint8ClampedArray(pixels),lights=new Float32Array(width*height),soft=mode==='soft';
 for(let i=0,j=0;i<smooth.length;i+=4,j++)lights[j]=smooth[i]*.299+smooth[i+1]*.587+smooth[i+2]*.114;
 const lightAt=(x,y)=>lights[y*width+x];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,light=lights[y*width+x];let outline=0;
  if(!soft&&x>0&&y>0&&x<width-1&&y<height-1){
   const gx=-lightAt(x-1,y-1)+lightAt(x+1,y-1)-2*lightAt(x-1,y)+2*lightAt(x+1,y)-lightAt(x-1,y+1)+lightAt(x+1,y+1);
   const gy=-lightAt(x-1,y-1)-2*lightAt(x,y-1)-lightAt(x+1,y-1)+lightAt(x-1,y+1)+2*lightAt(x,y+1)+lightAt(x+1,y+1);
   // Only strong contours get ink; skin gradients and small texture stay smooth.
   outline=Math.min(.2,Math.max(0,(Math.hypot(gx,gy)-160)/850));
  }
  for(let channel=0;channel<3;channel++){
   const color=smooth[i+channel]*.82+pixels[i+channel]*.18;
   const painted=light+(color-light)*(soft?1.015:1.06);
   const result=painted*(1-outline)+(255-painted)*.015;
   out[i+channel]=pixels[i+channel]+(result-pixels[i+channel])*amount;
  }
 }
 return out;
}
