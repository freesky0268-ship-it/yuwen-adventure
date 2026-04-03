// ==================== 选项随机化 ====================
window.shuffleOptions = function(q){
  const indices=[0,1,2,3];
  // Fisher-Yates
  for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  return{...q,opts:indices.map(i=>q.opts[i]),ans:indices.indexOf(q.ans)};
};

// ==================== Toast ====================
window.showToast = function(msg,success){
  const t=document.getElementById('toast-el');
  t.textContent=msg;t.className='toast'+(success?' toast-success':'');t.style.display='block';
  setTimeout(()=>{t.style.display='none';},2500);
};

// ==================== 界面渲染 ====================
window.showScreen = function(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const map={login:'login-screen',register:'register-screen',welcome:'welcome-screen',grade:'grade-screen',adopt:'adopt-screen',map:'map-screen',quiz:'quiz-screen',result:'result-screen',pet:'pet-screen',shop:'shop-screen',report:'report-screen',upload:'upload-screen',training:'training-screen',textbook:'textbook-screen',readaloud:'readaloud-screen'};
  const el=document.getElementById(map[name]);
  if(el){el.classList.add('active');el.classList.add('fade-in');}
  const fp=document.getElementById('floating-pet');
  const st=document.getElementById('settings-toggle');
  const pm=document.getElementById('pet-menu');
  pm.classList.remove('show');
  // 离开答题页时清除连击显示和鼓励气泡
  if(name!=='quiz'){const cm=document.getElementById('quiz-combo');if(cm)cm.innerHTML='';const eb=document.getElementById('encourage-bubble');if(eb)eb.style.display='none';}
  if(['map','quiz','shop','report','pet','upload','training','textbook','readaloud'].includes(name)&&G.started){
    fp.classList.remove('hidden');
    fp.textContent=PET_CONFIG[G.pet.type]?.emoji||'🐾';
    fp.className='floating-pet '+getPetAnimClass();
    st.style.display=name==='map'?'none':'flex';
  }else{fp.classList.add('hidden');st.style.display='none';}
  if(name==='welcome')renderWelcome();
  if(name==='grade')renderGradeScreen();
  if(name==='map')renderMap();
  if(name==='pet')renderPetHouse();
  if(name==='shop')renderShop('food');
  if(name==='report')renderReport();
  if(name==='upload')renderUpload();
  if(name==='training')renderWeaknessTraining();
  if(name==='textbook')renderTextbookManager();
  if(name==='readaloud')renderReadAloud();
  updateSettingsUI();
};

// ==================== 设置 ====================
window.toggleSound = function(){settings.sound=!settings.sound;saveGame();updateSettingsUI();};
window.toggleTTS = function(){settings.tts=!settings.tts;saveGame();updateSettingsUI();};
window.updateSettingsUI = function(){
  const sb=document.getElementById('sound-toggle');const tb=document.getElementById('tts-toggle');
  if(sb){sb.textContent=settings.sound?'🔊':'🔇';sb.className='toggle-btn'+(settings.sound?'':' off');}
  if(tb){tb.textContent=settings.tts?'🗣️':'🤐';tb.className='toggle-btn'+(settings.tts?'':' off');}
  const msb=document.getElementById('map-sound-toggle');const mtb=document.getElementById('map-tts-toggle');
  if(msb){msb.textContent=settings.sound?'🔊':'🔇';msb.className='toggle-btn map-toggle'+(settings.sound?'':' off');}
  if(mtb){mtb.textContent=settings.tts?'🗣️':'🤐';mtb.className='toggle-btn map-toggle'+(settings.tts?'':' off');}
};
