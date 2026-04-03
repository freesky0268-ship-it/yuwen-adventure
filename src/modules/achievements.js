// ==================== 成就检查与展示 ====================
window.checkAchievements = function(){
  if(!G.achievements)G.achievements=[];
  const newlyUnlocked=[];
  ACHIEVEMENTS.forEach(ach=>{
    if(G.achievements.includes(ach.id))return;
    let unlocked=false;
    switch(ach.id){
      case 'first_blood':unlocked=G.completedLevels>=1;break;
      case 'three_star':unlocked=(G.levelStars||[]).some(s=>s===3);break;
      case 'five_clear':unlocked=G.completedLevels>=5;break;
      case 'all_clear':unlocked=G.completedLevels>=12;break;
      case 'coin_100':unlocked=G.points>=100;break;
      case 'coin_500':unlocked=G.points>=500;break;
      case 'streak_5':unlocked=(G.maxStreak||0)>=5;break;
      case 'streak_10':unlocked=(G.maxStreak||0)>=10;break;
      case 'pet_lv5':unlocked=G.pet.level>=5;break;
      case 'pet_lv10':unlocked=G.pet.level>=10;break;
      case 'wrong_master':unlocked=(G.wrongBook||[]).filter(w=>w.mastered).length>=10;break;
      case 'days_7':unlocked=G.consecutiveDays>=7;break;
      case 'accuracy_90':{const tc=Object.values(G.stats).reduce((a,s)=>a+s.correct,0);const ta=Object.values(G.stats).reduce((a,s)=>a+s.total,0);unlocked=ta>=20&&tc/ta>=0.9;}break;
      case 'total_100':unlocked=Object.values(G.stats).reduce((a,s)=>a+s.total,0)>=100;break;
      case 'equip_3':unlocked=(G.pet.decos||[]).length>=3;break;
    }
    if(unlocked){G.achievements.push(ach.id);newlyUnlocked.push(ach);}
  });
  if(newlyUnlocked.length>0){saveGame();newlyUnlocked.forEach((ach,i)=>setTimeout(()=>showAchievementPopup(ach),i*2500));}
};

window.showAchievementPopup = function(ach){
  const el=document.getElementById('ach-popup');
  el.innerHTML=`<div class="ach-popup"><div class="ach-popup-icon">${ach.icon}</div><div class="ach-popup-info"><div class="ach-popup-title">ACHIEVEMENT UNLOCKED</div><div class="ach-popup-name">${ach.name}</div><div class="ach-popup-desc">${ach.desc}</div></div></div>`;
  el.style.display='block';
  playLevelUpSound();
  speak('解锁成就：'+ach.name);
  setTimeout(()=>{el.style.display='none';},3500);
};

window.renderAchievementsSection = function(){
  if(!G.achievements)G.achievements=[];
  let html='<h3>🏆 成就徽章 ('+G.achievements.length+'/'+ACHIEVEMENTS.length+')</h3>';
  html+='<div class="ach-grid">';
  ACHIEVEMENTS.forEach(ach=>{
    const unlocked=G.achievements.includes(ach.id);
    html+=`<div class="ach-card ${unlocked?'unlocked':'locked'}"><div class="ach-card-icon">${unlocked?ach.icon:'🔒'}</div><div class="ach-card-name">${ach.name}</div><div class="ach-card-desc">${ach.desc}</div></div>`;
  });
  html+='</div>';
  return html;
};
