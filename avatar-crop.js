function cropPosition(width,height,zoom,x,y,size=320){const scale=Math.max(size/width,size/height)*zoom,limitX=(width*scale-size)/2,limitY=(height*scale-size)/2;return {scale,x:Math.max(-limitX,Math.min(limitX,x)),y:Math.max(-limitY,Math.min(limitY,y))}}
async function chooseAvatarArea(file){
 if(!file)return null;if(file.size>30*1024*1024||!file.type.startsWith('image/'))throw Error('Выбери фотографию размером до 30 МБ.');
 const url=URL.createObjectURL(file),image=new Image();image.src=url;
 try{await image.decode();return await new Promise((resolve,reject)=>{
  const dialog=document.querySelector('#avatar-crop'),canvas=document.querySelector('#crop-canvas'),context=canvas.getContext('2d'),zoom=document.querySelector('#crop-zoom'),save=document.querySelector('#crop-save');let x=0,y=0,pointer=null,finished=false;
  zoom.value='100';save.disabled=false;
  function draw(){const position=cropPosition(image.naturalWidth,image.naturalHeight,Number(zoom.value)/100,x,y);x=position.x;y=position.y;context.fillStyle='#faf0d9';context.fillRect(0,0,320,320);context.drawImage(image,160-image.naturalWidth*position.scale/2+x,160-image.naturalHeight*position.scale/2+y,image.naturalWidth*position.scale,image.naturalHeight*position.scale);document.querySelector('#crop-percent').textContent=zoom.value+'%'}
  function close(blob){if(finished)return;finished=true;canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onkeydown=null;zoom.oninput=null;dialog.oncancel=null;dialog.close();resolve(blob)}
  canvas.onpointerdown=event=>{pointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId)};
  canvas.onpointermove=event=>{if(pointer?.id!==event.pointerId)return;const ratio=320/canvas.getBoundingClientRect().width;x+=(event.clientX-pointer.x)*ratio;y+=(event.clientY-pointer.y)*ratio;pointer.x=event.clientX;pointer.y=event.clientY;draw()};
  canvas.onpointerup=canvas.onpointercancel=()=>{pointer=null};
  canvas.onkeydown=event=>{const moves={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};if(!moves[event.key])return;event.preventDefault();x+=moves[event.key][0];y+=moves[event.key][1];draw()};
  zoom.oninput=draw;document.querySelector('#crop-cancel').onclick=()=>close(null);dialog.oncancel=event=>{event.preventDefault();close(null)};
  save.onclick=()=>{save.disabled=true;canvas.toBlob(blob=>{if(blob)close(blob);else{save.disabled=false;reject(Error('Не удалось подготовить фото.'));close(null)}},'image/jpeg',.9)};
  draw();dialog.showModal();canvas.focus();
 })}finally{URL.revokeObjectURL(url)}
}
