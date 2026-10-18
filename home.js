const home=document.querySelector('#home'),map=document.querySelector('#day-scroll'),world=document.querySelector('#day-world');
const DAY_WIDTH=145,PANEL_WIDTH=1000;let todayStone;
function buildAutumnMap(){
 const msk=moscowTime(),now=new Date(msk.year,msk.month-1,msk.day),year=msk.year,start=new Date(year,8,1),end=new Date(year,11,1),days=Math.round((end-start)/86400000),width=days*DAY_WIDTH+300;
 world.replaceChildren();todayStone=null;world.style.width=width+'px';
 for(let x=0,i=0;x<width;x+=PANEL_WIDTH,i++){const panel=document.createElement('div');panel.className='land-panel'+(i%2?' mirror':'');panel.style.left=x+'px';world.append(panel)}
 for(let i=0;i<days;i++){
  const date=new Date(year,8,i+1),isToday=date.toDateString()===now.toDateString(),stone=document.createElement('button'),x=150+i*DAY_WIDTH;
  stone.className='day-stone'+(isToday?' today':'');stone.style.left=x+'px';stone.style.setProperty('--day-top',(60+Math.sin(x/PANEL_WIDTH*Math.PI*2)*4)+'%');stone.textContent=date.getDate();
  const label=date.toLocaleDateString('ru-RU',{day:'numeric',month:'long'});stone.dataset.date=dateKey({year,month:date.getMonth()+1,day:date.getDate()});stone.dataset.label=label;stone.setAttribute('aria-label',label+(isToday?', сегодня, чистить зубки':''));stone.setAttribute('aria-pressed',String(isToday));
  if(isToday){todayStone=stone;stone.setAttribute('aria-current','date');const small=document.createElement('small');small.textContent='Сегодня';stone.append(small)}
  stone.addEventListener('click',()=>{if(isToday){openPreparation();return}world.querySelectorAll('.day-stone').forEach(el=>el.setAttribute('aria-pressed',String(el===stone)));document.querySelector('#map-announcement').textContent=label+' — '+stone.dataset.status;stone.scrollIntoView({behavior:mapBehavior(),block:'nearest',inline:'center'})});world.append(stone);
 }
 // Autumn is the approved first landscape; other seasonal artwork comes later.
 if(!todayStone)todayStone=world.querySelector('.day-stone');renderProgress();
}
function mapBehavior(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}
function centerToday(behavior='auto'){if(todayStone)map.scrollTo({left:todayStone.offsetLeft-map.clientWidth/2,behavior})}
function sessionLabel(){return sceneMood()==='morning'?'Утренняя чистка':'Вечерняя чистка'}
function updateSession(){applyDaytime();document.querySelector('#session-label').textContent=sessionLabel()}
function openPreparation(){turnPage();document.body.dataset.view='game';home.hidden=true;reset();sayVoice(0);document.querySelector('#home-return').hidden=false}
function openHome(){turnPage();document.querySelector('#park').hidden=true;reset();document.body.dataset.view='home';home.hidden=false;document.querySelector('#home-return').hidden=true;updateSession();revealProgress();requestAnimationFrame(()=>centerToday())}
document.querySelector('#home-start').addEventListener('click',openPreparation);
document.querySelector('#home-return').addEventListener('click',openHome);
document.querySelector('#map-prev').addEventListener('click',()=>map.scrollBy({left:-DAY_WIDTH*3,behavior:mapBehavior()}));
document.querySelector('#map-next').addEventListener('click',()=>map.scrollBy({left:DAY_WIDTH*3,behavior:mapBehavior()}));
document.querySelector('#map-today').addEventListener('click',()=>{updateSession();centerToday(mapBehavior())});
const homeSettings=document.querySelector('#home-settings'),settingsToggle=document.querySelector('#settings-toggle');
function toggleSettings(){homeSettings.hidden=!homeSettings.hidden;settingsToggle.setAttribute('aria-expanded',String(!homeSettings.hidden))}
settingsToggle.addEventListener('click',toggleSettings);document.querySelector('#settings-close').addEventListener('click',toggleSettings);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!homeSettings.hidden)toggleSettings()});
document.querySelector('#session-time').addEventListener('change',updateSession);
document.querySelector('#home-sound').addEventListener('click',()=>{sound.click();document.querySelector('#home-sound').textContent=song.muted?'♫ Включить звук':'♫ Выключить звук'});
buildAutumnMap();updateSession();requestAnimationFrame(()=>centerToday());window.addEventListener('resize',()=>{if(document.body.dataset.view==='home')centerToday()});

let calendarDate=[moscowTime().year,moscowTime().month,moscowTime().day].join('-');
function refreshClock(){const t=moscowTime(),key=[t.year,t.month,t.day].join('-');if(calendarDate!==key){calendarDate=key;buildAutumnMap();if(document.body.dataset.view==='home')centerToday()}updateSession()}
refreshClock();setInterval(refreshClock,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshClock()});

const durationChoice=document.querySelector('#brushing-duration');durationChoice.value=String(brushingSeconds);durationChoice.addEventListener('change',()=>{saveDuration(durationChoice.value);configureTiming()});
