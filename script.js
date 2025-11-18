/* ---------- SAME QUESTIONS AS BEFORE (all correct!!) ---------- */

const QUESTIONS = [
  {
    q: "Find the missing number: 4, 12, 36, 108, ?",
    options: ["324", "360", "420", "250"],
    answer: "324"
  },
  {
    q: "Pattern: B2, E4, H6, K8, ?",
    options: ["N10", "M10", "N9", "L10"],
    answer: "N10"
  },
  {
    q: "Reverse digits: 13 → 31, 24 → 42, 57 → ?",
    options: ["75", "58", "85", "67"],
    answer: "75"
  },
  {
    q: "Sequence: 2, 5, 11, 23, ?",
    options: ["47", "46", "40", "50"],
    answer: "47"
  },
  {
    q: "If A=1, B=2 ... Z=26, what is (C+O+D+E)?",
    options: ["27", "29", "26", "30"],
    answer: "27"
  },
  {
    q: "Odd one: Pentagon, Hexagon, Square, Octagon",
    options: ["Pentagon","Hexagon","Square","Octagon"],
    answer: "Square"
  },
  {
    q: "Analogy: Hand : Finger :: Book : ?",
    options: ["Page","Cover","Paper","Story"],
    answer: "Page"
  },
  {
    q: "Complete: 7, 14, 28, 56, ?",
    options: ["98", "112", "120", "140"],
    answer: "112"
  },
  {
    q: "Next: 9, 18, 36, 72, ?",
    options: ["108", "120", "144", "162"],
    answer: "144"
  },
  {
    q: "Next: 3, 8, 17, 32, ?",
    options: ["57","50","47","65"],
    answer: "57"
  },
];

/* ============ SHARED UTILITIES ============ */

function shuffle(arr) {
  return arr.map(a => ({a, s: Math.random()}))
            .sort((x,y) => x.s - y.s)
            .map(x => x.a);
}

function save(key,val){ localStorage.setItem(key,JSON.stringify(val)); }
function load(key){ return JSON.parse(localStorage.getItem(key)); }

if (document.getElementById("themeSwitch")) {
  const t = document.getElementById("themeSwitch");
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    t.checked = true;
  }
  t.addEventListener("change", ()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
      document.body.classList.contains("dark") ? "dark":"light");
  });
}

/* ============ TEST PAGE ============ */
function startTestPage() {

  let qIndex = 0;
  let timeLeft = 600;
  let interval;

  let shuffled = shuffle(QUESTIONS).map(q => ({
    ...q, options: shuffle(q.options)
  }));

  let answers = {};

  const box = document.getElementById("questionBox");
  const timeEl = document.getElementById("time");
  const prog = document.getElementById("progressBar");

  function render() {
    const q = shuffled[qIndex];
    box.innerHTML = `
      <div class="qcard">
        <div class="qtext"><strong>${qIndex+1}.</strong> ${q.q}</div>
        <div class="options">
          ${q.options.map(o=>`
            <label><input type="radio" name="opt" value="${o}"> ${o}</label>`).join("")}
        </div>
      </div>
    `;

    if (answers[qIndex]) {
      document.querySelector(`input[value="${answers[qIndex]}"]`).checked = true;
    }

    prog.style.width = ((qIndex)/shuffled.length)*100 + "%";
  }

  function saveAns() {
    let sel = document.querySelector("input[name='opt']:checked");
    if (sel) answers[qIndex] = sel.value;
  }

  document.getElementById("nextQ").onclick = ()=>{
    saveAns();
    if (qIndex < shuffled.length-1) qIndex++;
    render();
  };
  
  document.getElementById("prevQ").onclick = ()=>{
    saveAns();
    if (qIndex>0) qIndex--;
    render();
  };

  document.getElementById("finishQ").onclick = ()=>{
    saveAns(); finish();
  };

  render();

  interval = setInterval(()=>{
    timeLeft--;
    const m = Math.floor(timeLeft/60);
    const s = String(timeLeft%60).padStart(2,"0");
    timeEl.textContent = `${m}:${s}`;

    if (timeLeft<=0) { clearInterval(interval); finish(); }
  },1000);

  function finish(){
    clearInterval(interval);
    let score=0, detail=[];

    shuffled.forEach((q,i)=>{
      let user=answers[i] || null;
      let correct=q.answer;
      let ok=user===correct;
      if(ok) score++;

      detail.push({
        idx:i+1, q:q.q, user, correct, isCorrect:ok
      });
    });

    let mean=5.4, sd=2.1;
    let z=(score-mean)/sd;
    let iq=Math.round(100+15*z);
    iq=Math.max(60,Math.min(160,iq));

    save("latestResult",{score,total:shuffled.length,iq,detail});
    window.location="result.html";
  }
}

/* ============ RESULT PAGE =========== */
function loadResultPage(){
  let res=load("latestResult");
  if(!res) return;

  document.getElementById("summary").innerHTML=`
    <div class="bigscore" style="font-size:28px;font-weight:700">
      Score: ${res.score}/${res.total}
    </div>
    <div style="margin-top:6px">Estimated IQ:
      <strong style="font-size:24px">${res.iq}</strong></div>
  `;

  const box=document.getElementById("breakdown");

  res.detail.forEach(d=>{
    box.innerHTML+=`
      <div class="row ${d.isCorrect?"correct":"wrong"}">
        <div class="idx">${d.idx}</div>
        <div>
          <div><strong>${d.q}</strong></div>
          <div>Your answer: <b>${d.user ?? "<i>None</i>"}</b></div>
          <div>Correct: <b>${d.correct}</b></div>
        </div>
      </div>
    `;
  });
}
