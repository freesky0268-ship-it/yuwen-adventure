// ==================== 主入口文件 ====================
// 导入样式
import './styles/index.css';

// 导入数据层（必须先于其他模块）
import './data/questions.js';
import './data/config.js';

// 导入核心层
import './core/state.js';
import './core/audio.js';
import './core/storage.js';
import './core/ui.js';

// 导入功能模块
import './modules/auth.js';
import './modules/pet.js';
import './modules/map.js';
import './modules/quiz.js';
import './modules/textbook.js';
import './modules/readaloud.js';
import './modules/training.js';
import './modules/achievements.js';
import './modules/gameflow.js';

// ==================== 初始化 ====================
function init(){
  const savedUser=localStorage.getItem(CUR_USER_KEY);
  if(savedUser){
    const accs=getAccounts();
    if(accs[savedUser]){
      currentUser=savedUser;
      loadUserGame();
      showScreen('welcome');
      return;
    }
  }
  showScreen('login');
}

window.addEventListener('DOMContentLoaded',()=>{
  init();

  // 拖拽上传支持
  const zone=document.getElementById('upload-zone');
  if(zone){
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging');});
    zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));
    zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');if(e.dataTransfer.files[0])handleUpload(e.dataTransfer.files[0]);});
  }
});

document.addEventListener('click',e=>{
  if(!e.target.closest('.floating-pet')&&!e.target.closest('.pet-menu'))
    document.getElementById('pet-menu').classList.remove('show');
});
