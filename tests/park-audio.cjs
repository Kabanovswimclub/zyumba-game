const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map();let timer;
function setup(){const elements=new Map();const element=selector=>{if(!elements.has(selector))elements.set(selector,{hidden:true,textContent:'',disabled:false,dataset:{},style:{},querySelector:sub=>element(selector+' '+sub),setAttribute(){},addEventListener(){},classList:{add(){},remove(){},toggle(){}},focus(){}});return elements.get(selector)};const c={joy:[],playFeedingJoy(id){c.joy.push(id)},document:{querySelector:element,body:{dataset:{}}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{addEventListener(){}},setTimeout:fn=>(timer=fn,1),clearTimeout(){},stopVoice(){},song:{pause(){}},home:{},openHome(){}};c.childStorage=c.localStorage;c.isChildStorageKey=(event,key)=>event.key===key;vm.createContext(c);vm.runInContext(fs.readFileSync('growth.js','utf8'),c);vm.runInContext(fs.readFileSync('park.js','utf8'),c);return c}
let c=setup();assert.equal(vm.runInContext('awardTreat("session-1")',c),true);assert.equal(vm.runInContext('awardTreat("session-1")',c),false);assert.equal(vm.runInContext('parkState.treats',c),1);
c=setup();assert.equal(vm.runInContext('parkState.treats',c),1);vm.runInContext('feedResident("spark");feedResident("ember")',c);assert.equal(vm.runInContext('parkState.treats',c),0);assert.equal(vm.runInContext('parkState.fed.spark',c),1);assert.deepEqual(c.joy,['spark']);timer();vm.runInContext('feedResident("water")',c);assert.equal(vm.runInContext('parkState.treats',c),0);c=setup();assert.equal(vm.runInContext('parkState.fed.spark',c),1);
console.log('PASS: exactly one treat per completion, saved balance, no repeat spend during animation, no negative balance, saved feeding');
const cues=[],v={hold:24000,transfer:3000,fetch:()=>Promise.resolve({ok:false}),console,extraVoices:{farTeeth:null},localStorage:{getItem(){return null}}};v.childStorage=v.localStorage;vm.createContext(v);vm.runInContext(fs.readFileSync('timing.js','utf8'),v);vm.runInContext(fs.readFileSync('voice.js','utf8')+';sayVoice=i=>cues.push(i);sayVoiceSequence=items=>items.forEach(i=>cues.push(typeof i==="number"?i:i.index))',Object.assign(v,{cues}));vm.runInContext('[3800,8000,16000,24000,28000,35000,43000,51000,55000,62000,70000,78000,82000,89000,97000,105000,108000].forEach(brushingVoice)',v);assert.deepEqual(cues,[4,3,11,5,2,4,3,6,2,4,3,7,2,4,3,8]);console.log('PASS: top / outside / inside voice order for all four zones, single front cue');


storage.clear();c=setup();c.dayProgress=()=>({morning:true,evening:true});
assert.equal(vm.runInContext('awardTreat("daily-1",{date:"2026-10-18",slot:"evening"})',c),true);
assert.equal(vm.runInContext('parkState.goldenTreats',c),1);
assert.equal(vm.runInContext('totalTreats()',c),2);
vm.runInContext('awardTreat("daily-2",{date:"2026-10-18",slot:"evening"})',c);
assert.equal(vm.runInContext('parkState.goldenTreats',c),1);
assert.equal(vm.runInContext('awardTreat("practice",{date:"2026-10-18",practice:true})',c),false);
c=setup();c.dayProgress=()=>({morning:true,evening:true});
assert.equal(vm.runInContext('goldenEligible({date:"2026-10-18"})',c),false);
vm.runInContext('feedResident("water")',c);assert.equal(vm.runInContext('parkState.goldenTreats',c),0);assert.equal(vm.runInContext('parkState.fed.water',c),1);assert.equal(vm.runInContext('parkState.treats',c),2);timer();
vm.runInContext('awardTreat("next-day",{date:"2026-10-19"})',c);assert.equal(vm.runInContext('parkState.goldenTreats',c),1);
console.log('PASS: one golden bonus per completed date across reloads; practice excluded; golden feeding adds one growth step without spending normal treats');
