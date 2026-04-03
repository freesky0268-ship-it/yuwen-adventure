// ==================== 特效 ====================
window.createStarParticles = function(){
  for(let i=0;i<6;i++){const s=document.createElement('div');s.className='star-particle';s.textContent=['⭐','✨','🌟','💫'][Math.floor(Math.random()*4)];s.style.left=(30+Math.random()*40)+'%';s.style.top=(30+Math.random()*30)+'%';document.body.appendChild(s);setTimeout(()=>s.remove(),1200);}
};
window.showStreakBanner = function(text){const b=document.getElementById('streak-banner');b.textContent=text;b.className='streak-banner show';setTimeout(()=>b.className='streak-banner',1000);};
window.showTreasure = function(){
  const reward=50+Math.floor(Math.random()*51);G.points+=reward;saveGame();
  document.getElementById('treasure-box').innerHTML=`
    <div class="treasure-emoji">🎁</div>
    <h2 style="color:#FFD700;margin:12px 0;">战利品宝箱！</h2>
    <p style="font-size:15px;color:#8892B0;">连续征战${G.consecutiveDays}天的奖励！</p>
    <p style="font-size:20px;font-weight:800;color:#FF6B35;">+${reward} 积分 💰</p>
    <button class="btn btn-primary btn-small" style="margin-top:16px;" onclick="closeTreasure()">收下！</button>`;
  document.getElementById('treasure-overlay').classList.add('show');
};
window.closeTreasure = function(){document.getElementById('treasure-overlay').classList.remove('show');};

// ==================== 游戏流程 ====================
window.startNewGame = function(){playClickSound();showScreen('grade');};
window.continueGame = function(){
  playClickSound();G.started=true;updatePetHunger();loadGradeData();showScreen('map');
  if(G.pet.level>=10&&!G.todayLearned){G.points+=10;showToast('传奇伙伴每日产出+10积分！',true);saveGame();}
  sessionStartTime=Date.now();
  setTimeout(checkAchievements,1000);
};
window.selectPetType = function(type){
  selectedPetType=type;
  document.querySelectorAll('.pet-card').forEach(c=>c.classList.remove('selected'));
  document.querySelector(`.pet-card[data-pet="${type}"]`).classList.add('selected');
  document.getElementById('adopt-confirm-btn').classList.remove('btn-disabled');
  playClickSound();
};
window.setQuickName = function(name){document.getElementById('pet-name-input').value=name;playClickSound();};
window.confirmAdopt = function(){
  if(!selectedPetType)return;
  const name=document.getElementById('pet-name-input').value.trim()||'伙伴';
  playClickSound();
  G.pet={type:selectedPetType,name,hunger:80,mood:80,level:1,growth:0,intimacy:10,decos:[]};
  G.started=true;G.lastLogin=Date.now();G.consecutiveDays=1;G.todayLearned=false;
  saveGame();
  speak(`太好了！${name}成为了你的战斗伙伴！一起开始语文大冒险吧！`);
  showScreen('map');
};

// ==================== 成长型思维反馈 ====================
window.getGrowthMindsetMsg = function(wrongStreak){
  const severe=[
    '深呼吸，你比刚开始已经懂得更多了',
    '暂时卡住不代表学不会，大脑正在建立新连接',
    '每个高手都曾被难题困住过，坚持就是胜利',
    '要不要先去训练营做几道简单的热热身？'
  ];
  const medium=[
    '这类题确实有难度，别着急慢慢来',
    '换个角度想想，你离正确答案越来越近了',
    '错误是学习的阶梯，每错一次记得更牢',
    '分析一下错在哪，下次就会了'
  ];
  const normal=[
    '这道题的关键点记住了，下次一定行',
    '错一次记得更牢，这其实是好事',
    '仔细看看解析，找到知识盲点',
    '调整战术继续前进！'
  ];
  const pool=wrongStreak>=4?severe:(wrongStreak>=3?medium:normal);
  return pool[Math.floor(Math.random()*pool.length)];
};

window.showEncourageBubble = function(wrongStreak){
  if(wrongStreak<3)return;
  const el=document.getElementById('encourage-bubble');
  if(!el)return;
  const cfg=PET_CONFIG[G.pet.type]||{emoji:'🐾'};
  const msgs=wrongStreak>=4?[
    cfg.emoji+' 主人别难过，我们一起加油！',
    cfg.emoji+' 休息一下再来，你一定可以的！',
    cfg.emoji+' 我相信你！先做几道简单的找找感觉？'
  ]:[
    cfg.emoji+' 别灰心，我陪着你呢！',
    cfg.emoji+' 这题确实难，继续冲！',
    cfg.emoji+' 加油加油，你能行的！'
  ];
  const msg=msgs[Math.floor(Math.random()*msgs.length)];
  el.innerHTML=`<div style="font-size:14px;color:#00D4FF;font-weight:600;">${msg}</div>`;
  el.style.display='block';
  speak(msg.replace(cfg.emoji,''));
  setTimeout(()=>{el.style.display='none';},4000);
};

// ==================== 休息提醒 ====================
window.sessionStartTime = Date.now();
window.breakDismissedUntil = 0;
window.checkBreakReminder = function(){
  if(Date.now()<breakDismissedUntil)return;
  const elapsed=(Date.now()-sessionStartTime)/1000/60;
  if(elapsed>=20){
    const msg=document.getElementById('break-msg');
    if(msg)msg.textContent='你已经连续学习'+Math.floor(elapsed)+'分钟了！站起来活动活动，做做眼保健操，回来状态更好哦！';
    document.getElementById('break-overlay').classList.add('show');
  }
};
window.dismissBreak = function(fullReset){
  document.getElementById('break-overlay').classList.remove('show');
  if(fullReset){sessionStartTime=Date.now();}
  else{breakDismissedUntil=Date.now()+5*60*1000;}
};

// ==================== 每日挑战 ====================
window.isDailyChallengeAvailable = function(){
  const today=new Date().toDateString();
  return G.dailyChallengeDone!==today;
};

window.startDailyChallenge = function(){
  if(!isDailyChallengeAvailable()){showToast('今日挑战已完成，明天再来！');return;}
  playClickSound();
  let allQs=[];
  ['word','sentence','reading','poetry'].forEach(type=>{
    const poolQs=(PRACTICE_POOL[type]||[]).map(q=>({...q,type}));
    const mainQs=(currentQuestions||[]).filter(q=>q.type===type).map(q=>({q:q.q,opts:[...q.opts],ans:q.ans,explain:q.explain,type:q.type}));
    allQs.push(...poolQs,...mainQs);
  });
  for(let i=allQs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allQs[i],allQs[j]]=[allQs[j],allQs[i]];}
  let qs=allQs.slice(0,5).map(q=>shuffleOptions(q));
  if(qs.length===0){showToast('暂无题目');return;}
  quizState={levelIndex:-1,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:true,isWeakTraining:false,trainingType:'daily'};
  document.getElementById('quiz-level-name').textContent='📅 每日挑战';
  showScreen('quiz');renderQuestion();
};
