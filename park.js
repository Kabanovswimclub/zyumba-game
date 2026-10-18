const PARK_KEY='zyumba-park-v1',residents=[{id:'spark',name:'Искролап'},{id:'ember',name:'Уголёк'},{id:'water',name:'Каплюш'}];
function readPark(){try{const saved=JSON.parse(childStorage.getItem(PARK_KEY));return {version:1,treats:validCount(saved?.treats),fed:Object.fromEntries(residents.map(r=>[r.id,validCount(saved?.fed?.[r.id])])),lastRewardId:typeof saved?.lastRewardId==='string'?saved.lastRewardId:''}}catch{return {version:1,treats:0,fed:{spark:0,ember:0,water:0},lastRewardId:''}}}
function validCount(value){return Number.isSafeInteger(value)&&value>=0?value:0}
let parkState=readPark(),feeding=false,feedingTimer;
function savePark(next){parkState=next;try{childStorage.setItem(PARK_KEY,JSON.stringify(next))}catch{document.querySelector('#park-save-note').hidden=false}renderPark()}
function awardTreat(sessionId){if(!sessionId||parkState.lastRewardId===sessionId)return false;savePark({...parkState,treats:parkState.treats+1,lastRewardId:sessionId});return true}
function treatWord(n){return n%10===1&&n%100!==11?'угощение':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'угощения':'угощений'}
function renderPark(){const count=parkState.treats;document.querySelector('#treat-count').textContent=count+' '+treatWord(count);document.querySelector('#home-park-count').textContent=count?String(count):'';for(const r of residents){
 const button=document.querySelector('[data-resident='+r.id+']'),growth=residentGrowth(parkState.fed[r.id]);
 button.dataset.age=growth.age;for(const key of ['scarf','bag','badge','crown'])button.dataset[key]=String(growth[key]);
 button.setAttribute('aria-label',(count?'Покормить: ':'' )+r.name+', '+growth.label.toLowerCase()+', '+growth.count+' угощений. Следующее: '+growth.next.title+', осталось '+growth.remaining);
 button.disabled=feeding;button.classList.toggle('satisfied',growth.count>0);
 button.querySelector('.growth-label').textContent=growth.label+' · '+growth.count+' угощ.';
 button.querySelector('.growth-next').textContent='Ещё '+growth.remaining+' — '+growth.next.title;
 button.querySelector('.growth-fill').style.width=Math.round(growth.progress*100)+'%';
 button.querySelector('.friend-stars').textContent=growth.stars?'★ '+growth.stars:'';
 }}
function openPark(earned=false){if(typeof turnPage==='function')turnPage();stopVoice();song.pause();running=false;last=0;document.body.dataset.view='park';home.hidden=true;document.querySelector('#park').hidden=false;renderPark();const status=document.querySelector('#park-status');status.textContent=earned?'Зубки чистые! Ты получаешь угощение. Выбери, кого покормить.':parkState.treats?'Кого угостим сегодня? Нажми на зверька.':'Зверята рады тебе! Почистим зубки — принесём угощение.';document.querySelector('#park-back').focus({preventScroll:true})}
function leavePark(){document.querySelector('#park').hidden=true;openHome()}
function feedResident(id){if(feeding)return;const resident=residents.find(r=>r.id===id);if(!resident)return;const status=document.querySelector('#park-status');if(!parkState.treats){status.textContent=resident.name+' машет тебе лапкой! Заходи с угощением после чистки.';const b=document.querySelector('[data-resident='+id+']');b.classList.remove('greeting');void b.offsetWidth;b.classList.add('greeting');return}
 const previousGrowth=residentGrowth(parkState.fed[id]);feeding=true;savePark({...parkState,treats:parkState.treats-1,fed:{...parkState.fed,[id]:parkState.fed[id]+1}});const button=document.querySelector('[data-resident='+id+']');button.classList.remove('fed');void button.offsetWidth;button.classList.add('fed');if(typeof playFeedingJoy==='function')playFeedingJoy(id);const growth=residentGrowth(parkState.fed[id]),milestone=GROWTH_MILESTONES.find(step=>step.at===growth.count);status.textContent=milestone?resident.name+': новое достижение — '+milestone.title+'!':resident.name+': «Ням-ням! Спасибо!» Ещё '+growth.remaining+' — '+growth.next.title;button.classList.toggle('grew',growth.age!==previousGrowth.age||!!milestone);clearTimeout(feedingTimer);feedingTimer=setTimeout(()=>{button.classList.remove('fed','grew');feeding=false;renderPark()},3200)}
document.querySelector('#home-park').addEventListener('click',()=>openPark());document.querySelector('#park-back').addEventListener('click',leavePark);
for(const r of residents)document.querySelector('[data-resident='+r.id+']').addEventListener('click',()=>feedResident(r.id));
window.addEventListener('storage',event=>{if(isChildStorageKey(event,PARK_KEY)){parkState=readPark();renderPark()}});renderPark();
