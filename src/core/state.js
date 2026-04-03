// ==================== 游戏状态 ====================
window.ACCOUNTS_KEY = 'ywdmx_accounts';
window.CUR_USER_KEY = 'ywdmx_curuser';
window.currentUser = null;
window.currentQuestions = [];
window.currentLevels = [];

window.G = {
  started:false,
  gradeId:'',textbookId:'',
  pet:{type:'',name:'',hunger:80,mood:80,level:1,growth:0,intimacy:0,decos:[]},
  stars:0,points:0,
  levelStars:[],completedLevels:0,
  inventory:{food:{},toy:{},deco:{}},
  stats:{word:{correct:0,total:0},sentence:{correct:0,total:0},reading:{correct:0,total:0},poetry:{correct:0,total:0}},
  wrongBook:[],
  achievements:[],maxStreak:0,dailyChallengeDone:null,
  totalTime:0,lastLogin:null,consecutiveDays:0,todayLearned:false,treasureReady:false
};

window.quizState = {levelIndex:0,questions:[],currentQ:0,correct:0,streak:0,wrongStreak:0,answered:false,startTime:0,isCustom:false};
window.settings = {sound:true,tts:true};
window.selectedPetType = '';
window.selectedGradeId = '';
window.selectedTextbookId = '';
window.uploadWrongTypes = {word:0,sentence:0,reading:0,poetry:0};

window.defaultG = function(){
  return {started:false,gradeId:'',textbookId:'',
    pet:{type:'',name:'',hunger:80,mood:80,level:1,growth:0,intimacy:0,decos:[]},
    stars:0,points:0,levelStars:[],completedLevels:0,
    inventory:{food:{},toy:{},deco:{}},
    stats:{word:{correct:0,total:0},sentence:{correct:0,total:0},reading:{correct:0,total:0},poetry:{correct:0,total:0}},
    wrongBook:[],
    achievements:[],maxStreak:0,dailyChallengeDone:null,
    totalTime:0,lastLogin:null,consecutiveDays:0,todayLearned:false,treasureReady:false};
};
