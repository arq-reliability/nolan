let scores=JSON.parse(localStorage.getItem('nolanScores'))||{player1:0,player2:0};
let names=JSON.parse(localStorage.getItem('nolanNames'))||{player1:'Player 1',player2:'Player 2'};
let bestScore=Number(localStorage.getItem('nolanBestScore')||0);

function hideAll(){
  startScreen.style.display='none';
  gameScreen.style.display='none';
  endScreen.style.display='none';
  historyScreen.style.display='none';
}

function vehicle(type){
  const lane=document.getElementById('animationLane');
  const police=type==='police';
  lane.innerHTML=`<div class="vehicle ${police?'police':'nolan-truck'}"><div class="${police?'light':''}"></div><div class="truck-cab"></div><div class="truck-body">${police?'DEXTER':'NOLAN'}</div><div class="wheel w1"></div><div class="wheel w2"></div></div>`;
  setTimeout(()=>lane.innerHTML='',1900);
}

function beep(kind){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const gain=ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value=.08;
    if(kind==='horn'){
      [0,.16].forEach((delay)=>{
        const osc=ctx.createOscillator();
        osc.type='square';
        osc.frequency.value=220;
        osc.connect(gain);
        osc.start(ctx.currentTime+delay);
        osc.stop(ctx.currentTime+delay+.11);
      });
    }else{
      [520,780,520,780].forEach((freq,i)=>{
        const osc=ctx.createOscillator();
        osc.type='sawtooth';
        osc.frequency.value=freq;
        osc.connect(gain);
        osc.start(ctx.currentTime+i*.12);
        osc.stop(ctx.currentTime+i*.12+.1);
      });
    }
    setTimeout(()=>ctx.close(),800);
  }catch(e){}
}

function floatScore(player,text,cls){
  const card=document.getElementById(`player${player}Card`);
  if(!card)return;
  const el=document.createElement('div');
  el.className=`float-score ${cls}`;
  el.textContent=text;
  card.appendChild(el);
  setTimeout(()=>el.remove(),1000);
}

function startGame(reset){
  names.player1=player1Name.value||'Player 1';
  names.player2=player2Name.value||'Player 2';
  if(reset){scores={player1:0,player2:0};}
  localStorage.setItem('nolanNames',JSON.stringify(names));
  saveScores();
  hideAll();
  gameScreen.style.display='block';
  render();
}

function addPoint(player){
  scores[`player${player}`]+=1;
  vehicle('truck');
  beep('horn');
  floatScore(player,'+1','plus');
  saveScores();
}

function badCall(player){
  scores[`player${player}`]-=10;
  vehicle('police');
  beep('siren');
  floatScore(player,'-10','minus');
  saveScores();
}

function endGame(){
  const history=JSON.parse(localStorage.getItem('nolanHistory'))||[];
  const winner=scores.player1===scores.player2?'Draw':scores.player1>scores.player2?names.player1:names.player2;
  history.unshift({
    date:new Date().toLocaleString(),
    player1Name:names.player1,
    player1Score:scores.player1,
    player2Name:names.player2,
    player2Score:scores.player2,
    winner:winner
  });
  localStorage.setItem('nolanHistory',JSON.stringify(history.slice(0,25)));
  updateBestScore();
  hideAll();
  endScreen.style.display='block';
  finalScore.textContent=`${names.player1}: ${scores.player1} | ${names.player2}: ${scores.player2} | Winner: ${winner}`;
  render();
}

function showStart(){
  hideAll();
  startScreen.style.display='block';
  player1Name.value=names.player1;
  player2Name.value=names.player2;
  render();
}

function showHistory(){
  const history=JSON.parse(localStorage.getItem('nolanHistory'))||[];
  hideAll();
  historyScreen.style.display='block';
  if(!history.length){
    historyList.innerHTML='<p class="subtitle">No completed games yet.</p>';
    return;
  }
  historyList.innerHTML=history.map(game=>`<div class="history-item"><strong>${game.date}</strong><br>${game.player1Name}: ${game.player1Score}<br>${game.player2Name}: ${game.player2Score}<br><strong>Winner: ${game.winner}</strong></div>`).join('');
}

function updateBestScore(){
  const currentBest=Math.max(scores.player1,scores.player2,bestScore);
  if(currentBest>bestScore){
    bestScore=currentBest;
    localStorage.setItem('nolanBestScore',String(bestScore));
  }
}

function saveScores(){
  localStorage.setItem('nolanScores',JSON.stringify(scores));
  updateBestScore();
  render();
}

function leaderText(){
  if(scores.player1===scores.player2)return 'Current Leader: Draw';
  const leader=scores.player1>scores.player2?names.player1:names.player2;
  const lead=Math.abs(scores.player1-scores.player2);
  return `Current Leader: ${leader} (+${lead})`;
}

function render(){
  if(window.p1Label){
    p1Label.textContent=names.player1;
    p2Label.textContent=names.player2;
    score1.textContent=scores.player1;
    score2.textContent=scores.player2;
  }
  if(window.leaderBanner)leaderBanner.textContent=leaderText();
  const bestText=`Best Ever Score: ${bestScore}`;
  if(window.bestScoreStart)bestScoreStart.textContent=bestText;
  if(window.bestScoreGame)bestScoreGame.textContent=bestText;
  if(window.bestScoreEnd)bestScoreEnd.textContent=bestText;
}

showStart();
