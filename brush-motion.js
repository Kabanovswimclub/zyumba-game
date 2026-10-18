// Active brushing time excludes both zone transfers and the two axial turns per side.
const SURFACE_TURN=650;
function brushingDuration(hold,transfer){return hold*5+transfer*4+SURFACE_TURN*8}
function brushTimeline(ms,hold,transfer){
 let remaining=Math.max(0,ms);
 for(let zone=0;zone<4;zone++){
  let active=0;
  for(let surface=0;surface<3;surface++){
   const step=surfaceStep(zone,active+.001,hold),length=step.length;
   if(remaining<length)return {zone,local:active+remaining,surface,progress:remaining/length,turning:false,transfer:false,logicalMs:zone*(hold+transfer)+active+remaining};
   remaining-=length;active+=length;
   if(surface<2){if(remaining<SURFACE_TURN)return {zone,local:active,surface:surface+1,previousSurface:surface,progress:remaining/SURFACE_TURN,turning:true,transfer:false,logicalMs:zone*(hold+transfer)+active};remaining-=SURFACE_TURN}
  }
  if(remaining<transfer)return {zone,local:hold,surface:2,progress:remaining/transfer,turning:false,transfer:true,logicalMs:zone*(hold+transfer)+hold+remaining};
  remaining-=transfer;
 }
 return {zone:4,local:Math.min(hold,remaining),surface:1,progress:Math.min(1,remaining/hold),turning:false,transfer:false,logicalMs:4*(hold+transfer)+Math.min(hold,remaining)};
}
function sideBrushPose(zone,surface,p){
 const right=zone===0||zone===2,upper=zone===2||zone===3;
 const far=[.875,.91,.825][surface],near=[.65,.69,.625][surface];
 const x=far+(near-far)*p,baseY=.715-.045*p+(surface===0?0:surface===1?.055:.075);
 return {x:right?x:1-x,y:upper?1-baseY-.045:baseY,width:(surface===0?.67:.63)*(1-.29*p),angle:(upper?-1:1)*(right?1:-1)*12,side:right?1:-1,vertical:upper?-1:1,view:['top','outer','inner'][surface],depth:surface===1?2:5};
}
function brushPlacement(state){
 if(state.zone===4)return {x:.5+Math.sin(state.local/150)*.04,y:.48,width:.43,angle:0,side:1,vertical:1,view:'top',depth:5,lift:0};
 if(state.transfer){const a=sideBrushPose(state.zone,2,1),b=state.zone===3?{x:.5,y:.48,width:.43,angle:0,side:1,vertical:1,view:'top',depth:5}:sideBrushPose(state.zone+1,0,0),t=state.progress*state.progress*(3-2*state.progress);return {...(t<.5?a:b),x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t+Math.sin(Math.PI*t)*(state.zone<2?-.13:.13),width:a.width+(b.width-a.width)*t,lift:Math.sin(Math.PI*t),turnProgress:t}}
 if(state.turning){const a=sideBrushPose(state.zone,state.previousSurface,1),b=sideBrushPose(state.zone,state.surface,0),t=state.progress*state.progress*(3-2*state.progress);return {...(t<.5?a:b),x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t+Math.sin(Math.PI*t)*(state.zone<2?-.13:.13),width:a.width+(b.width-a.width)*t,lift:Math.sin(Math.PI*t),turnProgress:t}}
 const pose=sideBrushPose(state.zone,state.surface,state.progress);pose.x+=Math.sin(state.local/145)*.008;pose.y+=Math.cos(state.local/180)*.002;pose.lift=0;return pose;
}
