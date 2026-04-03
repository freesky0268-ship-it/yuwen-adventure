// ==================== 教材管理模块 ====================
window.tbFilterTextbook = 'all';
window._tbImportTarget = null;

window.renderTextbookManager = function(){
  // 渲染过滤器
  const filterEl=document.getElementById('tb-filter');
  let filterHtml='<button class="tb-filter-btn '+(tbFilterTextbook==='all'?'active':'')+'" onclick="tbFilterTextbook=\'all\';renderTextbookManager();">全部</button>';
  TEXTBOOK_OPTIONS.forEach(t=>{
    filterHtml+='<button class="tb-filter-btn '+(tbFilterTextbook===t.id?'active':'')+'" onclick="tbFilterTextbook=\''+t.id+'\';renderTextbookManager();">'+t.label+'</button>';
  });
  filterEl.innerHTML=filterHtml;

  // 渲染题库卡片
  const grid=document.getElementById('tb-grid');
  let html='';
  GRADE_OPTIONS.forEach(g=>{
    const textbooks=tbFilterTextbook==='all'?TEXTBOOK_OPTIONS:TEXTBOOK_OPTIONS.filter(t=>t.id===tbFilterTextbook);
    textbooks.forEach(t=>{
      const key=g.id+'_'+t.id;
      const status=getTbStatus(g.id,t.id);
      const info=getTbInfo(g.id,t.id);
      const isCurrent=(G.gradeId===g.id&&G.textbookId===t.id);
      const statusBadge=status==='builtin'?'<span class="tb-badge builtin">内置</span>':
        status==='downloaded'?'<span class="tb-badge downloaded">已下载</span>':
        '<span class="tb-badge none">未安装</span>';
      const icon=status==='builtin'?'📗':(status==='downloaded'?'📘':'📕');
      let actions='';
      if(status==='none'){
        actions='<button class="tb-btn tb-btn-import" onclick="startTbImport(\''+g.id+'\',\''+t.id+'\')">📂 导入</button>';
      }else if(status==='downloaded'){
        actions+='<button class="tb-btn tb-btn-import" onclick="startTbImport(\''+g.id+'\',\''+t.id+'\')">🔄 更新</button>';
        actions+='<button class="tb-btn tb-btn-del" onclick="deleteTbBank(\''+g.id+'\',\''+t.id+'\')">🗑️</button>';
      }else if(status==='builtin'){
        actions+='<button class="tb-btn tb-btn-import" onclick="startTbImport(\''+g.id+'\',\''+t.id+'\')">🔄 覆盖</button>';
      }
      if(status!=='none'&&!isCurrent){
        actions+='<button class="tb-btn tb-btn-use" onclick="switchToBank(\''+g.id+'\',\''+t.id+'\')">✅ 使用</button>';
      }
      const metaText=status!=='none'?(info.qCount+'题 · '+info.lCount+'关'):'点击获取题库';
      const currentMark=isCurrent?'<span style="color:#FFD700;font-size:10px;margin-left:4px;">⭐当前</span>':'';
      html+='<div class="tb-card">';
      html+='<div class="tb-icon">'+icon+'</div>';
      html+='<div class="tb-info"><div class="tb-name">'+g.label+' · '+t.label+currentMark+'</div><div class="tb-meta">'+statusBadge+' '+metaText+'</div></div>';
      html+='<div class="tb-actions">'+actions+'</div>';
      html+='</div>';
    });
  });
  if(!html)html='<div class="tb-loading">没有匹配的题库</div>';
  grid.innerHTML=html;
};

window.startTbImport = function(gradeId,tbId){
  _tbImportTarget={gradeId,tbId};
  document.getElementById('tb-import-file').click();
};
window.handleTbImport = function(evt){
  const file=evt.target.files[0];
  if(!file||!_tbImportTarget)return;
  const isMd=file.name.toLowerCase().endsWith('.md');
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      let data;
      if(isMd){
        data=parseMdToBank(e.target.result);
        if(!data||((!data.questions||data.questions.length===0)&&(!data.readTexts||data.readTexts.length===0))){
          showToast('MD解析失败：未识别到有效题目或课文，请检查格式');return;
        }
      }else{
        data=JSON.parse(e.target.result);
        if(!data.questions||!Array.isArray(data.questions)||data.questions.length===0){
          showToast('JSON格式无效：需要包含questions数组');return;
        }
      }
      if(!data.levels||!Array.isArray(data.levels)){
        if(data.questions&&data.questions.length>0)data.levels=autoGenerateLevels(data.questions);
        else data.levels=[];
      }
      const key=_tbImportTarget.gradeId+'_'+_tbImportTarget.tbId;
      const bankToSave={questions:data.questions||[],levels:data.levels||[]};
      if(bankToSave.questions.length>0)localStorage.setItem(TB_STORAGE_KEY+key,JSON.stringify(bankToSave));
      // 保存朗读文章到独立存储
      if(data.readTexts&&data.readTexts.length>0){
        const raTexts=data.readTexts.map((t,i)=>({id:'tb_'+key+'_'+i,title:t.title,author:t.author||getGradeLabel(_tbImportTarget.gradeId)+' '+getTextbookLabel(_tbImportTarget.tbId),text:t.text.trim()}));
        localStorage.setItem(RA_TB_KEY+key,JSON.stringify(raTexts));
      }
      const qMsg=data.questions&&data.questions.length>0?(data.questions.length+'道题'):'';
      const rMsg=data.readTexts&&data.readTexts.length>0?(data.readTexts.length+'篇朗读课文'):'';
      const parts=[qMsg,rMsg].filter(x=>x);
      showToast('导入成功！'+parts.join(' + '),true);
      renderTextbookManager();
    }catch(err){
      showToast('导入失败：'+(isMd?'MD解析错误':'文件格式错误'));
    }
    _tbImportTarget=null;
  };
  reader.readAsText(file);
  evt.target.value='';
};

// ==================== MD解析器 ====================
window.parseMdToBank = function(mdText){
  const explicit=parseMdExplicitQuestions(mdText);
  if(explicit&&explicit.length>=3){
    const material=parseMdMaterial(mdText);
    const bank=buildBankFromQuestions(explicit);
    if(material.readTexts&&material.readTexts.length>0)bank.readTexts=material.readTexts;
    return bank;
  }
  const material=parseMdMaterial(mdText);
  const generated=generateQuestionsFromMaterial(material);
  if(generated&&generated.length>0){
    const bank=buildBankFromQuestions(generated);
    if(material.readTexts&&material.readTexts.length>0)bank.readTexts=material.readTexts;
    return bank;
  }
  if(material.readTexts&&material.readTexts.length>0){
    return {questions:[],levels:[],readTexts:material.readTexts};
  }
  return null;
};

window.parseMdExplicitQuestions = function(mdText){
  const questions=[];
  const lines=mdText.split(/\r?\n/);
  let currentLevel=-1,currentType='word',levelNames=[];
  let q=null;
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();
    const lvMatch=line.match(/^#{1,3}\s*(?:第(\d+)关|关卡\s*(\d+)|Level\s*(\d+))[：:\s]*(.*)/i);
    if(lvMatch){currentLevel=parseInt(lvMatch[1]||lvMatch[2]||lvMatch[3])-1;const lvName=(lvMatch[4]||'').trim();levelNames[currentLevel]=lvName||('第'+(currentLevel+1)+'关');if(/字|词|拼音/.test(lvName))currentType='word';else if(/句|修辞/.test(lvName))currentType='sentence';else if(/阅读|课文/.test(lvName))currentType='reading';else if(/诗/.test(lvName))currentType='poetry';continue;}
    const typeMatch=line.match(/^\[(?:type|类型)[：:]\s*(word|sentence|reading|poetry|字词|句子|阅读|古诗)\]/i);
    if(typeMatch){const tm=typeMatch[1].toLowerCase();currentType=({字词:'word',句子:'sentence',阅读:'reading',古诗:'poetry'})[tm]||tm;continue;}
    const qMatch=line.match(/^(?:(\d+)[.、）\)]\s*)(.+)/);
    if(qMatch&&!line.match(/^[A-Da-d][.、）\)]/)){if(q&&q.q&&q.opts.length>=2)questions.push(q);q={level:Math.max(0,currentLevel),type:currentType,q:(qMatch[2]||'').replace(/[*]{2}/g,'').trim(),opts:[],ans:0,explain:''};continue;}
    if(q){
      const optMatch=line.match(/^[A-Da-d][.、）\)]\s*(.+)/);
      if(optMatch){q.opts.push(optMatch[1].trim());continue;}
      const checkMatch=line.match(/^-\s*\[([ xX✓✔])\]\s*(.+)/);
      if(checkMatch){q.opts.push(checkMatch[2].trim());if(/[xX✓✔]/.test(checkMatch[1]))q.ans=q.opts.length-1;continue;}
      const ansMatch=line.match(/^(?:答案|正确答案|answer)[：:]\s*([A-Da-d])/i);
      if(ansMatch){q.ans='abcdABCD'.indexOf(ansMatch[1])%4;continue;}
      const expMatch=line.match(/^(?:解析|说明|解释|explain)[：:]\s*(.+)/i);
      if(expMatch){q.explain=expMatch[1].trim();continue;}
    }
  }
  if(q&&q.q&&q.opts.length>=2)questions.push(q);
  return questions;
};

window.buildBankFromQuestions = function(questions){
  const icons=['⚔️','🗡️','🏰','🔨','🗼','⚙️','🏜️','🌋','🌪️','🥋','🐉','👑','💫','🎭','🔮'];
  const themes=['#00E676','#00C853','#FFD700','#FF6B35','#00D4FF','#FF4500','#8892B0','#FF6B35','#00D4FF','#FF4757','#FFD700','#FF6B35'];
  const levelNums=[...new Set(questions.map(q=>q.level))].sort((a,b)=>a-b);
  if(levelNums.length<=1&&questions.length>5){
    const perLevel=5;
    questions.forEach((q,i)=>q.level=Math.floor(i/perLevel));
    const newNums=[...new Set(questions.map(q=>q.level))].sort((a,b)=>a-b);
    const levels=newNums.map((lv,i)=>({name:'第'+(lv+1)+'关',desc:questions.filter(q=>q.level===lv).length+'道题',icon:icons[i%icons.length],theme:themes[i%themes.length]}));
    return {questions,levels};
  }
  const levels=levelNums.map((lv,i)=>{
    const count=questions.filter(q=>q.level===lv).length;
    return {name:'第'+(lv+1)+'关',desc:count+'道题',icon:icons[i%icons.length],theme:themes[i%themes.length]};
  });
  return {questions,levels};
};

window.parseMdMaterial = function(mdText){
  const lines=mdText.split(/\r?\n/);
  const material={chars:[],multiPron:[],synonyms:[],antonyms:[],idioms:[],poems:[],units:[],readTexts:[]};
  let currentUnit=-1,section='',curReadText=null;
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();
    const unitMatch=line.match(/^##\s*第([一二三四五六七八九十\d]+)单元[：:\s]*(.*)/);
    if(unitMatch){currentUnit++;material.units.push({name:unitMatch[2]||('第'+(currentUnit+1)+'单元'),chars:[],poems:[]});section='';continue;}
    if(/^###?\s*(重点生字|生字)/.test(line)){section='chars';continue;}
    if(/^###?\s*(多音字|全册多音字)/.test(line)){section='multi';continue;}
    if(/^###?\s*(近义词|全册近义词)/.test(line)){section='synonym';continue;}
    if(/^###?\s*(反义词|全册反义词)/.test(line)){section='antonym';continue;}
    if(/^###?\s*(成语|成语积累)/.test(line)){section='idiom';continue;}
    if(/^###?\s*(必背古诗|古诗)/.test(line)){section='poem';continue;}
    if(/^###?\s*(课文目录|重点词语|词语搭配|动词搭配|形容词搭配|量词搭配|标点|语文园地)/.test(line)){if(curReadText&&curReadText.text.trim())material.readTexts.push(curReadText);curReadText=null;section='other';continue;}
    if(/^###?\s*(必背课文|课文片段|重点课文)/.test(line)){if(curReadText&&curReadText.text.trim())material.readTexts.push(curReadText);curReadText=null;section='readtext';continue;}
    if(/^##\s/.test(line)){if(curReadText&&curReadText.text.trim())material.readTexts.push(curReadText);curReadText=null;section='other';continue;}
    if(section==='readtext'){
      const rtTitle=line.match(/^####?\s*(?:《(.+?)》|[*]{2}(.+?)[*]{2})/);
      if(rtTitle){
        if(curReadText&&curReadText.text.trim())material.readTexts.push(curReadText);
        const unitName=(currentUnit>=0&&material.units[currentUnit])?material.units[currentUnit].name:'';
        curReadText={title:(rtTitle[1]||rtTitle[2]).trim(),author:unitName,text:''};
        continue;
      }
      if(!line||/^[-=]{3,}$/.test(line))continue;
      if(!curReadText&&line.length>2){
        const unitName=(currentUnit>=0&&material.units[currentUnit])?material.units[currentUnit].name:'';
        curReadText={title:line.substring(0,20)+(line.length>20?'...':''),author:unitName,text:''};
      }
      if(curReadText){curReadText.text+=line+'\n';}
      continue;
    }
    if(/^\|[-\s|]+\|$/.test(line))continue;
    if(line.startsWith('|')&&line.endsWith('|')){
      const cells=line.split('|').map(c=>c.trim()).filter(c=>c);
      if(section==='chars'&&cells.length>=3){
        const idx=cells[0].match(/^\d+$/)?1:0;
        const char=cells[idx]||'';const pinyin=cells[idx+1]||'';const radical=cells[idx+2]||'';
        const words=cells[idx+3]||'';const sentence=cells[idx+4]||'';
        if(char&&pinyin&&char.length<=2){
          const entry={char,pinyin,radical,words,sentence,unit:currentUnit};
          material.chars.push(entry);
          if(currentUnit>=0&&material.units[currentUnit])material.units[currentUnit].chars.push(entry);
        }
        continue;
      }
      if(section==='multi'&&cells.length>=2){
        const char=cells[0];
        const prons=[];
        for(let c=1;c<cells.length;c++){
          const m=cells[c].match(/([a-züāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+)[（(]([^）)]+)[）)]/);
          if(m)prons.push({pinyin:m[1],word:m[2]});
        }
        if(char&&prons.length>=2)material.multiPron.push({char,prons});
        continue;
      }
      if(section==='synonym'&&cells.length>=2){
        material.synonyms.push({word:cells[0],syn:cells[1]});continue;
      }
      if(section==='antonym'&&cells.length>=2){
        material.antonyms.push({word:cells[0],ant:cells[1]});continue;
      }
      if(section==='idiom'&&cells.length>=2){
        material.idioms.push({idiom:cells[0],meaning:cells[1],sentence:cells[2]||''});continue;
      }
    }
    const poemMatch=line.match(/^####?\s*《(.+?)》\s*\[(.+?)\]\s*(.+)/);
    if(poemMatch&&section==='poem'){
      const poem={title:poemMatch[1],dynasty:poemMatch[2],author:poemMatch[3],lines:[],unit:currentUnit};
      for(let j=i+1;j<lines.length&&j<i+10;j++){
        const pl=lines[j].trim();
        if(!pl||pl.startsWith('#')||pl.startsWith('**')||pl.startsWith('---'))break;
        if(pl.includes('，')||pl.includes('。')||pl.includes('？')||pl.includes('！')){
          poem.lines.push(pl);
        }
      }
      if(poem.lines.length>0){material.poems.push(poem);if(currentUnit>=0&&material.units[currentUnit])material.units[currentUnit].poems.push(poem);}
      continue;
    }
  }
  if(curReadText&&curReadText.text.trim())material.readTexts.push(curReadText);
  material.poems.forEach(p=>{
    const poemText=p.lines.join('\n');
    if(poemText.length>=8){
      material.readTexts.push({title:'《'+p.title+'》',author:'['+p.dynasty+']'+p.author,text:poemText});
    }
  });
  return material;
};

window.generateQuestionsFromMaterial = function(m){
  const qs=[];
  const rnd=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick=(arr,n,exclude)=>{const pool=arr.filter(x=>x!==exclude);const s=rnd(pool);return s.slice(0,n);};
  let levelIdx=0;

  // 1. 拼音题
  const unitGroups={};
  m.chars.forEach(c=>{if(!unitGroups[c.unit])unitGroups[c.unit]=[];unitGroups[c.unit].push(c);});
  Object.keys(unitGroups).sort((a,b)=>a-b).forEach(uid=>{
    const chars=rnd(unitGroups[uid]);
    const selected=chars.slice(0,Math.min(5,chars.length));
    selected.forEach(c=>{
      const allPinyins=m.chars.map(x=>x.pinyin).filter(x=>x&&x!==c.pinyin);
      const wrongs=pick(allPinyins,3,c.pinyin);
      if(wrongs.length>=3){
        const opts=[c.pinyin,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+c.char+'"的正确读音是？',opts:shuffled,ans:shuffled.indexOf(c.pinyin),explain:c.char+'的拼音是'+c.pinyin+'。'+(c.words?'组词：'+c.words:'')});
      }
    });
    levelIdx++;
  });

  // 2. 部首题
  Object.keys(unitGroups).sort((a,b)=>a-b).forEach(uid=>{
    const chars=rnd(unitGroups[uid].filter(c=>c.radical));
    const selected=chars.slice(0,Math.min(3,chars.length));
    selected.forEach(c=>{
      const allRadicals=m.chars.map(x=>x.radical).filter(x=>x&&x!==c.radical);
      const unique=[...new Set(allRadicals)];
      const wrongs=pick(unique,3,c.radical);
      if(wrongs.length>=3){
        const opts=[c.radical,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+c.char+'"的部首是什么？',opts:shuffled,ans:shuffled.indexOf(c.radical),explain:c.char+'('+c.pinyin+')的部首是"'+c.radical+'"。'+(c.words?'组词：'+c.words:'')});
      }
    });
    levelIdx++;
  });

  // 3. 多音字题
  if(m.multiPron.length>=3){
    const selected=rnd(m.multiPron).slice(0,Math.min(10,m.multiPron.length));
    selected.forEach(mp=>{
      const correct=mp.prons[0];
      const allPinyins=mp.prons.map(p=>p.pinyin);
      const otherPinyins=m.multiPron.flatMap(x=>x.prons.map(p=>p.pinyin)).filter(p=>!allPinyins.includes(p));
      const wrongs=[...mp.prons.slice(1).map(p=>p.pinyin),...pick([...new Set(otherPinyins)],2)].slice(0,3);
      if(wrongs.length>=3){
        const opts=[correct.pinyin,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+mp.char+'"在"'+correct.word+'"中读什么？',opts:shuffled,ans:shuffled.indexOf(correct.pinyin),explain:'"'+mp.char+'"在"'+correct.word+'"中读'+correct.pinyin+'。其他读音：'+mp.prons.slice(1).map(p=>p.pinyin+'('+p.word+')').join('、')});
      }
    });
    levelIdx++;
  }

  // 4. 近义词题
  if(m.synonyms.length>=4){
    const selected=rnd(m.synonyms).slice(0,Math.min(8,m.synonyms.length));
    selected.forEach(s=>{
      const correctSyn=(s.syn.split(/[、，,]/))[0].trim();
      const wrongs=pick(m.synonyms.map(x=>(x.word)),3,s.word);
      if(wrongs.length>=3&&correctSyn){
        const opts=[correctSyn,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+s.word+'"的近义词是？',opts:shuffled,ans:shuffled.indexOf(correctSyn),explain:'"'+s.word+'"的近义词是：'+s.syn});
      }
    });
    levelIdx++;
  }

  // 5. 反义词题
  if(m.antonyms.length>=4){
    const selected=rnd(m.antonyms).slice(0,Math.min(8,m.antonyms.length));
    selected.forEach(a=>{
      const correctAnt=(a.ant.split(/[、，,]/))[0].trim();
      const wrongs=pick(m.antonyms.map(x=>(x.word)),3,a.word);
      if(wrongs.length>=3&&correctAnt){
        const opts=[correctAnt,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+a.word+'"的反义词是？',opts:shuffled,ans:shuffled.indexOf(correctAnt),explain:'"'+a.word+'"的反义词是：'+a.ant});
      }
    });
    levelIdx++;
  }

  // 6. 成语释义题
  if(m.idioms.length>=4){
    const selected=rnd(m.idioms).slice(0,Math.min(8,m.idioms.length));
    selected.forEach(id=>{
      if(!id.meaning)return;
      const wrongs=pick(m.idioms.filter(x=>x.meaning).map(x=>x.meaning),3,id.meaning);
      if(wrongs.length>=3){
        const opts=[id.meaning,...wrongs.slice(0,3)];
        const shuffled=rnd(opts);
        qs.push({level:levelIdx,type:'word',q:'"'+id.idiom+'"的意思是？',opts:shuffled,ans:shuffled.indexOf(id.meaning),explain:id.idiom+'：'+id.meaning+(id.sentence?'。造句：'+id.sentence:'')});
      }
    });
    levelIdx++;
  }

  // 7. 古诗填空题
  if(m.poems.length>=2){
    m.poems.forEach(p=>{
      p.lines.forEach(pline=>{
        const parts=pline.split(/[，。？！]/g).filter(x=>x.trim());
        if(parts.length>=2){
          const qLine=parts[0]+'，______。';
          const correctAns=parts[1].trim();
          const otherLines=m.poems.flatMap(pp=>pp.lines).flatMap(l=>l.split(/[，。？！]/g).filter(x=>x.trim())).filter(x=>x!==correctAns&&x!==parts[0]);
          const wrongs=pick([...new Set(otherLines)],3);
          if(wrongs.length>=3){
            const opts=[correctAns,...wrongs.slice(0,3)];
            const shuffled=rnd(opts);
            qs.push({level:levelIdx,type:'poetry',q:p.author+'《'+p.title+'》："'+qLine+'"',opts:shuffled,ans:shuffled.indexOf(correctAns),explain:'出自['+p.dynasty+']'+p.author+'《'+p.title+'》。完整诗句：'+pline});
          }
        }
      });
    });
    levelIdx++;
  }

  return qs;
};

window.autoGenerateLevels = function(questions){
  const levelNums=[...new Set(questions.map(q=>q.level))].filter(x=>x!==undefined).sort((a,b)=>a-b);
  if(levelNums.length>0){
    const icons=['⚔️','🗡️','🏰','🔨','🗼','⚙️','🏜️','🌋','🌪️','🥋','🐉','👑','💫','🎭','🔮'];
    const themes=['#00E676','#00C853','#FFD700','#FF6B35','#00D4FF','#FF4500','#8892B0','#FF6B35','#00D4FF','#FF4757','#FFD700','#FF6B35','#9B59B6','#E91E63','#3F51B5'];
    return levelNums.map((lv,i)=>{
      const count=questions.filter(q=>q.level===lv).length;
      return {name:'第'+(lv+1)+'关',desc:count+'道题',icon:icons[i%icons.length],theme:themes[i%themes.length]};
    });
  }
  const total=questions.length;
  const numLevels=Math.ceil(total/5);
  const levels=[];
  for(let i=0;i<numLevels;i++){
    questions.filter((_,idx)=>Math.floor(idx/5)===i).forEach(q=>q.level=i);
    levels.push({name:'第'+(i+1)+'关',desc:'5道题',icon:'⚔️',theme:'#00D4FF'});
  }
  return levels;
};

window.deleteTbBank = function(gradeId,tbId){
  const key=gradeId+'_'+tbId;
  if(!confirm('确定删除 '+getGradeLabel(gradeId)+' '+getTextbookLabel(tbId)+' 的题库？'))return;
  localStorage.removeItem(TB_STORAGE_KEY+key);
  localStorage.removeItem(RA_TB_KEY+key);
  if(G.gradeId===gradeId&&G.textbookId===tbId){
    loadGradeData();
  }
  showToast('题库已删除',false);
  renderTextbookManager();
};

window.switchToBank = function(gradeId,tbId){
  G.gradeId=gradeId;
  G.textbookId=tbId;
  loadGradeData();
  saveGame();
  showToast('已切换到 '+getGradeLabel(gradeId)+' '+getTextbookLabel(tbId),true);
  showScreen('map');
};
