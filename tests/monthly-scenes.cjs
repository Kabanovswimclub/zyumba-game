const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root={dataset:{}},c={Intl,Date,document:{documentElement:root,querySelector:()=>null}};vm.createContext(c);vm.runInContext(fs.readFileSync('daytime.js','utf8'),c);
const run=s=>vm.runInContext(s,c);
assert.equal(run("sceneMonth(new Date('2026-10-31T20:59:00Z'))"),'autumn');
assert.equal(run("sceneMonth(new Date('2026-10-31T21:00:00Z'))"),'november');
assert.equal(run("sceneMonth(new Date('2026-11-30T21:00:00Z'))"),'december');
assert.equal(run("clockMood(new Date('2026-11-10T03:00:00Z'))"),'morning');
assert.equal(run("clockMood(new Date('2026-11-10T15:00:00Z'))"),'evening');
for(const value of ['2026-12-15T12:00:00Z','2027-01-10T12:00:00Z','2027-02-28T12:00:00Z']){const season=run(`calendarSeason(new Date('${value}'))`);assert.equal(season.year,2026);assert.equal(season.month,11);assert.equal(season.endMonth,14);}
for(const month of ['november','december'])for(const mood of ['morning','evening']){assert(fs.existsSync(`assets/${month}-${mood}.webp`));assert(fs.readFileSync('home.css','utf8').includes(`assets/${month}-${mood}.webp`));}
assert.equal(run("calendarSeason(new Date('2026-11-10T12:00:00Z')).month"),8);
console.log('PASS: Moscow month/daytime boundaries, winter year boundary, four scene assets and CSS');
