// Shared Web Audio context: quiet menu music, tactile taps and paper turns.
const ambienceBytes=fetch('assets/menu-music-light.mp3').then(r=>{if(!r.ok)throw Error('Menu music');return r.arrayBuffer()}).catch(()=>null);
let ambienceBuffer,ambienceLoading=false,ambienceSource,ambienceGain,atmosphereUnlocked=false,turnAnimation,lastTapAt=-1,lastWhooshAt=-1;
function ambienceWanted(){return atmosphereUnlocked&&!document.hidden&&!song.muted&&['home','park'].includes(document.body.dataset.view)}
function syncAtmosphere(){
 if(!audioContext)return;
 if(!ambienceGain){ambienceGain=audioContext.createGain();ambienceGain.gain.value=0;ambienceGain.connect(audioContext.destination)}
 if(ambienceWanted()&&ambienceBuffer&&!ambienceSource){ambienceSource=audioContext.createBufferSource();ambienceSource.buffer=ambienceBuffer;ambienceSource.loop=true;ambienceSource.connect(ambienceGain);ambienceSource.start()}
 const now=audioContext.currentTime,gain=ambienceGain.gain;gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.linearRampToValueAtTime(ambienceWanted()?(voiceSource?.035:.085):0,now+.35);
 if(!ambienceWanted()&&ambienceSource){const old=ambienceSource;ambienceSource=null;old.stop(now+.36);old.onended=()=>old.disconnect()}
}
function unlockAtmosphere(){atmosphereUnlocked=true;audioUnlock();if(!ambienceBuffer&&!ambienceLoading){ambienceLoading=true;ambienceBytes.then(bytes=>bytes?audioContext.decodeAudioData(bytes.slice(0)):null).then(buffer=>{ambienceBuffer=buffer;syncAtmosphere()}).catch(()=>{}).finally(()=>{ambienceLoading=false})}syncAtmosphere()}
function playTap(){if(song.muted||!audioContext)return;const now=audioContext.currentTime;if(now-lastTapAt<.07)return;lastTapAt=now;const tone=audioContext.createOscillator(),gain=audioContext.createGain();tone.type='sine';tone.frequency.setValueAtTime(690,now);tone.frequency.exponentialRampToValueAtTime(430,now+.075);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.009);gain.gain.exponentialRampToValueAtTime(.0001,now+.1);tone.connect(gain);gain.connect(audioContext.destination);tone.start(now);tone.stop(now+.11);tone.onended=()=>{tone.disconnect();gain.disconnect()}}
function playWhoosh(){if(song.muted||!audioContext||!atmosphereUnlocked)return;const now=audioContext.currentTime;if(now-lastWhooshAt<.2)return;lastWhooshAt=now;const buffer=audioContext.createBuffer(1,Math.ceil(audioContext.sampleRate*.27),audioContext.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);const noise=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();noise.buffer=buffer;filter.type='bandpass';filter.Q.value=.6;filter.frequency.setValueAtTime(1400,now);filter.frequency.exponentialRampToValueAtTime(380,now+.27);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.065,now+.075);gain.gain.exponentialRampToValueAtTime(.0001,now+.27);noise.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);noise.start(now);noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect()}}
function turnPage(){if(turnAnimation)return;playWhoosh();const curtain=document.querySelector('#page-curtain');curtain.hidden=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{turnAnimation=curtain.animate(reduced?[{opacity:.6},{opacity:0}]:[{transform:'translateX(0) rotate(0deg)',opacity:1},{transform:'translateX(108%) rotate(3deg)',opacity:1}],{duration:reduced?120:430,easing:'cubic-bezier(.35,.05,.3,1)',fill:'forwards'});turnAnimation.finished.catch(()=>{}).finally(()=>{curtain.hidden=true;turnAnimation?.cancel();turnAnimation=null})}catch{curtain.hidden=true;turnAnimation=null}}
document.addEventListener('pointerdown',()=>unlockAtmosphere(),{once:true,capture:true});
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||button.disabled||!event.isTrusted)return;unlockAtmosphere();playTap()},{capture:true});
document.addEventListener('change',event=>{if(event.isTrusted&&event.target.matches('input,select')){unlockAtmosphere();playTap()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!running)pauseVoice();syncAtmosphere()});
new MutationObserver(()=>syncAtmosphere()).observe(document.body,{attributes:true,attributeFilter:['data-view']});

// A tiny satisfied warble followed by a happy rising chime, without downloads.
function playFeedingJoy(id){
 if(song.muted||!audioContext||document.hidden)return;
 const now=audioContext.currentTime,base={spark:440,ember:330,water:520}[id]||440;
 const note=(offset,frequency,length,volume,warble=false)=>{const tone=audioContext.createOscillator(),gain=audioContext.createGain();tone.type='sine';tone.frequency.setValueAtTime(frequency,now+offset);tone.frequency.exponentialRampToValueAtTime(frequency*(warble?1.35:1.08),now+offset+length*.45);tone.frequency.exponentialRampToValueAtTime(frequency*(warble?.85:1),now+offset+length);gain.gain.setValueAtTime(.0001,now+offset);gain.gain.exponentialRampToValueAtTime(volume,now+offset+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+offset+length);tone.connect(gain);gain.connect(audioContext.destination);tone.start(now+offset);tone.stop(now+offset+length+.02);tone.onended=()=>{tone.disconnect();gain.disconnect()}};
 note(.55,base,.19,.11,true);note(.82,base*1.12,.23,.1,true);
 [1,1.25,1.5].forEach((ratio,i)=>note(1.42+i*.15,base*ratio,.25,.075));
}
