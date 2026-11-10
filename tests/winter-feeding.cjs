const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map([['zyumba-progress-v1','unchanged-cleanings'],['zyumba-park-v1',JSON.stringify({treats:30,goldenTreats:1,fed:{spark:100,ember:50,water:24},bonusDays:{'2026-11-10':true},lastRewardId:'old-reward'})]]);let timer;
function setup(){const els=new Map(),get=key=>{if(!els.has(key))els.set(key,{dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},querySelector:s=>get(key+' '+s),setAttribute(){},addEventListener(){}});return els.get(key)};const c={document:{querySelector:get},childStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{addEventListener(){}},setTimeout:fn=>(timer=fn,1),clearTimeout(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('growth.js','utf8')+'\n'+fs.readFileSync('park.js','utf8'),c);return {run:s=>vm.runInContext(s,c),get};}
let {run,get}=setup();
assert.equal(run('parkState.winterFed.spark'),0);assert.equal(run('parkState.fed.spark'),100);assert.equal(run('totalTreats()'),31);assert.equal(run('parkState.bonusDays["2026-11-10"]'),true);
assert.equal(get('[data-resident=spark]').dataset.winterStage,'0');
run('feedResident("spark");feedResident("ember")');assert.equal(run('parkState.winterFed.spark'),1);assert.equal(run('parkState.winterFed.ember'),0);assert.equal(run('parkState.goldenTreats'),0);assert.equal(run('parkState.treats'),30);timer();
for(let n=2;n<=12;n++){run('feedResident("spark")');timer();assert.equal(run('parkState.winterFed.spark'),n);const stage=n>=8?3:n>=5?2:1;assert.equal(get('[data-resident=spark]').dataset.winterStage,String(stage));}
assert.equal(run('winterGrowth(12).hearts'),1);assert.equal(run('parkState.fed.spark'),112);assert.equal(storage.get('zyumba-progress-v1'),'unchanged-cleanings');
({run,get}=setup());assert.equal(run('parkState.winterFed.spark'),12);assert.equal(run('parkState.winterFed.water'),0);assert.equal(run('awardTreat("practice",{practice:true})'),false);
for(const n of [0,1,2,4,5,7,8,9,12,100]){const g=run(`winterGrowth(${n})`);assert(g.remaining>0);assert(g.progress>=0&&g.progress<1);}
for(const id of ['spark','ember','water'])for(let s=0;s<4;s++)assert(fs.existsSync(`assets/winter-outfits/${id}-${s}.webp`));
storage.set('zyumba-park-v1',JSON.stringify({fed:{spark:100},winterFed:{spark:-5,ember:'99',water:null}}));({run}=setup());assert.equal(run('parkState.winterFed.spark'),0);assert.equal(run('parkState.winterFed.ember'),0);
storage.delete('zyumba-park-v1');({run}=setup());assert.equal(run('parkState.winterFed.spark'),0);
console.log('PASS: old feeding history does not unlock clothes; new feedings unlock 2/5/8; golden treats, repeated taps, reload, malformed saves, separate animals, ongoing friendship and cleaning history preserved');
