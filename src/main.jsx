import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, BookOpen, Check, Clock3, Flame, Globe2,
  Heart, Home, Lightbulb, ListOrdered, Map, RotateCcw, Star, Trophy, X, Zap
} from "lucide-react";
import "./styles.css";

const STATES = [
["Andhra Pradesh","Amaravati","Home to ancient rock-cut caves and the temple town of Tirupati."],
["Arunachal Pradesh","Itanagar","Called the 'Land of the Dawn-Lit Mountains' — sunrise reaches here first in India."],
["Assam","Dispur","Famous for one-horned rhinos in Kaziranga National Park and its tea gardens."],
["Bihar","Patna","Where Lord Buddha is believed to have attained enlightenment, in Bodh Gaya."],
["Chhattisgarh","Raipur","Known for lush forests, waterfalls, and rich tribal culture."],
["Goa","Panaji","India's smallest state, famous for its beaches and old Portuguese churches."],
["Gujarat","Gandhinagar","Birthplace of Mahatma Gandhi and home to the white salt desert, the Rann of Kutch."],
["Haryana","Chandigarh","Shares its capital, Chandigarh, with Punjab — a planned city designed by Le Corbusier."],
["Himachal Pradesh","Shimla","A Himalayan state loved for snowy hill stations like Manali and Shimla."],
["Jharkhand","Ranchi","Rich in minerals and forests, home to Betla National Park."],
["Karnataka","Bengaluru","Home to India's tech hub Bengaluru and the ancient ruins of Hampi."],
["Kerala","Thiruvananthapuram","Known as 'God's Own Country' for its backwaters, beaches and spices."],
["Madhya Pradesh","Bhopal","Home to some of India's biggest tiger parks, like Kanha and Bandhavgarh."],
["Maharashtra","Mumbai","Home to Mumbai, India's financial capital and the Bollywood film industry."],
["Manipur","Imphal","Known for Loktak Lake, famous for its floating islands called phumdis."],
["Meghalaya","Shillong","One of the wettest places on Earth, famous for living root bridges."],
["Mizoram","Aizawl","A hilly state known for bamboo forests and the colourful Chapchar Kut festival."],
["Nagaland","Kohima","Famous for the Hornbill Festival celebrating its many tribal cultures."],
["Odisha","Bhubaneswar","Home to the Sun Temple at Konark and the Jagannath Temple in Puri."],
["Punjab","Chandigarh","The 'Land of Five Rivers,' known for golden wheat fields and the Golden Temple."],
["Rajasthan","Jaipur","India's largest state, famous for desert forts, palaces and camel safaris."],
["Sikkim","Gangtok","A tiny Himalayan state near Kanchenjunga, India's highest peak."],
["Tamil Nadu","Chennai","Known for ancient temples like the Meenakshi Temple and Bharatanatyam dance."],
["Telangana","Hyderabad","Home to Hyderabad's Charminar and famous for its biryani."],
["Tripura","Agartala","Known for Neermahal, a unique palace built in the middle of a lake."],
["Uttar Pradesh","Lucknow","Home to the Taj Mahal, one of the Seven Wonders of the World."],
["Uttarakhand","Dehradun","Called the 'Land of Gods,' home to Himalayan pilgrimage sites."],
["West Bengal","Kolkata","Home to Kolkata and the Sundarbans, home of the Royal Bengal Tiger."]
];

const UNION_TERRITORIES = [
["Andaman and Nicobar Islands","Port Blair","A cluster of islands in the Bay of Bengal, famous for coral reefs and the Cellular Jail."],
["Chandigarh","Chandigarh","A carefully planned city designed by Le Corbusier — and a UT in its own right."],
["Dadra and Nagar Haveli and Daman and Diu","Daman","A coastal UT with Portuguese-era forts, churches and beaches."],
["Delhi","New Delhi","India's national capital territory, home to the Red Fort and India Gate."],
["Jammu and Kashmir","Srinagar","Known for the Dal Lake and houseboats in its summer capital, Srinagar."],
["Ladakh","Leh","A high-altitude Himalayan UT famous for ancient monasteries and dramatic mountain passes."],
["Lakshadweep","Kavaratti","India's smallest union territory, a group of coral islands in the Arabian Sea."],
["Puducherry","Puducherry","A former French colony loved for its seaside promenade and colourful streets."]
];

const ALL_REGIONS = [...STATES, ...UNION_TERRITORIES];

const SHARED_CAPITALS = new Set((()=>{
  const counts = {};
  ALL_REGIONS.forEach(([,capital])=>{ counts[capital]=(counts[capital]||0)+1; });
  return Object.keys(counts).filter(c=>counts[c]>1);
})());

const AVATARS = ["🦁","🐯","🦊","🐼","🦄","🐵","🐸","🦋"];

const PRAISE = ["Nice one!","Great job!","You got it!","Brilliant!","Fantastic!","Capital pro!"];
const WRONG = ["Almost!","Good try!","So close!","Keep going!"];

// Easy mode only draws from these well-known states/UTs, so a beginner isn't
// quizzed on ones a class 3 student is unlikely to have heard of yet.
const EASY_STATE_NAMES = new Set([
  "Maharashtra","Gujarat","Rajasthan","Punjab","Kerala","Tamil Nadu","Karnataka",
  "West Bengal","Uttar Pradesh","Bihar","Madhya Pradesh","Goa","Haryana","Telangana","Delhi"
]);

function shuffle(a){ return [...a].sort(() => Math.random() - 0.5); }

function buildQuestion(pair, index, {hard=false, pool=ALL_REGIONS}={}) {
  const [state, capital, fact] = pair;
  // A handful of capitals are shared (e.g. Chandigarh is the capital of Haryana,
  // Punjab and is itself a UT), so those can only be asked capital-first to avoid
  // a question with more than one correct answer.
  const askState = SHARED_CAPITALS.has(capital) || Math.random() < 0.68;
  const answer = askState ? capital : state;
  let candidates = pool.filter(x => x[0] !== state && x[1] !== capital);
  if (hard) {
    // Challenge mode favours look-alike distractors (same first letter) to make guessing harder.
    const firstLetter = answer[0];
    const sameLetter = candidates.filter(x => (askState ? x[1] : x[0])[0] === firstLetter);
    const rest = candidates.filter(x => !sameLetter.includes(x));
    candidates = [...shuffle(sameLetter), ...shuffle(rest)];
  } else {
    candidates = shuffle(candidates);
  }
  const seen = new Set([answer]);
  const distractors = [];
  for (const x of candidates) {
    const val = askState ? x[1] : x[0];
    if (seen.has(val)) continue;
    seen.add(val);
    distractors.push(val);
    if (distractors.length === 3) break;
  }
  return {
    id: `${index}-${state}`,
    prompt: askState ? `What is the capital of ${state}?` : `${capital} is the capital of which state or union territory?`,
    answer, askState, state, capital, fact,
    options: shuffle([answer, ...distractors])
  };
}

function makeQuiz(count=15, difficulty="medium") {
  const easyPool = ALL_REGIONS.filter(s => EASY_STATE_NAMES.has(s[0]));
  const pool = difficulty==="easy" ? easyPool : ALL_REGIONS;
  const hard = difficulty==="hard";
  return shuffle(pool).slice(0,count).map((p,i)=>buildQuestion(p,i,{hard,pool}));
}

function trophy(score, total, outOfLives) {
  if (outOfLives) return {name:"Brave Attempt", icon:"💪", msg:"You ran out of lives, but every round makes you sharper. Try again!"};
  const pct = total ? Math.round(score / total * 100) : 0;
  if (pct === 100) return {name:"India Geography Master", icon:"👑", msg:"Perfect score! You know India like a map wizard."};
  if (pct >= 90) return {name:"Capital Champion", icon:"🏆", msg:"Outstanding! Your capital knowledge is seriously impressive."};
  if (pct >= 75) return {name:"India Explorer", icon:"🥇", msg:"Excellent work! A few more rounds and you'll be unstoppable."};
  if (pct >= 60) return {name:"State Scout", icon:"🥈", msg:"Well done! You're building a strong India map in your head."};
  return {name:"Curious Explorer", icon:"🥉", msg:"Great start! Play again and watch your score climb."};
}
const PRACTICE_AWARD = {name:"Practice Complete!", icon:"📚", msg:"Great job reviewing! Keep practicing to master every state."};

let audioCtx;
function getAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function beep(freq, duration, type="sine", delay=0){
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + duration + 0.02);
}
function playCorrectSound(){ try{ beep(523.25,0.12); beep(783.99,0.16,"sine",0.1); }catch(e){} }
function playWrongSound(){ try{ beep(220,0.24,"sawtooth"); }catch(e){} }

// --- Local progress + leaderboard (all data stays in this browser) ---
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem("icq-progress")||"{}"); }catch(e){ return {}; }
}
function recordProgress(state, correct){
  const p = loadProgress();
  const cur = p[state] || {attempts:0, correct:0};
  cur.attempts += 1;
  if(correct) cur.correct += 1;
  p[state] = cur;
  localStorage.setItem("icq-progress", JSON.stringify(p));
}
function isMastered(rec){
  return !!rec && rec.correct>=3 && (rec.correct/rec.attempts)>=0.8;
}

function loadLeaderboard(){
  try{ return JSON.parse(localStorage.getItem("icq-leaderboard")||"[]"); }catch(e){ return []; }
}
function saveLeaderboardEntry(entry){
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a,b)=> b.pct-a.pct || b.score-a.score);
  const top = list.slice(0,5);
  localStorage.setItem("icq-leaderboard", JSON.stringify(top));
  return top;
}

function Confetti(){
  const ref = useRef(null);
  useEffect(()=>{
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const colors = ["#ff7a3d","#f5b73c","#20a66a","#5b8def","#e45b5b","#a76fe0"];
    const pieces = Array.from({length:140},()=>({
      x: Math.random()*W, y: -20-Math.random()*H*0.6,
      r: 4+Math.random()*5, c: colors[Math.floor(Math.random()*colors.length)],
      speed: 2+Math.random()*3, drift: Math.random()*2-1,
      rot: Math.random()*360, spin: Math.random()*8-4
    }));
    let raf, frame = 0;
    function draw(){
      frame++;
      ctx.clearRect(0,0,W,H);
      pieces.forEach(p=>{
        p.y += p.speed; p.x += p.drift; p.rot += p.spin;
        ctx.save();
        ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
        ctx.restore();
      });
      if(frame < 170) raf = requestAnimationFrame(draw);
    }
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} className="confettiCanvas"/>;
}

function Lives({lives}){
  return <div className="lives">
    {[0,1,2].map(i=><Heart key={i} size={18} className={i<lives?"lifeFull":"lifeEmpty"} fill={i<lives?"#e45b5b":"none"}/>)}
  </div>;
}

function App(){
  const [screen,setScreen]=useState("home");
  const [difficulty,setDifficulty]=useState("medium");
  const [mode,setMode]=useState("quest");
  const [avatar,setAvatar]=useState(()=>localStorage.getItem("icq-avatar")||AVATARS[0]);
  const [playerName,setPlayerName]=useState(()=>localStorage.getItem("icq-player-name")||"");
  const [quiz,setQuiz]=useState([]);
  const [q,setQ]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [bestStreak,setBestStreak]=useState(()=>Number(localStorage.getItem("icq-best-streak")||0));
  const [showHint,setShowHint]=useState(false);
  const [time,setTime]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [sound,setSound]=useState(true);
  const [lives,setLives]=useState(3);
  const [outOfLives,setOutOfLives]=useState(false);

  const count = difficulty==="easy" ? 10 : difficulty==="medium" ? 15 : 20;
  const current = quiz[q];

  useEffect(()=>{
    if(screen!=="quiz" || selected!==null) return;
    const id=setInterval(()=>setTime(t=>t+1),1000);
    return ()=>clearInterval(id);
  },[screen,selected,q]);

  useEffect(()=>{
    if(streak>bestStreak){
      setBestStreak(streak);
      localStorage.setItem("icq-best-streak",String(streak));
    }
  },[streak,bestStreak]);

  function chooseAvatar(a){
    setAvatar(a);
    localStorage.setItem("icq-avatar",a);
  }
  function updateName(n){
    setPlayerName(n);
    localStorage.setItem("icq-player-name",n);
  }
  function start(){
    setQuiz(makeQuiz(count,difficulty)); setQ(0); setSelected(null); setScore(0); setStreak(0);
    setAnswers([]); setTime(0); setShowHint(false); setLives(3); setOutOfLives(false); setScreen("quiz");
  }
  function choose(opt){
    if(selected!==null) return;
    const correct=opt===current.answer;
    setSelected(opt);
    setAnswers(a=>[...a,{...current,selected:opt,correct}]);
    recordProgress(current.state, correct);
    if(sound) correct ? playCorrectSound() : playWrongSound();
    if(correct){ setScore(s=>s+1); setStreak(s=>s+1); }
    else{
      setStreak(0);
      if(mode==="quest"){
        const newLives = lives-1;
        setLives(newLives);
        if(newLives<=0) setOutOfLives(true);
      }
    }
  }
  function finishQuiz(){
    if(mode==="quest" && answers.length){
      saveLeaderboardEntry({
        name: playerName.trim() || "Explorer", avatar, score, total: answers.length,
        pct: Math.round(score/answers.length*100), difficulty, date: new Date().toISOString()
      });
    }
    setScreen("result");
  }
  function next(){
    if(outOfLives || q===quiz.length-1){ finishQuiz(); return; }
    setQ(x=>x+1);setSelected(null);setShowHint(false);
  }
  function quit(){setScreen("home");}

  return <div className="app">
    <div className="ambient a1"/><div className="ambient a2"/>
    {screen==="home" && <HomeScreen {...{difficulty,setDifficulty,mode,setMode,avatar,chooseAvatar,playerName,updateName,start,bestStreak,goTo:setScreen}}/>}
    {screen==="quiz" && <QuizScreen {...{current,q,quiz,score,streak,selected,choose,next,showHint,setShowHint,quit,sound,setSound,time,mode,lives,avatar,difficulty}}/>}
    {screen==="result" && <ResultScreen {...{score,answers,time,mode,outOfLives,start,avatar}}/>}
    {screen==="leaderboard" && <LeaderboardScreen onBack={()=>setScreen("home")} avatar={avatar}/>}
    {screen==="progress" && <ProgressScreen onBack={()=>setScreen("home")} avatar={avatar}/>}
  </div>
}

function Header({onBack,avatar}){
 return <header className="header">
   <button className="iconBtn" onClick={onBack} aria-label="Home"><Home size={19}/></button>
   <div className="brand"><span className="brandMark">✦</span><div><b>India Capital Quest</b><small>Learn • Play • Master</small></div></div>
   {avatar && <div className="avatarChip">{avatar}</div>}
   <div className="indiaDot">INDIA 🇮🇳</div>
 </header>
}

function HomeScreen({difficulty,setDifficulty,mode,setMode,avatar,chooseAvatar,playerName,updateName,start,bestStreak,goTo}){
 return <main className="home">
   <div className="hero">
     <div className="heroBadge"><Globe2 size={16}/> THE INDIA CHALLENGE</div>
     <h1>How well do you know<br/><span>India?</span></h1>
     <p>Learn Indian states and capitals with a fun quiz!</p>
     <div className="heroArt"><div className="mapShape">INDIA</div><div className="pin p1">📍</div><div className="pin p2">📍</div><div className="pin p3">📍</div><div className="spark s1">✦</div><div className="spark s2">✦</div></div>
   </div>
   <section className="panel">
     <h2>Who's playing?</h2>
     <input className="nameInput" value={playerName} maxLength={16} placeholder="Type your name"
       onChange={e=>updateName(e.target.value)}/>
     <div className="avatarPicker">
       {AVATARS.map(a=>
         <button key={a} className={"avatarBtn "+(avatar===a?"active":"")} onClick={()=>chooseAvatar(a)} aria-label={`Choose avatar ${a}`}>{a}</button>
       )}
     </div>
     <h2>Choose your mode</h2>
     <div className="modes">
       <button className={"modeBtn "+(mode==="quest"?"active":"")} onClick={()=>setMode("quest")}>
         <span className="levelIcon">🔥</span><span><b>Quest Mode</b><small>Score points, 3 lives</small></span>
         {mode==="quest" && <Check size={18}/>}
       </button>
       <button className={"modeBtn "+(mode==="practice"?"active":"")} onClick={()=>setMode("practice")}>
         <span className="levelIcon">📚</span><span><b>Practice Mode</b><small>No lives, just learn</small></span>
         {mode==="practice" && <Check size={18}/>}
       </button>
     </div>
     <h2>Choose your level</h2>
     <div className="levels">
       {[["easy","Easy","10 questions","15 well-known states & UTs"],["medium","Medium","15 questions",`All ${ALL_REGIONS.length} states & UTs`],["hard","Challenge","20 questions","Tricky options, no hints"]].map(([id,name,num,desc])=>
         <button key={id} className={"level "+(difficulty===id?"active":"")} onClick={()=>setDifficulty(id)}>
           <span className="levelIcon">{id==="easy"?"🌱":id==="medium"?"🔥":"⚡"}</span>
           <span><b>{name}</b><small>{num} · {desc}</small></span>
           {difficulty===id && <Check size={18}/>}
         </button>
       )}
     </div>
     <button className="startBtn" onClick={start}>Start the Quest <ArrowRight size={21}/></button>
     <div className="navRow">
       <button className="navChip" onClick={()=>goTo("progress")}><Star size={16}/> My Progress</button>
       <button className="navChip" onClick={()=>goTo("leaderboard")}><ListOrdered size={16}/> Leaderboard</button>
     </div>
     <div className="stats"><span><Trophy size={17}/> Best streak: <b>{bestStreak}</b></span><span><Map size={17}/> {ALL_REGIONS.length} states & UTs to master</span></div>
   </section>
 </main>
}

function QuizScreen({current,q,quiz,score,streak,selected,choose,next,showHint,setShowHint,quit,sound,setSound,time,mode,lives,avatar,difficulty}){
 const answered=selected!==null, correct=selected===current?.answer;
 const hintsAllowed = difficulty!=="hard";
 const mm=String(Math.floor(time/60)).padStart(2,"0"), ss=String(time%60).padStart(2,"0");
 return <main className="quiz">
   <Header onBack={quit} avatar={avatar}/>
   <div className="quizTop">
     <div><span className="eyebrow">QUESTION {q+1} OF {quiz.length}</span><div className="progress"><i style={{width:`${(q/quiz.length)*100}%`}}/></div></div>
     {mode==="quest"
       ? <div className="scorePill"><Star size={16} fill="currentColor"/> {score} pts</div>
       : <div className="practicePill">📚 Practice</div>}
     {mode==="quest" ? <Lives lives={lives}/> : <div className="timer"><Clock3 size={16}/> {mm}:{ss}</div>}
   </div>
   <div className="quizCard">
     {streak>=3 && mode==="quest" && <div className="streak"><Flame size={17}/> {streak} in a row!</div>}
     <div className="questionIcon">{current.askState ? "🏛️" : "🗺️"}</div>
     <h2>{current.prompt}</h2>
     <p className="sub">Pick one answer</p>
     <div className="options">
       {current.options.map((opt,i)=>{
         const isSel=selected===opt, isCorrect=opt===current.answer;
         let cls="option";
         if(answered && isCorrect) cls+=" right";
         else if(answered && isSel) cls+=" wrong";
         return <button key={`${current.id}-${i}`} className={cls} onClick={()=>choose(opt)}>
           <span className="letter">{String.fromCharCode(65+i)}</span><span>{opt}</span>
           {answered && isCorrect && <Check size={19}/>}
           {answered && isSel && !isCorrect && <X size={19}/>}
         </button>
       })}
     </div>
     {hintsAllowed && !answered && <button className="hintBtn" onClick={()=>setShowHint(!showHint)}><Lightbulb size={17}/> {showHint?"Hide hint":"Need a hint?"}</button>}
     {hintsAllowed && showHint && !answered && <div className="hint">💡 Think about famous cities you may have heard in the news or at school.</div>}
     {!hintsAllowed && !answered && <div className="challengeNote"><Flame size={14}/> Challenge mode: no hints!</div>}
     {answered && <div className={"feedback "+(correct?"good":"bad")}>
       <div className="feedbackIcon">{correct?"🎉":"💡"}</div>
       <div><b>{correct?PRAISE[q%PRAISE.length]:WRONG[q%WRONG.length]}</b><span>{correct ? `${current.answer} is the correct answer!` : `The correct answer is ${current.answer}.`}</span></div>
     </div>}
     {answered && !correct && <div className="learnCard">
       <div className="learnIcon"><BookOpen size={20}/></div>
       <div><b>Learn: {current.state}</b><span>Capital: {current.capital}. {current.fact}</span></div>
     </div>}
     {answered && <button className="nextBtn" onClick={next}>{q===quiz.length-1?"See my result":"Next question"} <ArrowRight size={19}/></button>}
   </div>
   <div className="quizFooter"><span>Take your time!</span><button onClick={()=>setSound(!sound)}>{sound?"🔊":"🔇"} Sound</button></div>
 </main>
}

function ResultScreen({score,answers,time,mode,outOfLives,start,avatar}){
 const mm=String(Math.floor(time/60)).padStart(2,"0"), ss=String(time%60).padStart(2,"0");
 const total = answers.length;
 const pct = total ? Math.round(score/total*100) : 0;
 const missed = answers.filter(a=>!a.correct);
 const isPractice = mode==="practice";
 const award = isPractice ? PRACTICE_AWARD : trophy(score,total,outOfLives);
 const showConfetti = !isPractice && !outOfLives && pct>=90;
 return <main className="result">
   {showConfetti && <Confetti/>}
   <Header onBack={()=>location.reload()} avatar={avatar}/>
   <section className="resultHero">
     <div className="confetti">✦　✧　✦　✧　✦</div>
     <div className="trophy">{award.icon}</div>
     <div className="eyebrow">{isPractice ? "PRACTICE COMPLETE" : outOfLives ? "OUT OF LIVES" : "QUEST COMPLETE"}</div>
     <h1>{award.name}</h1>
     <p>{award.msg}</p>
     {!isPractice && <div className="scoreCircle"><strong>{score}</strong><span>/ {total}</span><small>{pct}%</small></div>}
     <div className="resultStats">
       <div><b>{score}</b><span>Correct</span></div><div><b>{total-score}</b><span>To learn</span></div><div><b>{mm}:{ss}</b><span>Time</span></div>
     </div>
     <button className="startBtn" onClick={start}><RotateCcw size={19}/> Play again</button>
   </section>
   <section className="review">
     <h2>Your adventure</h2>
     {answers.map((a,i)=><div className="reviewRow" key={a.id}>
       <span className={a.correct?"miniRight":"miniWrong"}>{a.correct?"✓":"!"}</span>
       <div><b>{i+1}. {a.state}</b><small>Capital: {a.capital}{a.correct?"":" · Your answer: "+a.selected}</small></div>
     </div>)}
     {missed.length===0 && <div className="perfect">🌟 Perfect! Every capital was correct.</div>}
   </section>
   <footer className="resultFooter">Made for curious minds · India Capital Quest 🇮🇳</footer>
 </main>
}

function LeaderboardScreen({onBack,avatar}){
  const list = loadLeaderboard();
  const medals = ["🥇","🥈","🥉","4","5"];
  return <main className="result">
    <Header onBack={onBack} avatar={avatar}/>
    <section className="panel listPanel">
      <h2><Trophy size={22}/> Top Scores</h2>
      {list.length===0 && <div className="emptyState">Play Quest Mode to get on the leaderboard!</div>}
      {list.map((e,i)=>
        <div className="leaderRow" key={i}>
          <span className="leaderRank">{medals[i]}</span>
          <span className="leaderAvatar">{e.avatar}</span>
          <div className="leaderInfo"><b>{e.name}</b><small>{e.difficulty} · {e.score}/{e.total}</small></div>
          <span className="leaderPct">{e.pct}%</span>
        </div>
      )}
    </section>
  </main>
}

function ProgressScreen({onBack,avatar}){
  const progress = loadProgress();
  const masteredCount = ALL_REGIONS.filter(([state])=>isMastered(progress[state])).length;
  return <main className="result">
    <Header onBack={onBack} avatar={avatar}/>
    <section className="panel listPanel">
      <h2><Star size={22}/> My Progress</h2>
      <p className="progressSummary">{masteredCount} of {ALL_REGIONS.length} states & UTs mastered ⭐</p>
      <div className="stateGrid">
        {ALL_REGIONS.map(([state])=>{
          const rec = progress[state];
          const mastered = isMastered(rec);
          const tried = !!rec && rec.attempts>0;
          return <div key={state} className={"stateChip "+(mastered?"mastered":tried?"tried":"new")}>
            <span>{mastered?"⭐":tried?"🌱":"⚪"}</span> {state}
          </div>
        })}
      </div>
    </section>
  </main>
}

createRoot(document.getElementById("root")).render(<App/>);
