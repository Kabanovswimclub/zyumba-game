// The clock and calendar always use Moscow, regardless of the phone's zone.
const moscowClock=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
function moscowTime(date=new Date()){
 const parts=Object.fromEntries(moscowClock.formatToParts(date).map(p=>[p.type,p.value]));
 return {year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour)};
}
function clockMood(date=new Date()){const {hour}=moscowTime(date);return hour>=6&&hour<18?'morning':'evening'}
function sceneMood(){const choice=document.querySelector('#session-time')?.value;return choice&&choice!=='auto'?choice:clockMood()}
function applyDaytime(){document.documentElement.dataset.daytime=sceneMood()}
applyDaytime();
