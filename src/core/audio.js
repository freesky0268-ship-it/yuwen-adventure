// ==================== 音效系统 ====================
let audioCtx;
function getAudioCtx(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
window.playTone = function(freq,dur,type='sine',vol=0.15){
  if(!settings.sound)return;
  try{const ctx=getAudioCtx();const o=ctx.createOscillator();const g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);}catch(e){}
};
window.playCorrectSound = function(){playTone(523,.15);setTimeout(()=>playTone(659,.15),100);setTimeout(()=>playTone(784,.25),200);};
window.playWrongSound = function(){playTone(330,.3,'sine',.1);setTimeout(()=>playTone(294,.4,'sine',.08),150);};
window.playWinSound = function(){[523,587,659,784,880,1047].forEach((n,i)=>setTimeout(()=>playTone(n,.2,'sine',.12),i*120));};
window.playClickSound = function(){playTone(880,.08,'sine',.06);};
window.playLevelUpSound = function(){[784,988,1175,1319,1568].forEach((n,i)=>setTimeout(()=>playTone(n,.3,'triangle',.1),i*150));};
window.playMusicBox = function(){[523,587,659,784,659,587,523,784,880,784,659,523].forEach((n,i)=>setTimeout(()=>playTone(n,.25,'triangle',.08),i*250));};

// ==================== TTS ====================
window.speak = function(text,cb){
  if(!settings.tts){if(cb)cb();return;}
  try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=0.9;u.pitch=1.1;if(cb)u.onend=cb;window.speechSynthesis.speak(u);}catch(e){if(cb)cb();}
};
window.speakQuestion = function(){const q=quizState.questions[quizState.currentQ];if(q)speak(q.q);};
window.speakExplain = function(){
  const q=quizState.questions[quizState.currentQ];
  if(q)speak('正确答案是'+q.opts[q.ans]+'。'+q.explain);
};
