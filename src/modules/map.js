// ==================== 地图渲染 ====================
window.renderWelcome = function(){
  document.getElementById('user-name-display').textContent=currentUser?('👤 '+currentUser):'';
  const cont=document.getElementById('continue-btn');
  const chg=document.getElementById('change-grade-btn');
  const info=document.getElementById('welcome-grade-info');
  if(G.started&&G.gradeId){
    cont.style.display='inline-flex';
    chg.style.display='inline-flex';
    info.textContent=getTextbookLabel(G.textbookId)+getGradeLabel(G.gradeId)+' · 勇者征途';
  }else{
    cont.style.display='none';
    chg.style.display='none';
    info.textContent='勇者征途';
  }
};

// ==================== 年级选择 ====================
window.renderGradeScreen = function(){
  const gg=document.getElementById('grade-grid');
  gg.innerHTML=GRADE_OPTIONS.map(g=>{
    const sel=selectedGradeId===g.id?'selected':'';
    return `<div class="grade-card ${sel}" onclick="pickGrade('${g.id}')">${g.label}</div>`;
  }).join('');
  const tg=document.getElementById('textbook-grid');
  tg.innerHTML=TEXTBOOK_OPTIONS.map(t=>{
    const sel=selectedTextbookId===t.id?'selected':'';
    return `<div class="grade-card ${sel}" onclick="pickTextbook('${t.id}')">${t.label}</div>`;
  }).join('');
  const avail=document.getElementById('grade-avail');
  const btn=document.getElementById('grade-confirm-btn');
  if(selectedGradeId&&selectedTextbookId){
    const key=selectedGradeId+'_'+selectedTextbookId;
    if(QUESTION_BANKS[key]){
      avail.innerHTML='<span style="color:#00E676;">✅ 完整题库可用（'+QUESTION_BANKS[key].length+'题）</span>';
    }else{
      avail.innerHTML='<span style="color:#FFD700;">🔨 题库建设中 · 可通过试卷上传进行练习</span>';
    }
    btn.classList.remove('btn-disabled');
  }else{
    avail.textContent='请选择年级和教材版本';
    btn.classList.add('btn-disabled');
  }
};
window.pickGrade = function(id){selectedGradeId=id;playClickSound();renderGradeScreen();};
window.pickTextbook = function(id){selectedTextbookId=id;playClickSound();renderGradeScreen();};

window.confirmGrade = function(){
  if(!selectedGradeId||!selectedTextbookId)return;
  playClickSound();
  G.gradeId=selectedGradeId;
  G.textbookId=selectedTextbookId;
  loadGradeData();
  G.levelStars=new Array(currentLevels.length).fill(0);
  G.completedLevels=0;
  G.stars=0;
  G.stats={word:{correct:0,total:0},sentence:{correct:0,total:0},reading:{correct:0,total:0},poetry:{correct:0,total:0}};
  saveGame();
  if(G.pet.type){
    G.started=true;
    saveGame();
    showScreen('map');
  }else{
    showScreen('adopt');
  }
};

window.renderMap = function(){
  document.getElementById('map-user-name').textContent=currentUser||'';
  document.getElementById('map-stars').textContent=G.stars;
  document.getElementById('map-points').textContent=G.points;
  document.getElementById('map-ach').textContent=(G.achievements||[]).length;
  const body=document.getElementById('map-body');
  if(currentLevels.length===0){
    body.innerHTML='<div style="text-align:center;padding:60px 20px;"><div style="font-size:48px;margin-bottom:16px;">🔨</div><div style="font-size:18px;color:#FFD700;font-weight:700;">题库建设中</div><div style="font-size:14px;color:#8892B0;margin-top:8px;">当前年级题库正在建设，你可以通过<br>"📷 错题"功能上传试卷进行专项训练</div></div>';
    return;
  }
  let html='<div class="map-path">';
  // 每日挑战横幅
  if(isDailyChallengeAvailable()){
    html+=`<div class="daily-banner" onclick="startDailyChallenge()">
      <div style="font-size:32px;">📅</div>
      <div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#FFD700;">每日挑战</div>
      <div style="font-size:12px;color:#8892B0;">今日5题限时挑战，完成额外奖励+20积分</div></div>
      <div style="font-size:12px;color:#FF6B35;font-weight:700;">GO ></div>
    </div>`;
  }else{
    html+=`<div style="width:90%;max-width:380px;padding:10px 20px;border-radius:14px;background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.2);display:flex;align-items:center;gap:10px;margin-bottom:8px;opacity:.7;">
      <div style="font-size:24px;">✅</div><div style="font-size:13px;color:#00E676;">今日挑战已完成，明天再来！</div></div>`;
  }
  for(let i=0;i<currentLevels.length;i++){
    const lv=currentLevels[i];const stars=G.levelStars[i]||0;
    const completed=stars>0;const current=i===G.completedLevels&&i<currentLevels.length;const locked=i>G.completedLevels;
    const cls=completed?'completed':(current?'current':(locked?'locked':''));
    let starHtml='';for(let s=0;s<3;s++)starHtml+=`<span>${s<stars?'⭐':'☆'}</span>`;
    html+=`<div class="map-node ${cls}" onclick="${locked?'':`startLevel(${i})`}" style="border-left:4px solid ${completed||current?lv.theme:'rgba(255,255,255,.15)'}">
      <div class="node-icon">${lv.icon}</div><div class="node-info"><div class="node-name">${lv.name}</div><div class="node-desc">${lv.desc}</div><div class="node-stars">${starHtml}</div></div>${locked?'<div class="node-lock">🔒</div>':''}</div>`;
    if(i<currentLevels.length-1)html+=`<div class="map-connector ${completed?'done':''}"></div>`;
  }
  html+='</div>';body.innerHTML=html;
};
