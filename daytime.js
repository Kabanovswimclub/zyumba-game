// The clock and calendar always use Moscow, regardless of the phone's zone.
const moscowClock=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'});
function moscowTime(date=new Date()){
 const parts=Object.fromEntries(moscowClock.formatToParts(date).map(p=>[p.type,p.value]));
 return {year:Number(parts.year),month:Number(parts.month),day:Number(parts.day),hour:Number(parts.hour)};
}
function clockMood(date=new Date()){const {hour}=moscowTime(date);return hour>=6&&hour<18?'morning':'evening'}
function sceneMood(){const choice=document.querySelector('#session-time')?.value;return choice&&choice!=='auto'?choice:clockMood()}
function sceneMonth(date=new Date()){const month=moscowTime(date).month;return month===11?'november':month===12||month<=2?'december':'autumn'}
function calendarSeason(date=new Date()){const t=moscowTime(date),winter=t.month===12||t.month<=2,year=winter&&t.month<=2?t.year-1:t.year;return {year,month:winter?11:8,endMonth:winter?14:11,title:winter?'Зимняя прогулка':'Осенняя прогулка',label:winter?'Дни зимы. Листайте влево и вправо':'Дни осени. Листайте влево и вправо'}}
function applyDaytime(){document.documentElement.dataset.daytime=sceneMood();document.documentElement.dataset.month=sceneMonth()}
applyDaytime();
