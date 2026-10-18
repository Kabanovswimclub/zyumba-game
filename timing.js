const DURATION_KEY='zyumba-brushing-seconds-v1',DURATION_CHOICES=[60,90,120];
function readDuration(){try{const value=Number(childStorage.getItem(DURATION_KEY));return DURATION_CHOICES.includes(value)?value:120}catch{return 120}}
let brushingSeconds=readDuration();
function saveDuration(value){if(!DURATION_CHOICES.includes(Number(value)))return; brushingSeconds=Number(value);try{childStorage.setItem(DURATION_KEY,String(brushingSeconds))}catch{}}
function surfaceStep(zone,local,zoneDuration){
 const cuts=zone===0&&zoneDuration>=12000&&zoneDuration<24000?[0,.5,.75,1]:[0,1/3,2/3,1];
 const index=zone===4?0:local<zoneDuration*cuts[1]?0:local<zoneDuration*cuts[2]?1:2;
 const start=zone===4?0:zoneDuration*cuts[index],end=zone===4?zoneDuration:zoneDuration*cuts[index+1];
 return {index,remaining:Math.max(0,end-local),length:end-start};
}
