// ==================== 账号系统 ====================
window.doLogin = function(){
  const user=document.getElementById('login-user').value.trim();
  const pass=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');
  if(!user||!pass){err.textContent='请输入账号和密码';return;}
  const accs=getAccounts();
  if(!accs[user]){err.textContent='账号不存在';return;}
  if(accs[user].password!==pass){err.textContent='密码错误';return;}
  err.textContent='';
  currentUser=user;
  localStorage.setItem(CUR_USER_KEY,user);
  loadUserGame();
  showScreen('welcome');
  showToast('欢迎回来，'+user+'！',true);
};

window.doRegister = function(){
  const user=document.getElementById('reg-user').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const pass2=document.getElementById('reg-pass2').value;
  const err=document.getElementById('reg-error');
  if(!user||!pass){err.textContent='请填写完整信息';return;}
  if(user.length<2||user.length>12){err.textContent='账号需2-12个字符';return;}
  if(pass.length<3){err.textContent='密码至少3位';return;}
  if(pass!==pass2){err.textContent='两次密码不一致';return;}
  const accs=getAccounts();
  if(accs[user]){err.textContent='账号已存在';return;}
  accs[user]={password:pass};
  saveAccounts(accs);
  err.textContent='';
  currentUser=user;
  localStorage.setItem(CUR_USER_KEY,user);
  G=defaultG();
  saveGame();
  showScreen('welcome');
  showToast('注册成功！',true);
};

window.doLogout = function(){
  currentUser=null;
  localStorage.removeItem(CUR_USER_KEY);
  G=defaultG();
  document.getElementById('login-user').value='';
  document.getElementById('login-pass').value='';
  showScreen('login');
};

// ==================== 用户信息面板 ====================
window.openUserPanel = function(){
  if(!currentUser)return;
  document.getElementById('up-username').textContent=currentUser;
  // 填充年级下拉框
  const gradeEl=document.getElementById('up-grade');
  gradeEl.innerHTML=GRADE_OPTIONS.map(g=>'<option value="'+g.id+'"'+(g.id===G.gradeId?' selected':'')+'>'+g.label+'</option>').join('');
  // 填充教材版本下拉框
  const tbEl=document.getElementById('up-textbook');
  tbEl.innerHTML=TEXTBOOK_OPTIONS.map(t=>'<option value="'+t.id+'"'+(t.id===G.textbookId?' selected':'')+'>'+t.label+'</option>').join('');
  document.getElementById('up-old-pass').value='';
  document.getElementById('up-new-pass').value='';
  document.getElementById('up-new-pass2').value='';
  document.getElementById('up-pwd-msg').textContent='';
  document.getElementById('up-pwd-msg').className='up-msg';
  document.getElementById('user-panel-overlay').style.display='flex';
};
window.closeUserPanel = function(){
  document.getElementById('user-panel-overlay').style.display='none';
};
window.saveGradeTextbook = function(){
  const newGrade=document.getElementById('up-grade').value;
  const newTb=document.getElementById('up-textbook').value;
  if(newGrade!==G.gradeId||newTb!==G.textbookId){
    G.gradeId=newGrade;
    G.textbookId=newTb;
    loadGradeData();
    saveGame();
    showToast('年级/教材已更新',true);
    closeUserPanel();
    showScreen('map');
  }
};
window.changePassword = function(){
  const msgEl=document.getElementById('up-pwd-msg');
  const oldP=document.getElementById('up-old-pass').value;
  const newP=document.getElementById('up-new-pass').value;
  const newP2=document.getElementById('up-new-pass2').value;
  msgEl.className='up-msg';
  if(!oldP){msgEl.textContent='请输入当前密码';msgEl.classList.add('err');return;}
  const accs=getAccounts();
  if(!accs[currentUser]||accs[currentUser].password!==oldP){msgEl.textContent='当前密码错误';msgEl.classList.add('err');return;}
  if(newP.length<3){msgEl.textContent='新密码至少3位';msgEl.classList.add('err');return;}
  if(newP!==newP2){msgEl.textContent='两次新密码不一致';msgEl.classList.add('err');return;}
  if(newP===oldP){msgEl.textContent='新密码不能与旧密码相同';msgEl.classList.add('err');return;}
  accs[currentUser].password=newP;
  saveAccounts(accs);
  msgEl.textContent='密码修改成功！';msgEl.classList.add('ok');
  document.getElementById('up-old-pass').value='';
  document.getElementById('up-new-pass').value='';
  document.getElementById('up-new-pass2').value='';
  setTimeout(()=>{msgEl.textContent='';},2000);
};
