// Fixed image operations only: blur, color bands, edge lines, paper grain.
// No face detection, model files, services or image uploads.
function softenPixels(pixels,width,height){
 const horizontal=new Uint8ClampedArray(pixels),out=new Uint8ClampedArray(pixels);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<3;c++){const left=(y*width+Math.max(0,x-1))*4+c,middle=(y*width+x)*4+c,right=(y*width+Math.min(width-1,x+1))*4+c;horizontal[middle]=(pixels[left]+pixels[middle]+pixels[right])/3}
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<3;c++){const top=(Math.max(0,y-1)*width+x)*4+c,middle=(y*width+x)*4+c,bottom=(Math.min(height-1,y+1)*width+x)*4+c;out[middle]=(horizontal[top]+horizontal[middle]+horizontal[bottom])/3}
 return out;
}
function cartoonPixels(pixels,width,height,mode){
 if(mode==='original')return new Uint8ClampedArray(pixels);
 const original=softenPixels(pixels,width,height),out=new Uint8ClampedArray(original),soft=mode==='soft',step=soft?22:32;
 const luminance=(x,y)=>{const i=(y*width+x)*4;return original[i]*.299+original[i+1]*.587+original[i+2]*.114};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,light=luminance(x,y),grain=(((x*13+y*17)%19)/18-.5)*(soft?2:4);
  let edge=0;if(!soft&&x>0&&y>0&&x<width-1&&y<height-1){const gx=-luminance(x-1,y-1)+luminance(x+1,y-1)-2*luminance(x-1,y)+2*luminance(x+1,y)-luminance(x-1,y+1)+luminance(x+1,y+1),gy=-luminance(x-1,y-1)-2*luminance(x,y-1)-luminance(x+1,y-1)+luminance(x-1,y+1)+2*luminance(x,y+1)+luminance(x+1,y+1);edge=Math.min(.45,Math.max(0,(Math.hypot(gx,gy)-85)/370))}
  for(let channel=0;channel<3;channel++){const value=original[i+channel],band=Math.round(value/step)*step,saturated=light+(band-light)*(soft?1.04:1.1),warm=channel===0?3:channel===2?-3:1;out[i+channel]=Math.max(0,Math.min(255,(saturated*.96+7+warm+grain)*(1-edge)))}
 }
 return out;
}
