// ==================== 选项分析 ====================
window.generateOptionAnalysis = function(q,chosenIdx){
  const letters=['A','B','C','D'];
  let html='<div style="font-size:12px;color:#FFD700;font-weight:600;margin-bottom:6px;">🔎 逐项分析</div>';
  html+='<div style="display:flex;flex-direction:column;gap:4px;">';
  q.opts.forEach((opt,i)=>{
    const isCorrect=i===q.ans;
    const isChosen=i===chosenIdx;
    let tag='',color='#8892B0',bg='rgba(255,255,255,.02)';
    if(isCorrect){tag='✅ 正确';color='#00E676';bg='rgba(0,230,118,.06)';}
    else if(isChosen){tag='❌ 你选的';color='#FF4757';bg='rgba(255,71,87,.06)';}
    else{tag='';color='#8892B0';}
    const reason=getOptionReason(q,i);
    html+=`<div style="background:${bg};border-radius:8px;padding:6px 10px;display:flex;align-items:baseline;gap:6px;">
      <span style="color:${color};font-weight:700;font-size:12px;min-width:18px;">${letters[i]}</span>
      <span style="color:#C8D0E0;font-size:12px;">${opt}</span>
      ${tag?`<span style="color:${color};font-size:11px;font-weight:600;margin-left:auto;white-space:nowrap;">${tag}</span>`:''}
      ${reason?`<span style="color:#8892B0;font-size:11px;margin-left:${tag?'4px':'auto'};">${reason}</span>`:''}
    </div>`;
  });
  html+='</div>';
  return html;
};
window.getOptionReason = function(q,i){
  if(i===q.ans)return '';
  const type=q.type;
  if(type==='word'){
    if(q.q.includes('读音')||q.q.includes('注音'))return '读音不符';
    if(q.q.includes('部首'))return '部首不同';
    if(q.q.includes('几画'))return '笔画数不对';
    if(q.q.includes('成语')||q.q.includes('道理'))return '理解有误';
    if(q.q.includes('错别字'))return '此项拼写正确';
    if(q.q.includes('搭配'))return '搭配不当';
    return '与题意不符';
  }
  if(type==='sentence'){
    if(q.q.includes('句式')||q.q.includes('什么句'))return '句式判断有误';
    if(q.q.includes('标点'))return '标点用法不当';
    if(q.q.includes('关系'))return '关联关系不对';
    if(q.q.includes('缩句'))return '未保留主干';
    return '语法分析有误';
  }
  if(type==='reading'){
    if(q.q.includes('中心'))return '概念理解有误';
    return '阅读理解偏差';
  }
  if(type==='poetry'){
    if(q.q.includes('出自')||q.q.includes('哪首'))return '出处记忆有误';
    if(q.q.includes('下一句'))return '诗句记忆不准';
    if(q.q.includes('感情'))return '情感理解有误';
    if(q.q.includes('描写'))return '意境分析有误';
    return '诗文理解偏差';
  }
  return '';
};

// ==================== 答题系统 ====================
window.startLevel = function(levelIndex){
  playClickSound();
  const qs=currentQuestions.filter(q=>q.level===levelIndex).map(q=>shuffleOptions(q));
  if(qs.length===0){showToast('该关卡暂无题目');return;}
  quizState={levelIndex,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:false};
  document.getElementById('quiz-level-name').textContent=currentLevels[levelIndex]?.name||'闯关';
  showScreen('quiz');
  renderQuestion();
};

window.renderQuestion = function(){
  const q=quizState.questions[quizState.currentQ];
  if(!q)return;
  quizState.answered=false;
  let dots='';
  for(let i=0;i<quizState.questions.length;i++){
    let cls='quiz-dot';
    if(i<quizState.currentQ)cls+=' done';
    if(i===quizState.currentQ)cls+=' current';
    dots+=`<div class="${cls}"></div>`;
  }
  document.getElementById('quiz-progress').innerHTML=dots;
  document.getElementById('quiz-q-num').textContent=`第 ${quizState.currentQ+1} / ${quizState.questions.length} 题`;
  document.getElementById('quiz-q-text').textContent=q.q;
  const labels=['A','B','C','D'];
  let optsHtml='';
  q.opts.forEach((opt,i)=>{optsHtml+=`<div class="quiz-opt" onclick="selectAnswer(${i})" data-idx="${i}"><span class="opt-label">${labels[i]}</span><span>${opt}</span></div>`;});
  document.getElementById('quiz-options').innerHTML=optsHtml;
  document.getElementById('quiz-feedback').className='quiz-feedback';
  document.getElementById('quiz-feedback').style.display='none';
  document.getElementById('quiz-next-btn').style.display='none';
  document.getElementById('quiz-bonus').textContent='';
  if(settings.tts)setTimeout(()=>speak(q.q),300);
};

window.selectAnswer = function(idx){
  if(quizState.answered)return;
  quizState.answered=true;
  playClickSound();
  const q=quizState.questions[quizState.currentQ];
  const isCorrect=idx===q.ans;
  const opts=document.querySelectorAll('.quiz-opt');
  const fb=document.getElementById('quiz-feedback');
  const bonusEl=document.getElementById('quiz-bonus');
  opts.forEach(o=>o.classList.add('disabled'));
  opts[q.ans].classList.add('correct');

  let bonusTexts=[];
  if(isCorrect){
    quizState.correct++;quizState.streak++;quizState.wrongStreak=0;
    if(quizState.streak>G.maxStreak){G.maxStreak=quizState.streak;}
    q.answeredCorrect=true;
    updateComboDisplay(quizState.streak);
    // 基础心情+5
    let moodGain=5+getDecoPassive('moodBonus');
    if(quizState.streak>=3)moodGain+=10;
    G.pet.mood=Math.min(100,G.pet.mood+moodGain);
    // 成长值
    const growthGain=calcGrowthBonus(true);
    addGrowth(growthGain);
    if(growthGain>1)bonusTexts.push('+'+growthGain+'成长');
    // 统计
    if(G.stats[q.type]){G.stats[q.type].correct++;G.stats[q.type].total++;}
    playCorrectSound();
    fb.className='quiz-feedback correct-fb show';
    fb.style.display='';
    const enc=['命中！🎯','实力超群！⚡','完美一击！💥','势不可挡！🔥','战斗力爆表！💪'];
    fb.innerHTML=`<strong>${enc[Math.floor(Math.random()*enc.length)]}</strong><br>${q.explain}`;
    createStarParticles();
    if(quizState.streak===3){showStreakBanner('🔥 三连击！+5金币');G.points+=5;bonusTexts.push('连击+5💰');}
    if(quizState.streak===5){showStreakBanner('⚡ 五连击！+15金币');G.points+=15;bonusTexts.push('连击+15💰');}
  }else{
    quizState.streak=0;
    quizState.wrongStreak=(quizState.wrongStreak||0)+1;
    updateComboDisplay(0);
    G.pet.mood=Math.max(0,G.pet.mood-5);
    if(G.stats[q.type])G.stats[q.type].total++;
    // 记录错题到错题本
    recordWrongQuestion(q);
    // 侦察镜：答错也获得成长
    const wrongGrowth=getDecoPassive('wrongGrowth');
    if(wrongGrowth>0){addGrowth(wrongGrowth);bonusTexts.push('侦察镜+'+wrongGrowth+'成长');}
    opts[idx].classList.add('wrong-answer');
    playWrongSound();
    fb.className='quiz-feedback wrong-fb show';
    fb.style.display='';
    // 成长型思维反馈
    const growthMsg=getGrowthMindsetMsg(quizState.wrongStreak);
    fb.innerHTML=`<strong>${growthMsg}</strong>`;
    // 挫败感检测
    if(quizState.wrongStreak>=3)setTimeout(()=>showEncourageBubble(quizState.wrongStreak),500);
    // 详细解析面板
    const correctText=q.opts[q.ans];
    const wrongText=q.opts[idx];
    let analysisHtml=`
      <div class="wrong-analysis" style="background:rgba(255,107,53,.06);border:1px solid rgba(255,107,53,.2);border-radius:14px;padding:16px;margin-top:8px;animation:slideUp .4s;">
        <div style="font-size:14px;font-weight:700;color:#FF6B35;margin-bottom:10px;">📖 错题解析</div>
        <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
          <div style="flex:1;min-width:120px;background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.25);border-radius:10px;padding:8px 10px;">
            <div style="font-size:11px;color:#FF4757;font-weight:600;">❌ 你选的</div>
            <div style="font-size:15px;color:#E8E8F0;font-weight:700;margin-top:2px;">${wrongText}</div>
          </div>
          <div style="flex:1;min-width:120px;background:rgba(0,230,118,.1);border:1px solid rgba(0,230,118,.25);border-radius:10px;padding:8px 10px;">
            <div style="font-size:11px;color:#00E676;font-weight:600;">✅ 正确答案</div>
            <div style="font-size:15px;color:#E8E8F0;font-weight:700;margin-top:2px;">${correctText}</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px;margin-bottom:8px;">
          <div style="font-size:12px;color:#FFD700;font-weight:600;margin-bottom:4px;">💡 知识点讲解</div>
          <div style="font-size:13px;color:#C8D0E0;line-height:1.7;">${q.explain}</div>
        </div>
        ${generateOptionAnalysis(q,idx)}
        <div style="margin-top:8px;text-align:center;">
          <button class="btn btn-small btn-secondary" onclick="speakExplain()" style="font-size:12px;">🔊 朗读解析</button>
        </div>
      </div>`;
    fb.innerHTML+=analysisHtml;
    // 自动滚动到解析区域
    setTimeout(()=>{fb.scrollIntoView({behavior:'smooth',block:'nearest'});},100);
  }
  bonusEl.textContent=bonusTexts.length?'📌 '+bonusTexts.join(' | '):'';
  document.getElementById('quiz-next-btn').style.display='inline-flex';
  saveGame();
};

window.nextQuestion = function(){
  playClickSound();
  quizState.currentQ++;
  if(quizState.currentQ>=quizState.questions.length){
    if(quizState.isCustom)finishCustomQuiz();
    else finishLevel();
  }else{renderQuestion();}
};

window.finishLevel = function(){
  const correct=quizState.correct;const total=quizState.questions.length;
  const ratio=total>0?correct/total:0;
  let stars=0;
  if(ratio>=0.8)stars=3;else if(ratio>=0.6)stars=2;else if(ratio>0)stars=1;

  // 金币计算（含加成）
  const basePoints=correct*10;
  const bonusMult=calcCoinBonus();
  const totalReward=Math.round((basePoints+stars*5)*bonusMult);

  if(stars>G.levelStars[quizState.levelIndex])G.levelStars[quizState.levelIndex]=stars;
  if(quizState.levelIndex>=G.completedLevels&&stars>0)G.completedLevels=quizState.levelIndex+1;
  G.stars=G.levelStars.reduce((a,b)=>a+b,0);
  G.points+=totalReward;
  G.todayLearned=true;
  const elapsed=Math.floor((Date.now()-quizState.startTime)/1000);
  G.totalTime+=elapsed;
  // 默契度增长
  const intGain=G.pet.type==='eagle'?5:3;
  G.pet.intimacy=Math.min(100,G.pet.intimacy+intGain);
  saveGame();

  let starsHtml='';for(let i=0;i<3;i++)starsHtml+=i<stars?'⭐':'☆';
  document.getElementById('result-stars').textContent=starsHtml;
  const titles=['再接再厉！','不错哦！','非常棒！','完美通关！'];
  document.getElementById('result-title').textContent=stars===3?titles[3]:(stars===2?titles[2]:(stars===1?titles[1]:titles[0]));
  document.getElementById('result-detail').textContent=`击破 ${correct}/${total} 题`;
  const bonusInfo=bonusMult>1?` (含加成×${bonusMult.toFixed(2)})`:'';
  document.getElementById('result-reward').innerHTML=`🎁 获得 <strong>${totalReward}</strong> 积分${bonusInfo} + <strong>${stars}</strong> 颗星星！`;
  const nextBtn=document.getElementById('result-next-btn');
  if(quizState.levelIndex<currentLevels.length-1&&G.completedLevels>quizState.levelIndex){nextBtn.style.display='inline-flex';}
  else{nextBtn.style.display='none';}
  showScreen('result');playWinSound();
  if(G.treasureReady){setTimeout(showTreasure,1500);G.treasureReady=false;saveGame();}
  setTimeout(checkAchievements,800);
  checkBreakReminder();
};

window.finishCustomQuiz = function(){
  const correct=quizState.correct;const total=quizState.questions.length;
  const bonusMult=calcCoinBonus();
  const reward=Math.round(correct*8*bonusMult);
  G.points+=reward;
  const growthExtra=correct;
  addGrowth(growthExtra);
  G.pet.intimacy=Math.min(100,G.pet.intimacy+2);
  // 错题本特训：答对的题标记为已掌握
  let masteredCount=0;
  if(quizState.trainingType==='wrongbook'&&G.wrongBook){
    quizState.questions.forEach(q=>{
      if(q.fromWrongBook&&q.answeredCorrect){
        const wb=G.wrongBook.find(w=>w.q===q.q);
        if(wb&&!wb.mastered){wb.mastered=true;masteredCount++;}
      }
    });
  }
  saveGame();
  let starsHtml='';const ratio=total>0?correct/total:0;
  let stars=0;if(ratio>=0.8)stars=3;else if(ratio>=0.6)stars=2;else if(ratio>0)stars=1;
  for(let i=0;i<3;i++)starsHtml+=i<stars?'⭐':'☆';
  document.getElementById('result-stars').textContent=starsHtml;
  const titleMap={wrongbook:'📕 错题本特训完成！',weak:'🎯 专项特训完成！',mixed:'🔄 综合训练完成！'};
  document.getElementById('result-title').textContent=titleMap[quizState.trainingType]||'特训完成！';
  document.getElementById('result-detail').textContent=`命中 ${correct}/${total} 题`;
  let rewardHtml=`🎁 获得 <strong>${reward}</strong> 积分 + <strong>${growthExtra}</strong> 成长值！`;
  if(masteredCount>0){
    rewardHtml+=`<br><span style="color:#00E676;font-size:13px;">✅ ${masteredCount}道错题已标记为掌握</span>`;
  }
  document.getElementById('result-reward').innerHTML=rewardHtml;
  document.getElementById('result-next-btn').style.display='none';
  showScreen('result');playWinSound();
};

window.playNextLevel = function(){const next=quizState.levelIndex+1;if(next<currentLevels.length)startLevel(next);};
window.exitQuiz = function(){playClickSound();showScreen('map');};

// ==================== 50/50提示系统 ====================
window.hintUsed = false;
window.useHint = function(){
  if(hintUsed||quizState.answered)return;
  if(G.points<15){showToast('积分不足（需要15积分）');return;}
  G.points-=15;hintUsed=true;saveGame();
  const q=quizState.questions[quizState.currentQ];
  const opts=document.querySelectorAll('.quiz-opt');
  const wrongIndices=[];
  for(let i=0;i<q.opts.length;i++){if(i!==q.ans)wrongIndices.push(i);}
  for(let i=wrongIndices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[wrongIndices[i],wrongIndices[j]]=[wrongIndices[j],wrongIndices[i]];}
  wrongIndices.slice(0,2).forEach(idx=>{
    opts[idx].style.opacity='0.2';opts[idx].style.pointerEvents='none';
    opts[idx].style.textDecoration='line-through';opts[idx].style.filter='grayscale(1)';
  });
  const hintBtn=document.getElementById('hint-btn');
  if(hintBtn)hintBtn.classList.add('used');
  showToast('已消除2个错误选项（-15积分）',true);
  playClickSound();
};

// ==================== 连击计量器 ====================
window.updateComboDisplay = function(streak){
  const el=document.getElementById('quiz-combo');
  if(!el)return;
  if(streak>=2){
    let color='#FFA502',text='',size='13px';
    if(streak>=10){color='#FF4757';text='💥 '+streak+'连杀！';size='16px';}
    else if(streak>=7){color='#FFD700';text='⚡ '+streak+'连击！';size='15px';}
    else if(streak>=5){color='#FF6B35';text='🔥 '+streak+'连击！';size='14px';}
    else if(streak>=3){color='#FFA502';text='✨ '+streak+'连击';size='13px';}
    else{color='#8892B0';text='⚔️ '+streak+'连击';}
    el.innerHTML=`<div class="combo-display" style="border-color:${color}44;color:${color};font-size:${size};">${text}</div>`;
  }else{el.innerHTML='';}
};

// ==================== 错题记录 ====================
window.recordWrongQuestion = function(q){
  if(!G.wrongBook)G.wrongBook=[];
  const exists=G.wrongBook.find(w=>w.q===q.q);
  if(exists){exists.wrongCount=(exists.wrongCount||1)+1;exists.lastWrong=Date.now();return;}
  G.wrongBook.push({q:q.q,opts:q.opts,ans:q.ans,explain:q.explain,type:q.type,wrongCount:1,lastWrong:Date.now(),mastered:false});
  if(G.wrongBook.length>50)G.wrongBook.shift();
};
