// ==================== 存档系统（按账号） ====================
window.TB_STORAGE_KEY = 'ywdmx_tb_';

window.getAccounts = function(){try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'{}');}catch(e){return {};}};
window.saveAccounts = function(a){localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(a));};

window.saveGame = function(){
  if(!currentUser)return;
  try{const accs=getAccounts();if(!accs[currentUser])accs[currentUser]={password:''};accs[currentUser].gameState=JSON.parse(JSON.stringify(G));accs[currentUser].settings=JSON.parse(JSON.stringify(settings));saveAccounts(accs);}catch(e){}
};
window.loadUserGame = function(){
  const accs=getAccounts();
  const ud=accs[currentUser];
  if(ud&&ud.gameState){G=JSON.parse(JSON.stringify(ud.gameState));
    // 兼容旧存档缺少的字段
    if(!G.gradeId)G.gradeId='';if(!G.textbookId)G.textbookId='';
    if(!G.pet.decos)G.pet.decos=[];if(G.pet.intimacy===undefined)G.pet.intimacy=0;
    if(!G.wrongBook)G.wrongBook=[];if(!G.inventory)G.inventory={food:{},toy:{},deco:{}};
    if(!G.achievements)G.achievements=[];if(!G.maxStreak)G.maxStreak=0;if(G.dailyChallengeDone===undefined)G.dailyChallengeDone=null;
  }else{G=defaultG();}
  if(ud&&ud.settings)Object.assign(settings,ud.settings);
  loadGradeData();
};
window.loadGradeData = function(){
  const key=G.gradeId+'_'+G.textbookId;
  // localStorage覆盖版优先（用户手动导入/更新的题库）
  const stored=localStorage.getItem(TB_STORAGE_KEY+key);
  if(stored){
    try{
      const data=JSON.parse(stored);
      if(data.questions&&data.questions.length>0){
        currentQuestions=data.questions;
        currentLevels=data.levels||[];
        if(!G.levelStars||G.levelStars.length!==currentLevels.length){
          G.levelStars=new Array(currentLevels.length).fill(0);
        }
        return;
      }
    }catch(e){}
  }
  // 回退到内置题库
  if(QUESTION_BANKS[key]&&QUESTION_BANKS[key].length>0){
    currentQuestions=QUESTION_BANKS[key];
    currentLevels=LEVEL_BANKS[key]||[];
  }else{
    currentQuestions=[];
    currentLevels=[];
  }
  // 确保levelStars长度匹配
  if(!G.levelStars||G.levelStars.length!==currentLevels.length){
    G.levelStars=new Array(currentLevels.length).fill(0);
  }
};

window.getDownloadedBanks = function(){
  const result={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith(TB_STORAGE_KEY)){
      const bankKey=k.substring(TB_STORAGE_KEY.length);
      try{result[bankKey]=JSON.parse(localStorage.getItem(k));}catch(e){}
    }
  }
  return result;
};

window.getTbStatus = function(gradeId,tbId){
  const key=gradeId+'_'+tbId;
  const stored=localStorage.getItem(TB_STORAGE_KEY+key);
  const hasStored=stored&&(function(){try{const d=JSON.parse(stored);return d.questions&&d.questions.length>0;}catch(e){return false;}})();
  const hasBuiltin=QUESTION_BANKS[key]&&QUESTION_BANKS[key].length>0;
  if(hasStored)return 'downloaded';
  if(hasBuiltin)return 'builtin';
  return 'none';
};

window.getTbInfo = function(gradeId,tbId){
  const key=gradeId+'_'+tbId;
  // localStorage覆盖版优先
  const stored=localStorage.getItem(TB_STORAGE_KEY+key);
  if(stored){try{const d=JSON.parse(stored);if(d.questions&&d.questions.length>0)return {qCount:d.questions.length,lCount:(d.levels||[]).length};}catch(e){}}
  if(QUESTION_BANKS[key])return {qCount:QUESTION_BANKS[key].length,lCount:(LEVEL_BANKS[key]||[]).length};
  return {qCount:0,lCount:0};
};
