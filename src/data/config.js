// ==================== 关卡配置 ====================
window.LEVELS_3_2 = [
  {name:'字词兵营（一）',desc:'生字认读突击战',icon:'⚔️',theme:'#00E676'},
  {name:'字词兵营（二）',desc:'词语搭配格斗场',icon:'🗡️',theme:'#00C853'},
  {name:'成语堡垒',desc:'成语理解攻防战',icon:'🏰',theme:'#FFD700'},
  {name:'造句熔炉',desc:'造句锻造大师',icon:'🔨',theme:'#FF6B35'},
  {name:'修辞战塔',desc:'修辞手法识别赛',icon:'🗼',theme:'#00D4FF'},
  {name:'句式机甲库',desc:'句式转换装配线',icon:'⚙️',theme:'#FF4500'},
  {name:'阅读峡谷（一）',desc:'课文理解探险队',icon:'🏜️',theme:'#8892B0'},
  {name:'阅读峡谷（二）',desc:'段落概括攻坚战',icon:'🌋',theme:'#FF6B35'},
  {name:'情感风暴眼',desc:'情感态度感悟营',icon:'🌪️',theme:'#00D4FF'},
  {name:'古诗擂台（一）',desc:'诗句补全对决赛',icon:'🥋',theme:'#FF4757'},
  {name:'古诗擂台（二）',desc:'诗意理解终极战',icon:'🐉',theme:'#FFD700'},
  {name:'终极Boss战',desc:'全面大决战！',icon:'👑',theme:'#FF6B35'}
];

// ==================== 年级题库映射 ====================
window.GRADE_OPTIONS = [
  {id:'1_1',label:'一年级上册'},{id:'1_2',label:'一年级下册'},
  {id:'2_1',label:'二年级上册'},{id:'2_2',label:'二年级下册'},
  {id:'3_1',label:'三年级上册'},{id:'3_2',label:'三年级下册'},
  {id:'4_1',label:'四年级上册'},{id:'4_2',label:'四年级下册'},
  {id:'5_1',label:'五年级上册'},{id:'5_2',label:'五年级下册'},
  {id:'6_1',label:'六年级上册'},{id:'6_2',label:'六年级下册'},
];
window.TEXTBOOK_OPTIONS = [
  {id:'renj',label:'人教版'}
];
window.QUESTION_BANKS = {'3_2_renj': QUESTIONS_3_2};
window.LEVEL_BANKS = {'3_2_renj': LEVELS_3_2};
window.getGradeLabel = function(gid){ const g=GRADE_OPTIONS.find(x=>x.id===gid); return g?g.label:''; };
window.getTextbookLabel = function(tid){ const t=TEXTBOOK_OPTIONS.find(x=>x.id===tid); return t?t.label:''; };

// ==================== 成就系统定义 ====================
window.ACHIEVEMENTS = [
  {id:'first_blood',name:'初战告捷',desc:'完成第一个关卡',icon:'🎖️'},
  {id:'three_star',name:'完美三星',desc:'任意关卡获得三星',icon:'⭐'},
  {id:'five_clear',name:'五关斩将',desc:'通过5个关卡',icon:'⚔️'},
  {id:'all_clear',name:'全面制霸',desc:'通过所有12关',icon:'👑'},
  {id:'coin_100',name:'小富翁',desc:'持有100积分',icon:'💰'},
  {id:'coin_500',name:'大富翁',desc:'持有500积分',icon:'💎'},
  {id:'streak_5',name:'五连击',desc:'单次连续答对5题',icon:'🔥'},
  {id:'streak_10',name:'十连杀',desc:'单次连续答对10题',icon:'💥'},
  {id:'pet_lv5',name:'伙伴进阶',desc:'伙伴达到Lv.5',icon:'🐾'},
  {id:'pet_lv10',name:'传奇搭档',desc:'伙伴达到Lv.10',icon:'🌟'},
  {id:'wrong_master',name:'知错能改',desc:'从错题本掌握10道题',icon:'📕'},
  {id:'days_7',name:'七日征途',desc:'连续登录7天',icon:'📅'},
  {id:'accuracy_90',name:'神射手',desc:'总正确率达90%（至少20题）',icon:'🎯'},
  {id:'total_100',name:'百题勇士',desc:'累计答题100道',icon:'💯'},
  {id:'equip_3',name:'武装到牙齿',desc:'同时装备3件装备',icon:'🛡️'}
];

// ==================== 商店物品（含被动效果） ====================
window.SHOP_ITEMS = {
  food:[
    {id:'carrot',name:'能量草料',emoji:'🥕',price:10,hunger:15,mood:0,growth:0,fav:'wolf',desc:'+15饱食度 · 战狼最爱(×1.5)'},
    {id:'fish',name:'鲜鱼补给',emoji:'🐟',price:10,hunger:15,mood:0,growth:0,fav:'eagle',desc:'+15饱食度 · 神鹰最爱(×1.5)'},
    {id:'bone',name:'肉骨头',emoji:'🍖',price:10,hunger:15,mood:0,growth:0,fav:'lion',desc:'+15饱食度 · 狮王最爱(×1.5)'},
    {id:'cake',name:'战斗蛋糕',emoji:'🍰',price:30,hunger:30,mood:10,growth:2,fav:'all',desc:'+30饱食 +10战斗力 +2成长'},
    {id:'icecream',name:'极寒冰淇淋',emoji:'🍦',price:50,hunger:40,mood:20,growth:3,fav:'all',desc:'+40饱食 +20战斗力 +3成长'},
    {id:'meal',name:'传奇大餐',emoji:'🍱',price:80,hunger:60,mood:15,growth:8,fav:'all',desc:'+60饱食 +15战斗力 +8成长',reqLevel:3}
  ],
  toy:[
    {id:'ball',name:'训练球',emoji:'⚽',price:20,hunger:0,mood:15,growth:2,desc:'+15战斗力 +2成长',petBonus:{wolf:3}},
    {id:'doll',name:'沙袋靶',emoji:'🥊',price:40,hunger:0,mood:25,growth:3,desc:'+25战斗力 +3成长',petBonus:{lion:5}},
    {id:'book',name:'兵法秘籍',emoji:'📖',price:30,hunger:0,mood:10,growth:8,desc:'+10战斗力 +8成长',petBonus:{eagle:5}},
    {id:'musicbox',name:'战鼓',emoji:'🥁',price:60,hunger:0,mood:35,growth:5,desc:'+35战斗力 +5成长 播放音乐',reqLevel:4}
  ],
  deco:[
    {id:'medal',name:'铜质勋章',emoji:'🏅',price:50,reqLevel:1,desc:'装备后答题金币+10%',
     passive:{coinBonus:0.10}},
    {id:'sword',name:'短剑徽章',emoji:'⚔️',price:80,reqLevel:3,desc:'装备后每题额外+1成长值',
     passive:{growthBonus:1}},
    {id:'helmet',name:'战术头盔',emoji:'🪖',price:100,reqLevel:5,desc:'装备后饱食度衰减速度-25%',
     passive:{hungerDecayReduce:0.25}},
    {id:'scope',name:'侦察镜',emoji:'🔭',price:120,reqLevel:7,desc:'装备后答错时也获得1成长值',
     passive:{wrongGrowth:1}},
    {id:'shield',name:'守护战盾',emoji:'🛡️',price:150,reqLevel:10,desc:'装备后每答对+2战斗力',
     passive:{moodBonus:2}}
  ]
};

// ==================== 宠物配置 ====================
window.PET_CONFIG = {
  lion:{emoji:'🦁',name:'烈焰狮王',favFood:'bone',perk:'coin',perkDesc:'金币加成+15%'},
  wolf:{emoji:'🐺',name:'暗影战狼',favFood:'carrot',perk:'growth',perkDesc:'成长速度+20%'},
  eagle:{emoji:'🦅',name:'苍穹神鹰',favFood:'fish',perk:'intimacy',perkDesc:'默契度提升+50%'}
};

// 升级阈值：Lv1=0, Lv2=20, Lv3=50, ...
window.LEVEL_THRESHOLDS = [0,20,50,100,170,260,370,500,660,850];
