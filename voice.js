// Web Audio gain also works on iPhone, where media element volume is fixed.
const voiceFiles=['01-preparation','02-start','03-top','04-inside','05-outside','06-lower-left','07-upper-right','08-upper-left','09-front-teeth','10-finish','11-reward'];
const voiceLoads=voiceFiles.map(name=>fetch('assets/voice/'+name+'.mp3').then(r=>{if(!r.ok)throw Error(name);return r.arrayBuffer()}).catch(()=>null));
let audioContext,musicGain,voiceGain,voiceSource,voiceBuffer,voiceOffset=0,voiceStarted=0,voicePaused=false,voiceSerial=0;
const decodedVoices=[];
function audioUnlock(){
 if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();musicGain=audioContext.createGain();voiceGain=audioContext.createGain();audioContext.createMediaElementSource(song).connect(musicGain);musicGain.connect(audioContext.destination);voiceGain.connect(audioContext.destination);song.volume=1;musicGain.gain.value=.7;voiceGain.gain.value=song.muted?0:1}
 audioContext.resume().catch(()=>{});
}
function duckMusic(active){if(!audioContext)return;const gain=musicGain.gain;gain.cancelScheduledValues(audioContext.currentTime);gain.setValueAtTime(gain.value,audioContext.currentTime);gain.linearRampToValueAtTime(song.muted?0:active?.16:.7,audioContext.currentTime+(active?.2:.55))}
function stopVoice(){voiceSerial++;if(voiceSource){voiceSource.onended=null;voiceSource.stop();voiceSource=null}voiceBuffer=null;voiceOffset=0;voicePaused=false;duckMusic(false)}
function startVoiceBuffer(){if(!voiceBuffer||voiceOffset>=voiceBuffer.duration)return;voiceSource=audioContext.createBufferSource();voiceSource.buffer=voiceBuffer;voiceSource.connect(voiceGain);voiceStarted=audioContext.currentTime;voicePaused=false;duckMusic(true);voiceSource.onended=()=>{voiceSource=null;voiceBuffer=null;voiceOffset=0;duckMusic(false)};voiceSource.start(0,voiceOffset)}
async function sayVoice(index){
 stopVoice();if(song.muted)return;audioUnlock();const serial=voiceSerial;
 try{if(!decodedVoices[index]){const bytes=await voiceLoads[index];if(!bytes)return;decodedVoices[index]=await audioContext.decodeAudioData(bytes.slice(0))}if(serial!==voiceSerial)return;voiceBuffer=decodedVoices[index];startVoiceBuffer()}catch(error){console.warn('Voice unavailable',error)}
}
function pauseVoice(){if(voiceSource){voiceOffset+=audioContext.currentTime-voiceStarted;voiceSource.onended=null;voiceSource.stop();voiceSource=null;voicePaused=true}voiceSerial++;duckMusic(false)}
function resumeVoice(){if(voicePaused&&!song.muted){audioUnlock();startVoiceBuffer()}}
function muteVoice(){if(voiceGain)voiceGain.gain.value=song.muted?0:1;if(song.muted)stopVoice();else audioUnlock();duckMusic(!!voiceSource)}
let voiceCue='';
function brushingVoice(ms){const zone=Math.min(4,Math.floor(ms/(hold+transfer))),local=ms-zone*(hold+transfer);if(hold<12000&&zone<4&&local<hold)return;let cue,index;
 if(local>=hold&&zone<4){cue='transfer-'+zone;index=[5,6,7,8][zone]}
 else if(zone===4){cue='front';index=8}
 else {const surface=Math.min(2,Math.floor(local/(hold/3)));cue=zone+'-'+surface;index=[4,3,2][surface];if(zone===0&&surface===0&&local<3800)return;if(zone>0&&surface===0&&local<1000)return}
 if(cue!==voiceCue){const previous=voiceCue;voiceCue=cue;if(cue==='front'&&previous==='transfer-3')return;sayVoice(index)}
}
