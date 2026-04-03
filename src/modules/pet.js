// ==================== 被动效果计算 ====================
window.getDecoPassive = function(key){
  let total=0;
  if(!G.pet.decos)return 0;
  G.pet.decos.forEach(did=>{
    const item=SHOP_ITEMS.deco.find(x=>x.id===did);
    if(item&&item.passive&&item.passive[key])total+=item.passive[key];
  });
  return total;
};

window.calcCoinBonus = function(){
  let bonus=1.0;
  bonus+=getDecoPassive('coinBonus');
  // 狮王天赋：金币+15%
  if(G.pet.type==='lion')bonus+=0.15;
  // 宠物等级加成：每3级+5%
  bonus+=Math.floor(G.pet.level/3)*0.05;
  // 心情加成：>80时+10%
  if(G.pet.mood>80)bonus+=0.10;
  return bonus;
};

window.calcGrowthBonus = function(isCorrect){
  let base=isCorrect?1:0;
  base+=getDecoPassive(isCorrect?'growthBonus':'wrongGrowth');
  // 狼天赋：成长+20%
  if(G.pet.type==='wolf'&&isCorrect)base=Math.ceil(base*1.2);
  return base;
};

// ==================== 宠物系统 ====================
window.updatePetHunger = function(){
  if(G.lastLogin){
    const hours=(Date.now()-G.lastLogin)/(1000*60*60);
    let decayRate=20/24; // 每小时衰减量
    decayRate*=(1-getDecoPassive('hungerDecayReduce')); // 头盔减少衰减
    const drop=Math.floor(hours*decayRate);
    G.pet.hunger=Math.max(0,G.pet.hunger-drop);
    // 饱食度低于30时，心情也下降
    if(G.pet.hunger<30){
      const moodDrop=Math.floor(hours*5);
      G.pet.mood=Math.max(0,G.pet.mood-moodDrop);
    }
  }
  G.lastLogin=Date.now();
  checkConsecutiveDays();
  saveGame();
};

window.checkConsecutiveDays = function(){
  const today=new Date().toDateString();
  const lastDate=G.lastLogin?new Date(G.lastLogin).toDateString():'';
  if(lastDate!==today){
    const yesterday=new Date(Date.now()-86400000).toDateString();
    if(lastDate===yesterday){G.consecutiveDays++;}
    else if(lastDate!==today){G.consecutiveDays=1;}
    G.todayLearned=false;
    // 鹰天赋：默契度提升+50%
    const intGain=G.pet.type==='eagle'?15:10;
    G.pet.intimacy=Math.min(100,G.pet.intimacy+intGain);
  }
  if(G.consecutiveDays>=3&&!G.treasureReady)G.treasureReady=true;
};

window.addGrowth = function(amount){
  if(amount<=0)return;
  G.pet.growth+=amount;
  checkPetLevelUp();
};

window.checkPetLevelUp = function(){
  let newLevel=1;
  for(let i=LEVEL_THRESHOLDS.length-1;i>=0;i--){
    if(G.pet.growth>=LEVEL_THRESHOLDS[i]){newLevel=i+1;break;}
  }
  if(newLevel>G.pet.level){
    const oldLevel=G.pet.level;
    G.pet.level=newLevel;
    saveGame();
    showLevelUp(oldLevel,newLevel);
  }
};

window.showLevelUp = function(oldLv,newLv){
  playLevelUpSound();
  const box=document.getElementById('levelup-box');
  const cfg=PET_CONFIG[G.pet.type]||{emoji:'🐾',name:'伙伴'};
  const title=getLevelTitle(newLv);
  let unlockText='';
  // 检查是否解锁了新商店物品
  const allItems=[...SHOP_ITEMS.food,...SHOP_ITEMS.toy,...SHOP_ITEMS.deco];
  const unlocked=allItems.filter(it=>it.reqLevel===newLv);
  if(unlocked.length>0){
    unlockText='<div style="margin-top:8px;font-size:14px;color:#00D4FF;">🔓 解锁新物品：'+unlocked.map(i=>i.emoji+' '+i.name).join('、')+'</div>';
  }
  box.innerHTML=`
    <div style="font-size:64px;">${cfg.emoji}</div>
    <h2 style="color:#FFD700;margin:12px 0;">🎉 ${G.pet.name} 升级了！</h2>
    <div style="font-size:18px;color:#E8E8F0;">Lv.${oldLv} → <strong style="color:#FF6B35;">Lv.${newLv}</strong> ${title}</div>
    <div style="font-size:14px;color:#8892B0;margin-top:4px;">下一级需要 ${LEVEL_THRESHOLDS[Math.min(newLv,9)]} 成长值</div>
    ${unlockText}
    <button class="btn btn-primary btn-small" style="margin-top:16px;" onclick="closeLevelUp()">太棒了！</button>
  `;
  document.getElementById('levelup-overlay').classList.add('show');
  speak(G.pet.name+'升到'+newLv+'级啦！称号变成了'+title+'！');
};
window.closeLevelUp = function(){document.getElementById('levelup-overlay').classList.remove('show');};

window.feedPet = function(item){
  let hungerGain=item.hunger;
  // 最爱食物1.5倍
  if(item.fav===G.pet.type||item.fav==='all'&&G.pet.type){
    if(item.fav===G.pet.type)hungerGain=Math.ceil(hungerGain*1.5);
  }
  G.pet.hunger=Math.min(100,G.pet.hunger+hungerGain);
  G.pet.mood=Math.min(100,G.pet.mood+(item.mood||0));
  if(item.growth)addGrowth(item.growth);
  saveGame();
};

window.playWithPet = function(item){
  let moodGain=item.mood;
  let growthGain=item.growth||0;
  // 宠物类型加成
  if(item.petBonus&&item.petBonus[G.pet.type]){
    growthGain+=item.petBonus[G.pet.type];
  }
  G.pet.mood=Math.min(100,G.pet.mood+moodGain);
  if(growthGain)addGrowth(growthGain);
  if(item.id==='musicbox')playMusicBox();
  saveGame();
};

window.getPetAnimClass = function(){
  if(G.pet.hunger<30)return 'hungry';
  if(G.pet.mood<30)return 'sad';
  if(G.pet.mood>60)return 'happy';
  return '';
};
window.getLevelTitle = function(lv){
  if(lv<=2)return '幼崽';if(lv<=4)return '新兵';if(lv<=6)return '战士';if(lv<=8)return '精英';return '✨传奇✨';
};
window.getPetSpeech = function(){
  const speeches=['冲吧，勇士！⚔️','你越来越强了！💪','全力以赴！🔥','我陪你闯关！🌟','你真是天才！🧠','胜利在前方！✨','我们是最强搭档！🤝','向Boss出发！🎯'];
  if(G.pet.hunger<30)return '我好饿……快给我补给🍖';
  if(G.pet.mood<30)return '状态不太好……需要训练💤';
  if(G.pet.intimacy>80)return '有你在，无所畏惧！❤️';
  return speeches[Math.floor(Math.random()*speeches.length)];
};

// ==================== 伙伴基地渲染 ====================
window.renderPetHouse = function(){
  const p=G.pet;const cfg=PET_CONFIG[p.type];if(!cfg)return;
  const animClass=getPetAnimClass();
  const decoEmojis=p.decos.map(d=>{const it=SHOP_ITEMS.deco.find(x=>x.id===d);return it?it.emoji:'';}).join('');
  let speech='';
  if(p.mood>60&&p.hunger>50)speech=`<div class="pet-speech show">${getPetSpeech()}</div>`;
  // 动态计算综合加成
  const totalCoinBonus=calcCoinBonus();
  const totalCoinPct=Math.round((totalCoinBonus-1)*100);
  const totalGrowthBase=calcGrowthBonus(true);
  let perkLine='';
  if(p.type==='lion'){
    let details=['天赋+15%'];
    if(getDecoPassive('coinBonus'))details.push('装备+'+Math.round(getDecoPassive('coinBonus')*100)+'%');
    if(Math.floor(p.level/3)>0)details.push('等级+'+Math.floor(p.level/3)*5+'%');
    if(p.mood>80)details.push('心情+10%');
    perkLine=`<div style="font-size:12px;margin-top:4px;"><span style="color:#FFD700;">🏷️ 金币总加成 +${totalCoinPct}%</span> <span style="color:#8892B0;font-size:11px;">（${details.join('、')}）</span></div>`;
  }else if(p.type==='wolf'){
    let details=['天赋×1.2'];
    if(getDecoPassive('growthBonus'))details.push('装备+'+getDecoPassive('growthBonus'));
    perkLine=`<div style="font-size:12px;margin-top:4px;"><span style="color:#FFD700;">🏷️ 每题成长 +${totalGrowthBase}</span> <span style="color:#8892B0;font-size:11px;">（${details.join('、')}）</span></div>`;
  }else if(p.type==='eagle'){
    const eagleIntimacy=p.intimacy>=80?'已激活特殊台词':'未满80';
    perkLine=`<div style="font-size:12px;margin-top:4px;"><span style="color:#FFD700;">🏷️ 默契度提升+50%</span> <span style="color:#8892B0;font-size:11px;">（天赋加成，当前${p.intimacy}/100 ${eagleIntimacy}）</span></div>`;
  }
  document.getElementById('pet-display').innerHTML=`
    ${speech}
    <div class="pet-avatar ${animClass}" onclick="petSpeak()">${cfg.emoji}</div>
    <div style="font-size:24px;margin-top:-4px;">${decoEmojis}</div>
    <div class="pet-name-display">${p.name}</div>
    <div class="pet-level-badge">Lv.${p.level} ${getLevelTitle(p.level)}</div>
    ${perkLine}
    <div style="font-size:12px;color:#8892B0;">📈 下一级需要 ${LEVEL_THRESHOLDS[Math.min(p.level,9)]} 成长值（当前 ${p.growth}）</div>`;

  const nextThresh=LEVEL_THRESHOLDS[Math.min(p.level,9)];
  const growthPct=Math.min(100,p.growth/Math.max(nextThresh,1)*100);
  // 计算当前装备被动效果
  const pCoin=getDecoPassive('coinBonus');
  const pGrowth=getDecoPassive('growthBonus');
  const pWrong=getDecoPassive('wrongGrowth');
  const pHunger=getDecoPassive('hungerDecayReduce');
  const pMood=getDecoPassive('moodBonus');
  const bonusStyle='color:#00E676;font-size:11px;font-weight:700;margin-left:4px;';
  document.getElementById('pet-stats-grid').innerHTML=`
    <div class="stat-card">
      <div class="stat-label">🍖 饱食度 <span class="stat-info">ℹ️</span>${pHunger?`<span style="${bonusStyle}">🛡️ 衰减-${Math.round(pHunger*100)}%</span>`:''}</div>
      <div class="stat-bar"><div class="stat-fill hunger" style="width:${p.hunger}%"></div></div>
      <div class="stat-value">${p.hunger}/100</div>
      <div class="stat-tooltip"><strong>饱食度说明</strong><br>• 每24小时自然下降20点<br>• 低于30时战斗力也会下降<br>• 使用补给品恢复<br>• 最爱的食物恢复量×1.5<br>${pHunger?'• <span style="color:#00E676;">✅ 战术头盔生效：衰减-'+Math.round(pHunger*100)+'%</span><br>':'• 装备战术头盔可减缓衰减25%<br>'}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">⚡ 战斗力 <span class="stat-info">ℹ️</span>${pMood?`<span style="${bonusStyle}">🛡️ 每题+${pMood}</span>`:''}</div>
      <div class="stat-bar"><div class="stat-fill mood" style="width:${p.mood}%"></div></div>
      <div class="stat-value">${p.mood}/100</div>
      <div class="stat-tooltip"><strong>战斗力说明</strong><br>• 答对题目+5${pMood?'<span style="color:#00E676;">+'+pMood+'(战盾)</span>':''}=${5+(pMood||0)}/次<br>• 连对3题额外+10<br>• 答错-5<br>• 饱食度低于30时持续下降<br>• 超过80时答题金币+10%<br>• 使用训练器可提升</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📈 成长值 <span class="stat-info">ℹ️</span>${pGrowth?`<span style="${bonusStyle}">⚔️ 每题+${pGrowth}</span>`:''}${pWrong?`<span style="${bonusStyle}">🔭 错题+${pWrong}</span>`:''}</div>
      <div class="stat-bar"><div class="stat-fill growth" style="width:${growthPct}%"></div></div>
      <div class="stat-value">${p.growth} / ${nextThresh}</div>
      <div class="stat-tooltip"><strong>成长值说明</strong><br>• 答对+1${pGrowth?'<span style="color:#00E676;">+'+pGrowth+'(短剑)</span>':''}=${1+(pGrowth||0)}/次<br>${pWrong?'• <span style="color:#00E676;">✅ 侦察镜生效：答错也+'+pWrong+'成长</span><br>':'• 装备侦察镜可让答错也获得成长<br>'}• 暗影战狼天赋：成长+20%<br>• 达到阈值自动升级：<br>  Lv2=20, Lv3=50, Lv4=100<br>  Lv5=170, Lv6=260, Lv7=370<br>  Lv8=500, Lv9=660, Lv10=850</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">🤝 默契度 <span class="stat-info">ℹ️</span></div>
      <div class="stat-bar"><div class="stat-fill intimacy" style="width:${p.intimacy}%"></div></div>
      <div class="stat-value">${p.intimacy}/100</div>
      <div class="stat-tooltip"><strong>默契度说明</strong><br>• 每天登录+10（神鹰天赋+15）<br>• 每完成一个关卡+3（神鹰+5）<br>• 最高100<br>• 超过80时伙伴会说特殊台词<br>• 影响伙伴互动的丰富程度</div>
    </div>
    ${pCoin?`<div style="grid-column:1/-1;text-align:center;padding:6px;background:rgba(0,230,118,.08);border-radius:10px;border:1px solid rgba(0,230,118,.2);"><span style="color:#00E676;font-size:12px;font-weight:700;">💰 金币加成 +${Math.round(pCoin*100)}%（铜质勋章）</span></div>`:''}`;

  document.getElementById('pet-action-btns').innerHTML=`
    <button class="btn btn-small btn-shop" onclick="showScreen('shop')">⚔️ 去补给</button>
    <button class="btn btn-small" style="background:linear-gradient(135deg,#00D4FF,#0099CC);color:#1A1A2E;" onclick="petSpeak()">💬 战术交流</button>`;
  // 展示所有已拥有的装备
  const dl=document.getElementById('pet-deco-list');
  const ownedDecos=Object.keys(G.inventory.deco||{}).filter(id=>G.inventory.deco[id]);
  if(ownedDecos.length>0){
    dl.innerHTML=ownedDecos.map(d=>{const it=SHOP_ITEMS.deco.find(x=>x.id===d);if(!it)return '';
      const isEquipped=p.decos.includes(d);
      const border=isEquipped?'2px solid #00E676':'2px dashed rgba(255,255,255,.25)';
      const opacity=isEquipped?'1':'0.6';
      const label=isEquipped?'✅':'';
      const action=isEquipped?`unequipDeco('${d}')`:`equipDeco('${d}')`;
      const tip=isEquipped?'点击卸下':'点击装备';
      return `<span title="${it.name}: ${it.desc}\n${tip}" style="cursor:pointer;opacity:${opacity};border:${border};border-radius:10px;padding:2px 6px;display:inline-block;" onclick="${action}">${it.emoji}${label}</span>`;
    }).join('');
  }else{dl.innerHTML='<span style="font-size:14px;color:#8892B0;">还没有装备，去补给站看看</span>';}
  // 装备效果汇总
  renderDecoEffectSummary();
};

window.getDecoEffectDesc = function(item){
  if(!item||!item.passive)return '';
  const p=item.passive;
  if(p.coinBonus)return '💰 金币+'+Math.round(p.coinBonus*100)+'%';
  if(p.growthBonus)return '📈 答对成长+'+p.growthBonus;
  if(p.hungerDecayReduce)return '🍖 饱食衰减-'+Math.round(p.hungerDecayReduce*100)+'%';
  if(p.wrongGrowth)return '🔭 答错也+'+p.wrongGrowth+'成长';
  if(p.moodBonus)return '⚡ 答对战斗力+'+p.moodBonus;
  return '';
};

window.renderDecoEffectSummary = function(){
  let el=document.getElementById('deco-effect-summary');
  if(!el){
    el=document.createElement('div');el.id='deco-effect-summary';
    const dl=document.getElementById('pet-deco-list');
    dl.parentNode.insertBefore(el,dl.nextSibling);
  }
  const equipped=G.pet.decos||[];
  if(equipped.length===0){
    el.innerHTML='<div style="text-align:center;font-size:12px;color:#8892B0;padding:8px;">暂无装备效果生效</div>';
    return;
  }
  const effects=equipped.map(did=>{
    const it=SHOP_ITEMS.deco.find(x=>x.id===did);
    if(!it)return '';
    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;"><span style="font-size:16px;">${it.emoji}</span><span style="color:#C8D0E0;font-size:12px;">${it.name}</span><span style="color:#00E676;font-size:12px;font-weight:700;margin-left:auto;">${getDecoEffectDesc(it)}</span></div>`;
  }).filter(Boolean).join('');
  el.innerHTML=`<div style="margin-top:10px;padding:10px;background:rgba(0,230,118,.06);border:1px solid rgba(0,230,118,.15);border-radius:10px;"><div style="font-size:12px;color:#00E676;font-weight:700;margin-bottom:6px;">⚡ 当前生效效果</div>${effects}</div>`;
};

window.equipDeco = function(did){
  if(!G.pet.decos.includes(did)){G.pet.decos.push(did);}
  saveGame();renderPetHouse();
  const it=SHOP_ITEMS.deco.find(x=>x.id===did);
  const eff=it?getDecoEffectDesc(it):'';
  showToast('已装备'+(it?it.name:'')+(eff?(' → '+eff):''),true);
  setTimeout(checkAchievements,500);
};

window.unequipDeco = function(did){
  const it=SHOP_ITEMS.deco.find(x=>x.id===did);
  const eff=it?getDecoEffectDesc(it):'';
  G.pet.decos=G.pet.decos.filter(d=>d!==did);
  saveGame();renderPetHouse();
  showToast('已卸下'+(it?it.name:'')+(eff?(' → 失去 '+eff):''));
};

window.petSpeak = function(){
  const speech=getPetSpeech();speak(speech);
  const old=document.querySelector('.floating-speech');if(old)old.remove();
  const b=document.createElement('div');b.className='floating-speech';
  b.style.cssText='position:fixed;bottom:70px;right:70px;background:rgba(22,33,62,.95);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:8px 14px;font-size:13px;box-shadow:0 2px 12px rgba(0,0,0,.3);z-index:102;animation:fadeInUp .3s;max-width:180px;color:#E8E8F0;';
  b.textContent=speech;document.body.appendChild(b);setTimeout(()=>b.remove(),3000);
  document.getElementById('pet-menu').classList.remove('show');
};
window.togglePetMenu = function(){document.getElementById('pet-menu').classList.toggle('show');};

// ==================== 商店渲染 ====================
window.currentShopTab = 'food';
window.renderShop = function(tab){
  currentShopTab=tab||currentShopTab;
  document.getElementById('shop-points').textContent=G.points;
  document.getElementById('shop-tabs').innerHTML=`
    <div class="shop-tab ${currentShopTab==='food'?'active':''}" onclick="renderShop('food')">🍖 补给品</div>
    <div class="shop-tab ${currentShopTab==='toy'?'active':''}" onclick="renderShop('toy')">⚡ 训练器</div>
    <div class="shop-tab ${currentShopTab==='deco'?'active':''}" onclick="renderShop('deco')">🛡️ 装备</div>`;
  const items=SHOP_ITEMS[currentShopTab];
  let html='';
  items.forEach(item=>{
    const canBuy=G.points>=item.price;
    const levelLock=item.reqLevel&&G.pet.level<item.reqLevel;
    const owned=currentShopTab==='deco'&&(G.inventory.deco&&G.inventory.deco[item.id]);
    const equipped=currentShopTab==='deco'&&G.pet.decos.includes(item.id);
    const cantBuy=!canBuy||levelLock||owned;
    let lockText='',bonusText='';
    if(equipped)lockText='✅ 已装备';
    else if(owned)lockText='📦 已拥有（去基地装备）';
    else if(levelLock)lockText=`🔒 需要Lv.${item.reqLevel}`;
    else if(!canBuy)lockText='💰 积分不足';
    // 显示宠物类型加成
    if(currentShopTab==='food'&&item.fav===G.pet.type)bonusText='💖 最爱(×1.5)';
    if(currentShopTab==='toy'&&item.petBonus&&item.petBonus[G.pet.type])bonusText='💖 额外+'+item.petBonus[G.pet.type]+'成长';
    html+=`<div class="shop-item ${cantBuy?'cant-buy':''}" onclick="${cantBuy?'':`buyItem('${currentShopTab}','${item.id}')`}">
      <div class="shop-item-emoji">${item.emoji}</div><div class="shop-item-name">${item.name}</div>
      <div class="shop-item-price">💰 ${item.price}</div><div class="shop-item-desc">${item.desc}</div>
      ${bonusText?`<div class="shop-item-bonus">${bonusText}</div>`:''}
      ${lockText?`<div class="shop-item-lock">${lockText}</div>`:''}</div>`;
  });
  document.getElementById('shop-grid').innerHTML=html;
};

window.buyItem = function(cat,itemId){
  const item=SHOP_ITEMS[cat].find(i=>i.id===itemId);
  if(!item||G.points<item.price)return;
  playClickSound();G.points-=item.price;
  if(cat==='food'){feedPet(item);showToast(`${G.pet.name}补充了${item.name}！`,true);}
  else if(cat==='toy'){playWithPet(item);showToast(`${G.pet.name}使用${item.name}训练！`,true);}
  else if(cat==='deco'){if(!G.inventory.deco[item.id])G.inventory.deco[item.id]=true;G.pet.decos.push(item.id);showToast(`${G.pet.name}装备了${item.name}！`,true);}
  saveGame();renderShop();
};
