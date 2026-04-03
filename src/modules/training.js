// ==================== 错题本与薄弱环节训练 ====================
window.analyzeWeakness = function(){
  const types=['word','sentence','reading','poetry'];
  const labels={word:'📝 字词类',sentence:'✏️ 句子类',reading:'📖 阅读类',poetry:'🏯 古诗类'};
  const result=[];
  types.forEach(t=>{
    const s=G.stats[t];
    const total=s.total;const correct=s.correct;
    const wrongCount=total-correct;
    const rate=total>0?Math.round(correct/total*100):null;
    const bookCount=(G.wrongBook||[]).filter(w=>w.type===t&&!w.mastered).length;
    result.push({type:t,label:labels[t],total,correct,wrongCount,rate,bookCount});
  });
  result.sort((a,b)=>{
    if(a.rate===null&&b.rate===null)return 0;
    if(a.rate===null)return 1;if(b.rate===null)return -1;
    return a.rate-b.rate;
  });
  return result;
};

window.getWeaknessLevel = function(rate){
  if(rate===null)return {text:'未涉猎',color:'#8892B0',icon:'❓'};
  if(rate<50)return {text:'急需加强',color:'#FF4757',icon:'🔴'};
  if(rate<70)return {text:'有待提高',color:'#FFA502',icon:'🟡'};
  if(rate<85)return {text:'还可以',color:'#00D4FF',icon:'🔵'};
  return {text:'很擅长',color:'#00E676',icon:'🟢'};
};

window.renderWeaknessTraining = function(){
  const analysis=analyzeWeakness();
  const unmasteredWrong=(G.wrongBook||[]).filter(w=>!w.mastered);
  const container=document.getElementById('training-content');

  let analysisHtml='<div style="font-size:16px;font-weight:700;color:#FFD700;margin-bottom:12px;">📊 薄弱环节诊断</div>';
  analysisHtml+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;">';
  analysis.forEach(a=>{
    const wl=getWeaknessLevel(a.rate);
    const rateText=a.rate!==null?a.rate+'%':'--';
    analysisHtml+=`<div style="background:rgba(255,255,255,.04);border:1px solid ${wl.color}33;border-radius:12px;padding:12px;text-align:center;">
      <div style="font-size:14px;color:#E8E8F0;font-weight:600;">${a.label}</div>
      <div style="font-size:24px;font-weight:800;color:${wl.color};margin:4px 0;">${rateText}</div>
      <div style="font-size:12px;color:${wl.color};">${wl.icon} ${wl.text}</div>
      <div style="font-size:11px;color:#8892B0;margin-top:4px;">做过${a.total}题 | 错题本${a.bookCount}题</div>
    </div>`;
  });
  analysisHtml+='</div>';

  const weakTypes=analysis.filter(a=>a.rate!==null&&a.rate<70);
  let suggestHtml='';
  if(unmasteredWrong.length>0){
    suggestHtml+=`<div style="background:rgba(255,71,87,.08);border:1px solid rgba(255,71,87,.2);border-radius:12px;padding:14px;margin-bottom:10px;">
      <div style="font-size:14px;font-weight:700;color:#FF4757;">📕 错题本复习</div>
      <div style="font-size:12px;color:#C8D0E0;margin:6px 0;">你有 <strong style="color:#FF4757;">${unmasteredWrong.length}</strong> 道错题未掌握，优先复习这些题目效果最好</div>
      <button class="btn btn-small" style="background:linear-gradient(135deg,#FF4757,#FF6348);color:#fff;margin-top:4px;" onclick="startWrongBookTraining()">⚔️ 错题本特训（${Math.min(unmasteredWrong.length,10)}题）</button>
    </div>`;
  }
  if(weakTypes.length>0){
    const weakLabels=weakTypes.map(w=>w.label).join('、');
    suggestHtml+=`<div style="background:rgba(255,165,2,.08);border:1px solid rgba(255,165,2,.2);border-radius:12px;padding:14px;margin-bottom:10px;">
      <div style="font-size:14px;font-weight:700;color:#FFA502;">🎯 薄弱专项训练</div>
      <div style="font-size:12px;color:#C8D0E0;margin:6px 0;">你的薄弱环节：${weakLabels}，系统将自动出题强化</div>
      <button class="btn btn-small" style="background:linear-gradient(135deg,#FFA502,#FF6348);color:#fff;margin-top:4px;" onclick="startWeakTypeTraining()">⚔️ 开始专项训练</button>
    </div>`;
  }
  if(weakTypes.length===0&&unmasteredWrong.length===0){
    const totalDone=Object.values(G.stats).reduce((a,s)=>a+s.total,0);
    if(totalDone===0){
      suggestHtml+=`<div style="text-align:center;padding:20px;color:#8892B0;font-size:14px;">⚔️ 还没有战绩数据，先去闯关吧！</div>`;
    }else{
      suggestHtml+=`<div style="text-align:center;padding:20px;"><div style="font-size:36px;margin-bottom:8px;">🏆</div><div style="color:#00E676;font-size:16px;font-weight:700;">全部题型表现优秀！</div><div style="color:#8892B0;font-size:13px;margin-top:4px;">继续保持，挑战更高难度的关卡吧</div></div>`;
      suggestHtml+=`<button class="btn btn-small" style="background:linear-gradient(135deg,#00D4FF,#0099CC);color:#1A1A2E;margin-top:4px;" onclick="startMixedTraining()">⚔️ 综合巩固训练</button>`;
    }
  }else{
    suggestHtml+=`<div style="text-align:center;margin-top:6px;"><button class="btn btn-small btn-secondary" onclick="startMixedTraining()">🔄 综合随机训练</button></div>`;
  }

  let wrongListHtml='';
  if(unmasteredWrong.length>0){
    wrongListHtml=`<div style="font-size:14px;font-weight:700;color:#FF4757;margin:16px 0 8px;">📕 错题本（${unmasteredWrong.length}题未掌握）</div>`;
    wrongListHtml+='<div style="max-height:200px;overflow-y:auto;padding-right:4px;">';
    unmasteredWrong.slice(0,20).forEach((w,i)=>{
      const typeLabels={word:'字词',sentence:'句子',reading:'阅读',poetry:'古诗'};
      wrongListHtml+=`<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#E8E8F0;flex:1;">${w.q.length>30?w.q.substring(0,30)+'...':w.q}</span>
          <span style="color:#8892B0;font-size:11px;white-space:nowrap;margin-left:8px;">${typeLabels[w.type]||''} | 错${w.wrongCount}次</span>
        </div>
      </div>`;
    });
    wrongListHtml+='</div>';
    if(unmasteredWrong.length>0){
      wrongListHtml+=`<div style="text-align:center;margin-top:8px;"><button class="btn btn-small btn-secondary" style="font-size:11px;" onclick="clearMasteredWrong()">✅ 清除已掌握的错题</button></div>`;
    }
  }

  container.innerHTML=analysisHtml+suggestHtml+wrongListHtml;
};

window.startWrongBookTraining = function(){
  playClickSound();
  const unmasteredWrong=(G.wrongBook||[]).filter(w=>!w.mastered);
  if(unmasteredWrong.length===0){showToast('没有未掌握的错题');return;}
  const sorted=[...unmasteredWrong].sort((a,b)=>(b.wrongCount||1)-(a.wrongCount||1));
  let qs=sorted.slice(0,10).map(w=>({q:w.q,opts:[...w.opts],ans:w.ans,explain:w.explain,type:w.type,fromWrongBook:true}));
  qs=qs.map(q=>shuffleOptions(q));
  for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}
  quizState={levelIndex:-1,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:true,isWeakTraining:true,trainingType:'wrongbook'};
  document.getElementById('quiz-level-name').textContent='📕 错题本特训';
  showScreen('quiz');renderQuestion();
};

window.startWeakTypeTraining = function(){
  playClickSound();
  const analysis=analyzeWeakness();
  const weakTypes=analysis.filter(a=>a.rate!==null&&a.rate<70);
  if(weakTypes.length===0){showToast('没有薄弱环节，表现很好！');return;}
  let qs=[];
  weakTypes.forEach(wt=>{
    const poolQs=(PRACTICE_POOL[wt.type]||[]).map(q=>({...q,type:wt.type}));
    const mainQs=(currentQuestions||[]).filter(q=>q.type===wt.type).map(q=>({q:q.q,opts:[...q.opts],ans:q.ans,explain:q.explain,type:q.type}));
    const allQs=[...poolQs,...mainQs];
    for(let i=allQs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allQs[i],allQs[j]]=[allQs[j],allQs[i]];}
    const count=Math.min(Math.ceil(10/weakTypes.length),allQs.length);
    qs.push(...allQs.slice(0,count));
  });
  if(qs.length===0){showToast('题库中暂无对应题目');return;}
  qs=qs.map(q=>shuffleOptions(q));
  for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}
  quizState={levelIndex:-1,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:true,isWeakTraining:true,trainingType:'weak'};
  document.getElementById('quiz-level-name').textContent='🎯 薄弱专项特训';
  showScreen('quiz');renderQuestion();
};

window.startMixedTraining = function(){
  playClickSound();
  let qs=[];
  ['word','sentence','reading','poetry'].forEach(type=>{
    const poolQs=(PRACTICE_POOL[type]||[]).map(q=>({...q,type}));
    const mainQs=(currentQuestions||[]).filter(q=>q.type===type).map(q=>({q:q.q,opts:[...q.opts],ans:q.ans,explain:q.explain,type:q.type}));
    const allQs=[...poolQs,...mainQs];
    for(let i=allQs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allQs[i],allQs[j]]=[allQs[j],allQs[i]];}
    qs.push(...allQs.slice(0,3));
  });
  if(qs.length===0){showToast('题库中暂无题目');return;}
  qs=qs.map(q=>shuffleOptions(q));
  for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}
  quizState={levelIndex:-1,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:true,isWeakTraining:true,trainingType:'mixed'};
  document.getElementById('quiz-level-name').textContent='🔄 综合巩固训练';
  showScreen('quiz');renderQuestion();
};

window.clearMasteredWrong = function(){
  if(!G.wrongBook||G.wrongBook.length===0){showToast('错题本为空');return;}
  const before=G.wrongBook.filter(w=>!w.mastered).length;
  const dayAgo=Date.now()-86400000;
  G.wrongBook.forEach(w=>{
    if(!w.mastered&&w.wrongCount<=1&&w.lastWrong<dayAgo)w.mastered=true;
  });
  const after=G.wrongBook.filter(w=>!w.mastered).length;
  const cleared=before-after;
  if(cleared>0){saveGame();showToast(`已清除${cleared}道已掌握的错题`,true);renderWeaknessTraining();}
  else{showToast('暂无可清除的错题（需错1次且超过1天）');}
};

// ==================== 战绩报告 ====================
window.renderReport = function(){
  const totalMin=Math.floor(G.totalTime/60);
  document.getElementById('report-cards').innerHTML=`
    <div class="report-card"><div class="report-card-icon">⭐</div><div class="report-card-value">${G.stars}</div><div class="report-card-label">总星星数</div></div>
    <div class="report-card"><div class="report-card-icon">🏆</div><div class="report-card-value">${G.completedLevels}/${currentLevels.length||'?'}</div><div class="report-card-label">已攻克关卡</div></div>
    <div class="report-card"><div class="report-card-icon">💰</div><div class="report-card-value">${G.points}</div><div class="report-card-label">总积分</div></div>
    <div class="report-card"><div class="report-card-icon">⏱️</div><div class="report-card-value">${totalMin}分钟</div><div class="report-card-label">累计征战</div></div>
    <div class="report-card"><div class="report-card-icon">🐾</div><div class="report-card-value">Lv.${G.pet.level}</div><div class="report-card-label">${G.pet.name||'伙伴'}等级</div></div>
    <div class="report-card"><div class="report-card-icon">📈</div><div class="report-card-value">${G.pet.growth}</div><div class="report-card-label">总成长值</div></div>`;
  const types=[{key:'word',label:'字词类',emoji:'📝'},{key:'sentence',label:'句子类',emoji:'✏️'},{key:'reading',label:'阅读类',emoji:'📖'},{key:'poetry',label:'古诗类',emoji:'🏯'}];
  let barHtml='<h3>📊 各题型战绩</h3>';
  types.forEach(t=>{const s=G.stats[t.key];const pct=s.total>0?Math.round(s.correct/s.total*100):0;
    barHtml+=`<div class="report-bar-item"><div class="report-bar-label"><span>${t.emoji} ${t.label}</span><span>${s.correct}/${s.total} (${pct}%)</span></div><div class="report-bar"><div class="report-bar-fill" style="width:${pct}%"></div></div></div>`;});
  document.getElementById('report-accuracy').innerHTML=barHtml;
  const tc=Object.values(G.stats).reduce((a,s)=>a+s.correct,0);
  const ta=Object.values(G.stats).reduce((a,s)=>a+s.total,0);
  const op=ta>0?Math.round(tc/ta*100):0;
  let msg='';
  if(ta===0)msg='⚔️ 征途才刚开始，快去闯关吧！';
  else if(op>=80)msg=`🏆 太强了！总命中率${op}%，你是真正的语文勇者！\n${G.pet.name}为你骄傲！`;
  else if(op>=60)msg=`👍 不错！总命中率${op}%，实力稳步提升！\n${G.pet.name}和你并肩作战！`;
  else msg=`💪 加油！总命中率${op}%，每次战斗都在积累经验！\n${G.pet.name}相信你一定行！`;
  document.getElementById('report-encourage').textContent=msg;
  const achEl=document.getElementById('report-ach-section');
  if(achEl)achEl.innerHTML=renderAchievementsSection();
};

// ==================== 试卷上传 ====================
window.renderUpload = function(){
  uploadWrongTypes={word:0,sentence:0,reading:0,poetry:0};
  document.getElementById('upload-preview').style.display='none';
  document.getElementById('upload-zone').style.display='';
  document.getElementById('upload-file').value='';
  const analyzeEl=document.getElementById('upload-analyze');
  if(analyzeEl)analyzeEl.innerHTML='';
  const grid=document.getElementById('wrong-type-grid');
  const types=[{key:'word',emoji:'📝',label:'字词题'},{key:'sentence',emoji:'✏️',label:'句子题'},{key:'reading',emoji:'📖',label:'阅读题'},{key:'poetry',emoji:'🏯',label:'古诗题'}];
  grid.innerHTML=types.map(t=>`
    <div class="wrong-type-card" id="wt-${t.key}" onclick="toggleWrongType('${t.key}')">
      <div class="wt-emoji">${t.emoji}</div><div class="wt-label">${t.label}</div>
      <div class="wrong-type-count">
        <button onclick="event.stopPropagation();adjustWrongCount('${t.key}',-1)">−</button>
        <span id="wt-count-${t.key}">0</span>
        <button onclick="event.stopPropagation();adjustWrongCount('${t.key}',1)">+</button>
      </div>
    </div>`).join('');
};
window.handleUpload = function(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('upload-img').src=e.target.result;
    document.getElementById('upload-preview').style.display='block';
    document.getElementById('upload-zone').style.display='none';
    showToast('图片已上传，正在分析...',true);
    analyzeUploadedImage(file);
  };
  reader.readAsDataURL(file);
};
window.removeUploadImage = function(){
  document.getElementById('upload-preview').style.display='none';
  document.getElementById('upload-zone').style.display='';
  document.getElementById('upload-img').src='';
  document.getElementById('upload-file').value='';
  document.getElementById('upload-analyze').innerHTML='';
  uploadWrongTypes={word:0,sentence:0,reading:0,poetry:0};
  updateWrongTypeUI();
  showToast('图片已删除');
};
window.analyzeUploadedImage = function(file){
  const analyzeEl=document.getElementById('upload-analyze');
  analyzeEl.innerHTML='<div style="text-align:center;color:#8892B0;font-size:13px;padding:8px;">🔍 正在识别试卷内容...</div>';
  const img=new Image();
  img.onload=()=>{
    const fileName=(file.name||'').toLowerCase();
    const detected={word:false,sentence:false,reading:false,poetry:false};
    let reasons=[];
    if(/[字词拼音注音生字词语成语]/.test(fileName)){detected.word=true;reasons.push('文件名含字词关键词');}
    if(/[句造句标点缩句扩句]/.test(fileName)){detected.sentence=true;reasons.push('文件名含句子关键词');}
    if(/[阅读理解短文课文]/.test(fileName)){detected.reading=true;reasons.push('文件名含阅读关键词');}
    if(/[古诗诗词诗句]/.test(fileName)){detected.poetry=true;reasons.push('文件名含古诗关键词');}
    const ratio=img.height/img.width;
    if(ratio>1.3&&!Object.values(detected).some(v=>v)){
      detected.word=true;detected.sentence=true;
      reasons.push('竖版长图，疑似完整试卷');
    }
    const labels={word:'字词',sentence:'句子',reading:'阅读',poetry:'古诗'};
    const weakTypes=[];
    ['word','sentence','reading','poetry'].forEach(t=>{
      const s=G.stats[t];
      if(s.total>=3&&s.correct/s.total<0.7){detected[t]=true;weakTypes.push(t);}
    });
    if(weakTypes.length>0)reasons.push('战绩薄弱：'+weakTypes.map(t=>labels[t]).join('、'));
    if(!Object.values(detected).some(v=>v)){
      detected.word=true;detected.sentence=true;
      reasons.push('未识别到具体类型，按常见分布推荐');
    }
    const typeLabels={word:'📝 字词题',sentence:'✏️ 句子题',reading:'📖 阅读题',poetry:'🏯 古诗题'};
    Object.keys(detected).forEach(k=>{if(detected[k])uploadWrongTypes[k]=3;});
    updateWrongTypeUI();
    const recList=Object.keys(detected).filter(k=>detected[k]).map(k=>typeLabels[k]).join('、');
    analyzeEl.innerHTML=`
      <div style="background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.2);border-radius:10px;padding:10px 12px;">
        <div style="font-size:13px;font-weight:700;color:#00D4FF;margin-bottom:6px;">🔍 智能分析结果</div>
        <div style="font-size:12px;color:#C8D0E0;">推荐练习：<strong style="color:#FFD700;">${recList}</strong></div>
        <div style="font-size:11px;color:#8892B0;margin-top:4px;">${reasons.join('；')}</div>
        <div style="font-size:11px;color:#8892B0;margin-top:6px;font-style:italic;">💡 可手动调整下方的题目类型和数量</div>
      </div>`;
  };
  img.src=URL.createObjectURL(file);
};
window.toggleWrongType = function(key){
  if(uploadWrongTypes[key]===0)uploadWrongTypes[key]=3;
  else uploadWrongTypes[key]=0;
  updateWrongTypeUI();
};
window.adjustWrongCount = function(key,delta){
  uploadWrongTypes[key]=Math.max(0,Math.min(10,uploadWrongTypes[key]+delta));
  updateWrongTypeUI();
};
window.updateWrongTypeUI = function(){
  ['word','sentence','reading','poetry'].forEach(k=>{
    document.getElementById('wt-count-'+k).textContent=uploadWrongTypes[k];
    const card=document.getElementById('wt-'+k);
    if(uploadWrongTypes[k]>0)card.classList.add('selected');else card.classList.remove('selected');
  });
};
window.generatePractice = function(){
  let qs=[];
  ['word','sentence','reading','poetry'].forEach(type=>{
    const count=uploadWrongTypes[type];
    if(count>0&&PRACTICE_POOL[type]){
      const pool=[...PRACTICE_POOL[type]];
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      qs.push(...pool.slice(0,count).map(q=>({...q,type})));
    }
  });
  if(qs.length===0){showToast('请选择至少一种错题类型并设置数量');return;}
  for(let i=qs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]];}
  qs=qs.map(q=>shuffleOptions(q));
  quizState={levelIndex:-1,questions:qs,currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:Date.now(),isCustom:true};
  document.getElementById('quiz-level-name').textContent='📷 错题特训';
  showScreen('quiz');renderQuestion();
};
