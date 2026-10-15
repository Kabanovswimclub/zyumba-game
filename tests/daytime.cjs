const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const c={Intl,Date,document:{querySelector(){return null},documentElement:{dataset:{}}}};vm.createContext(c);vm.runInContext(fs.readFileSync('daytime.js','utf8'),c);
for(const [utc,wanted] of [['2026-10-15T02:59:00Z','evening'],['2026-10-15T03:00:00Z','morning'],['2026-10-15T14:59:00Z','morning'],['2026-10-15T15:00:00Z','evening']])assert.equal(vm.runInContext(`clockMood(new Date('${utc}'))`,c),wanted);
assert.equal(vm.runInContext("moscowTime(new Date('2026-10-15T21:01:00Z')).day",c),16);
console.log('PASS: Moscow 06:00/18:00 boundaries and midnight date rollover');
