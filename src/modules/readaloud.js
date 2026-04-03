// ==================== 朗读训练模块 ====================
window.RA_STORAGE_KEY = 'ywdmx_ra_texts';
window.RA_RECORDS_KEY = 'ywdmx_ra_records';
window.RA_TB_KEY = 'ywdmx_ra_tb_';
window.RA_BUILTIN_TEXTS = [
  {id:'builtin_1',title:'《大青树下的小学》节选',author:'人教版三年级上册',text:'早晨，从山坡上，从坪坝里，从一条条开着绒球花和太阳花的小路上，走来了许多小学生，有傣族的，有景颇族的，有阿昌族和德昂族的，还有汉族的。大家穿戴不同，来到学校，都成了好朋友。那鲜艳的服装，把学校打扮得绚丽多彩。'},
  {id:'builtin_2',title:'《花的学校》节选',author:'[印度]泰戈尔',text:'当雷云在天上轰响，六月的阵雨落下的时候，湿润的东风走过荒野，在竹林中吹着口笛。于是，一群一群的花从无人知道的地方突然跑出来，在绿草上跳舞、狂欢。'},
  {id:'builtin_3',title:'《山行》',author:'[唐]杜牧',text:'远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。'},
  {id:'builtin_4',title:'《赠刘景文》',author:'[宋]苏轼',text:'荷尽已无擎雨盖，菊残犹有傲霜枝。一年好景君须记，最是橙黄橘绿时。'},
  {id:'builtin_5',title:'《夜书所见》',author:'[宋]叶绍翁',text:'萧萧梧叶送寒声，江上秋风动客情。知有儿童挑促织，夜深篱落一灯明。'},
  {id:'builtin_6',title:'《秋天的雨》节选',author:'人教版三年级上册',text:'秋天的雨，有一盒五彩缤纷的颜料。你看，它把黄色给了银杏树，黄黄的叶子像一把把小扇子，扇哪扇哪，扇走了夏天的炎热。它把红色给了枫树，红红的枫叶像一枚枚邮票，飘哇飘哇，邮来了秋天的凉爽。'},
];

window.raState = {currentTextId:null,currentSentenceIdx:0,sentences:[],results:[],isRecording:false,recognition:null};

window.getRaTexts = function(){
  let tbTexts=[];
  if(G.gradeId&&G.textbookId){
    const tbKey=G.gradeId+'_'+G.textbookId;
    const tbStored=localStorage.getItem(RA_TB_KEY+tbKey);
    if(tbStored){try{tbTexts=JSON.parse(tbStored);}catch(e){}}
  }
  const stored=localStorage.getItem(RA_STORAGE_KEY);
  let custom=[];
  if(stored){try{custom=JSON.parse(stored);}catch(e){}}
  if(tbTexts.length>0)return [...tbTexts,...custom];
  return [...RA_BUILTIN_TEXTS,...custom];
};
window.saveCustomTexts = function(texts){
  localStorage.setItem(RA_STORAGE_KEY,JSON.stringify(texts));
};
window.getRaRecords = function(){
  const stored=localStorage.getItem(RA_RECORDS_KEY);
  if(stored){try{return JSON.parse(stored);}catch(e){}}
  return {};
};
window.saveRaRecords = function(records){
  localStorage.setItem(RA_RECORDS_KEY,JSON.stringify(records));
};
window.getDailyRaTask = function(){
  const today=new Date().toDateString();
  const records=getRaRecords();
  const todayCount=Object.values(records).filter(r=>r.lastDate===today).length;
  return {done:todayCount,goal:3,today};
};

window.renderReadAloud = function(){
  document.getElementById('ra-list-view').style.display='';
  document.getElementById('ra-reader-view').style.display='none';
  const task=getDailyRaTask();
  const pct=Math.min(100,Math.round(task.done/task.goal*100));
  const banner=document.getElementById('ra-daily-banner');
  if(task.done>=task.goal){
    banner.innerHTML='<div class="ra-daily-bar" style="border-color:rgba(0,230,118,.3);background:linear-gradient(135deg,rgba(0,230,118,.1),rgba(0,200,83,.08));"><div class="ra-daily-icon">✅</div><div class="ra-daily-info"><div class="ra-daily-title" style="color:#00E676;">今日朗读任务已完成！</div><div class="ra-daily-sub">已完成 '+task.done+' 篇朗读，继续保持！</div></div></div>';
  }else{
    banner.innerHTML='<div class="ra-daily-bar"><div class="ra-daily-icon">📖</div><div class="ra-daily-info"><div class="ra-daily-title">每日朗读任务</div><div class="ra-daily-sub">今日目标：朗读 '+task.goal+' 篇课文（已完成 '+task.done+'/'+task.goal+'）</div><div class="ra-daily-progress"><div class="ra-daily-progress-fill" style="width:'+pct+'%"></div></div></div></div>';
  }
  const texts=getRaTexts();
  const records=getRaRecords();
  const list=document.getElementById('ra-text-list');
  let headerHtml='';
  const hasTbTexts=G.gradeId&&G.textbookId&&localStorage.getItem(RA_TB_KEY+G.gradeId+'_'+G.textbookId);
  if(hasTbTexts){
    headerHtml='<div style="font-size:12px;color:#00D4FF;margin-bottom:8px;padding:6px 10px;background:rgba(0,212,255,.08);border-radius:8px;">📚 当前教材：'+getGradeLabel(G.gradeId)+' '+getTextbookLabel(G.textbookId)+'（已自动生成朗读课文）</div>';
  }else{
    headerHtml='<div style="font-size:12px;color:#8892B0;margin-bottom:8px;padding:6px 10px;">💡 导入教材后将自动生成朗读课文，当前显示内置示范课文</div>';
  }
  let html=headerHtml;
  texts.forEach(t=>{
    const rec=records[t.id];
    let scoreHtml='<span class="ra-t-score new">未读</span>';
    if(rec&&rec.score!==undefined){
      const cls=rec.score>=80?'good':(rec.score>=50?'ok':'new');
      scoreHtml='<span class="ra-t-score '+cls+'">'+rec.score+'分</span>';
    }
    const isPoem=t.text.length<80;
    const isTb=t.id&&t.id.startsWith('tb_');
    const icon=isTb?(isPoem?'📜':'📚'):(t.id&&t.id.startsWith('custom_')?'📝':(isPoem?'📜':'📄'));
    html+='<div class="ra-text-card" onclick="startRaReader(\''+t.id+'\')">';
    html+='<div class="ra-t-icon">'+icon+'</div>';
    html+='<div class="ra-t-info"><div class="ra-t-title">'+t.title+'</div><div class="ra-t-meta">'+t.author+' · '+t.text.length+'字</div></div>';
    html+=scoreHtml;
    html+='</div>';
  });
  list.innerHTML=html;
};

window.handleRaImport = function(evt){
  const file=evt.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    const text=e.target.result.trim();
    if(!text||text.length<5){showToast('文件内容太少');return;}
    const lines=text.split(/\r?\n/).filter(l=>l.trim());
    let title=file.name.replace(/\.txt$/i,'');
    let author='自定义课文';
    let body=text;
    if(lines.length>=2&&lines[0].length<50){
      title=lines[0].replace(/^[#\s]+/,'');
      if(lines[1].length<30&&(/作者|作品|版本|年级|——/.test(lines[1])||lines[1].startsWith('['))){
        author=lines[1];body=lines.slice(2).join('\n');
      }else{body=lines.slice(1).join('\n');}
    }
    const stored=localStorage.getItem(RA_STORAGE_KEY);
    let custom=[];if(stored)try{custom=JSON.parse(stored);}catch(e){}
    const id='custom_'+Date.now();
    custom.push({id,title,author,text:body.trim()});
    saveCustomTexts(custom);
    showToast('课文"'+title+'"已添加！',true);
    renderReadAloud();
  };
  reader.readAsText(file);
  evt.target.value='';
};

window.startRaReader = function(textId){
  const texts=getRaTexts();
  const t=texts.find(x=>x.id===textId);
  if(!t){showToast('课文不存在');return;}
  playClickSound();
  raState.currentTextId=textId;
  raState.currentSentenceIdx=0;
  raState.results=[];
  raState.isRecording=false;
  raState.sentences=splitSentences(t.text);
  document.getElementById('ra-list-view').style.display='none';
  document.getElementById('ra-reader-view').style.display='';
  document.getElementById('ra-reader-title').textContent=t.title;
  document.getElementById('ra-reader-author').textContent=t.author;
  document.getElementById('ra-result-panel').style.display='none';
  document.getElementById('ra-recognition-text').textContent='点击"🎙️ 开始朗读"进行录音';
  renderRaSentences();
  updateRaProgress();
};

window.splitSentences = function(text){
  const raw=text.replace(/\n+/g,'').split(/(?<=[。！？；\n])/g).map(s=>s.trim()).filter(s=>s);
  const result=[];
  let buf='';
  raw.forEach(s=>{
    buf+=s;
    if(buf.length>=4){result.push(buf);buf='';}
  });
  if(buf)result.push(buf);
  return result.length>0?result:[text];
};

window.renderRaSentences = function(){
  const body=document.getElementById('ra-text-body');
  let html='';
  raState.sentences.forEach((s,i)=>{
    let cls='ra-sentence';
    if(i===raState.currentSentenceIdx)cls+=' current';
    else if(i<raState.currentSentenceIdx&&raState.results[i]){
      cls+=raState.results[i].score>=70?' done':' error';
    }
    html+='<span class="'+cls+'" onclick="jumpToRaSentence('+i+')">'+s+'</span>';
  });
  body.innerHTML=html;
  const cur=body.querySelector('.current');
  if(cur)cur.scrollIntoView({behavior:'smooth',block:'center'});
};

window.jumpToRaSentence = function(idx){
  if(raState.isRecording)return;
  raState.currentSentenceIdx=idx;
  renderRaSentences();
  updateRaProgress();
  document.getElementById('ra-recognition-text').textContent='';
  document.getElementById('ra-result-panel').style.display='none';
};

window.updateRaProgress = function(){
  const total=raState.sentences.length;
  const done=raState.results.filter(r=>r).length;
  document.getElementById('ra-progress-text').textContent='第 '+(raState.currentSentenceIdx+1)+'/'+total+' 句 · 已完成 '+done+' 句';
};

window.raListenSentence = function(){
  const s=raState.sentences[raState.currentSentenceIdx];
  if(s){
    const u=new SpeechSynthesisUtterance(s);
    u.lang='zh-CN';u.rate=0.85;u.pitch=1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
};

window.raToggleRecord = function(){
  if(raState.isRecording){raStopRecord();return;}
  const SpeechRecog=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecog){
    showToast('当前浏览器不支持语音识别，请使用Chrome浏览器');
    return;
  }
  raState.isRecording=true;
  const btn=document.getElementById('ra-record-btn');
  btn.classList.add('recording');
  btn.innerHTML='⏹️ 停止录音';
  document.getElementById('ra-recognition-text').textContent='🎙️ 正在聆听...请朗读当前句子';
  document.getElementById('ra-result-panel').style.display='none';
  const recog=new SpeechRecog();
  recog.lang='zh-CN';
  recog.continuous=false;
  recog.interimResults=true;
  recog.maxAlternatives=1;
  raState.recognition=recog;
  recog.onresult=function(e){
    let transcript='';
    for(let i=0;i<e.results.length;i++){
      transcript+=e.results[i][0].transcript;
    }
    document.getElementById('ra-recognition-text').innerHTML='<span style="color:#00D4FF;">识别结果：</span>'+transcript;
    if(e.results[e.results.length-1].isFinal){
      raStopRecord();
      raEvaluate(transcript);
    }
  };
  recog.onerror=function(e){
    raStopRecord();
    if(e.error==='no-speech'){
      document.getElementById('ra-recognition-text').textContent='未检测到声音，请再试一次';
    }else if(e.error==='not-allowed'){
      document.getElementById('ra-recognition-text').textContent='请允许麦克风权限后再试';
    }else{
      document.getElementById('ra-recognition-text').textContent='识别出错('+e.error+')，请重试';
    }
  };
  recog.onend=function(){
    raStopRecord();
  };
  recog.start();
};

window.raStopRecord = function(){
  raState.isRecording=false;
  const btn=document.getElementById('ra-record-btn');
  btn.classList.remove('recording');
  btn.innerHTML='🎙️ 开始朗读';
  if(raState.recognition){
    try{raState.recognition.stop();}catch(e){}
    raState.recognition=null;
  }
};

window.raEvaluate = function(transcript){
  const target=raState.sentences[raState.currentSentenceIdx];
  const clean=s=>s.replace(/[，。！？、；：""''（）\s\u3000]/g,'');
  const targetClean=clean(target);
  const transClean=clean(transcript);
  const lcsLen=lcs(targetClean,transClean);
  const maxLen=Math.max(targetClean.length,1);
  const accuracy=Math.round(lcsLen/maxLen*100);
  const lenRatio=transClean.length/Math.max(targetClean.length,1);
  const fluency=Math.round(Math.max(0,Math.min(100,100-Math.abs(1-lenRatio)*80)));
  const score=Math.round(accuracy*0.7+fluency*0.3);
  const diff=findDiff(targetClean,transClean);
  const result={score,accuracy,fluency,transcript,diff};
  raState.results[raState.currentSentenceIdx]=result;
  showRaResult(result,target);
  renderRaSentences();
  updateRaProgress();
  const allDone=raState.results.filter(r=>r).length===raState.sentences.length;
  if(allDone)finishRaReading();
  if(score>=80)playCorrectSound();else playWrongSound();
};

window.lcs = function(a,b){
  const m=a.length,n=b.length;
  if(m===0||n===0)return 0;
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  }
  return dp[m][n];
};

window.findDiff = function(target,spoken){
  const missed=[];const wrong=[];
  let j=0;
  for(let i=0;i<target.length;i++){
    if(j<spoken.length&&target[i]===spoken[j]){j++;}
    else{missed.push(target[i]);}
  }
  return {missed,extra:spoken.substring(j)};
};

window.showRaResult = function(result,original){
  const panel=document.getElementById('ra-result-panel');
  const color=result.score>=80?'#00E676':(result.score>=60?'#FFD700':'#FF4757');
  const circumference=2*Math.PI*34;
  const offset=circumference*(1-result.score/100);
  let feedback='';
  if(result.score>=90)feedback='太棒了！读得非常准确流畅！';
  else if(result.score>=80)feedback='读得很好！继续保持！';
  else if(result.score>=60)feedback='不错哦，再练练会更好！';
  else feedback='加油！多听几遍范读再试试。';
  let diffHtml='';
  if(result.diff.missed.length>0){
    diffHtml+='<li>漏读/错读的字：<span style="color:#FF4757;font-weight:bold;">'+result.diff.missed.join('、')+'</span></li>';
  }
  if(result.accuracy<100){
    diffHtml+='<li>准确度：'+result.accuracy+'%  流畅度：'+result.fluency+'%</li>';
  }
  panel.innerHTML='<h3>朗读评分</h3>'+
    '<div class="ra-score-ring"><svg viewBox="0 0 80 80"><circle class="ring-bg" cx="40" cy="40" r="34"/><circle class="ring-fill" cx="40" cy="40" r="34" stroke="'+color+'" stroke-dasharray="'+circumference+'" stroke-dashoffset="'+offset+'"/></svg><div class="ra-score-num" style="color:'+color+'">'+result.score+'</div></div>'+
    '<div style="text-align:center;font-size:14px;color:'+color+';margin-bottom:8px;">'+feedback+'</div>'+
    '<ul class="ra-feedback-list">'+
    '<li>你读的：<span style="color:#00D4FF;">'+result.transcript+'</span></li>'+
    diffHtml+'</ul>';
  panel.style.display='';
};

window.raNextSentence = function(){
  if(raState.isRecording)raStopRecord();
  if(raState.currentSentenceIdx<raState.sentences.length-1){
    raState.currentSentenceIdx++;
    renderRaSentences();
    updateRaProgress();
    document.getElementById('ra-recognition-text').textContent='';
    document.getElementById('ra-result-panel').style.display='none';
  }else{
    if(raState.results.filter(r=>r).length===raState.sentences.length){
      finishRaReading();
    }else{
      showToast('还有未朗读的句子，点击句子跳转朗读');
    }
  }
};

window.finishRaReading = function(){
  const scores=raState.results.filter(r=>r).map(r=>r.score);
  const avgScore=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const records=getRaRecords();
  const today=new Date().toDateString();
  const prev=records[raState.currentTextId];
  records[raState.currentTextId]={
    score:Math.max(avgScore,(prev&&prev.score)||0),
    lastDate:today,
    times:((prev&&prev.times)||0)+1
  };
  saveRaRecords(records);
  let bonus=0;
  if(avgScore>=90)bonus=15;
  else if(avgScore>=70)bonus=10;
  else if(avgScore>=50)bonus=5;
  if(bonus>0){
    G.points+=bonus;
    saveGame();
  }
  showToast('朗读完成！平均得分 '+avgScore+' 分'+(bonus>0?'，获得 '+bonus+' 积分':''),true);
  if(typeof checkAchievements==='function')checkAchievements();
};

window.exitRaReader = function(){
  if(raState.isRecording)raStopRecord();
  window.speechSynthesis.cancel();
  document.getElementById('ra-list-view').style.display='';
  document.getElementById('ra-reader-view').style.display='none';
  renderReadAloud();
};
