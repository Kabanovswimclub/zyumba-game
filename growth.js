// Milestones count all saved feedings, including those earned before this update.
const GROWTH_MILESTONES=[{at:4,title:'подрастание'},{at:6,title:'сумочка'},{at:12,title:'взрослая форма'},{at:16,title:'значок дружбы'},{at:24,title:'венок'}];
function residentGrowth(count){
 const n=Number.isSafeInteger(count)&&count>=0?count:0,age=n<4?'baby':n<12?'young':'adult';
 const next=GROWTH_MILESTONES.find(step=>step.at>n)||{at:24+(Math.floor((n-24)/12)+1)*12,title:'звезда дружбы'};
 const previous=[0,...GROWTH_MILESTONES.map(step=>step.at)].filter(at=>at<=n).pop();
 const from=n>=24?24+Math.floor((n-24)/12)*12:previous;
 return {age,label:age==='baby'?'Малыш':age==='young'?'Подрастает':'Взрослый',count:n,next,remaining:next.at-n,progress:(n-from)/(next.at-from),scarf:false,bag:n>=6,badge:n>=16,crown:n>=24,stars:n<24?0:Math.floor((n-24)/12)+1};
}

// A separate counter starts at zero: historical feedings never unlock winter clothes.
const WINTER_MILESTONES=[{at:2,title:'шапочка'},{at:5,title:'шарфик'},{at:8,title:'жилетка'}];
function winterGrowth(count){
 const n=Number.isSafeInteger(count)&&count>=0?count:0,stage=n>=8?3:n>=5?2:n>=2?1:0;
 const next=WINTER_MILESTONES.find(step=>step.at>n)||{at:8+(Math.floor((n-8)/4)+1)*4,title:'сердечко дружбы'};
 const from=n>=8?8+Math.floor((n-8)/4)*4:[0,2,5][stage];
 return {count:n,stage,label:['Ждём шапочку','В шапочке','С тёплым шарфиком','Зимний комплект'][stage],next,remaining:next.at-n,progress:(n-from)/(next.at-from),hearts:Math.max(0,Math.floor((n-8)/4))};
}
