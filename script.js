import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, push } from "firebase/database";

// 1. Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyBpQCKsoUaWwHzFRkmYlLuqygyDc8c3vmw",
  authDomain: "haizinsaba.firebaseapp.com",
  databaseURL: "https://haizinsaba-default-rtdb.firebaseio.com",
  projectId: "haizinsaba",
  storageBucket: "haizinsaba.firebasestorage.app",
  messagingSenderId: "1061589488690",
  appId: "1:1061589488690:web:9b13632f53f0609b38182b",
  measurementId: "G-Z07PHF0214"
};

// 2. Firebaseの初期化（Analyticsは削除しました）
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- ここから下は以前のコードと同じ ---
let roomId = "";
let myPos = null;
let isHost = false;

window.showView = (id) => {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};

let qIdx = 0;
window.addQuestionForm = () => {
    qIdx++;
    const div = document.createElement('div');
    div.className = "card";
    div.innerHTML = `
        <p>第${qIdx}問</p>
        <input type="text" class="q-txt" placeholder="問題文">
        <input type="text" class="q-ans" placeholder="答え">
        <input type="number" class="q-time" placeholder="制限時間(秒)" value="20">
        <input type="text" class="q-img" placeholder="画像URL(任意)">
    `;
    document.getElementById('question-list').appendChild(div);
};

window.saveQuestionSet = async () => {
    const title = document.getElementById('set-title').value;
    const pass = document.getElementById('set-pass').value;
    const questions = Array.from(document.querySelectorAll('#question-list .card')).map(form => ({
        text: form.querySelector('.q-txt').value,
        answer: form.querySelector('.q-ans').value,
        time: parseInt(form.querySelector('.q-time').value),
        image: form.querySelector('.q-img').value
    }));
    await push(ref(db, 'library'), { title, pass, questions });
    alert("保存しました！");
    showView('view-lobby');
};

window.joinRoom = () => {
    roomId = document.getElementById('room-id').value;
    if(!roomId) return alert("ルームIDを入力してください");
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snap) => {
        const data = snap.val();
        if(data) sync(data);
        else if(!isHost) { isHost = true; set(roomRef, { status: 'waiting' }); }
    });
    loadSets();
    showView('view-game');
};

function loadSets() {
    onValue(ref(db, 'library'), (snap) => {
        const sets = snap.val();
        const sel = document.getElementById('set-selector');
        sel.innerHTML = '<option value="">セット選択</option>';
        for(let key in sets) sel.innerHTML += `<option value="${key}">${sets[key].title}</option>`;
    });
}

function sync(data) {
    const q = data.currentQuestion;
    if(!q) return;
    document.getElementById('q-text').innerText = q.text;
    document.getElementById('display-mode').innerText = `${q.answer.length} LEAGUE`;
    const img = document.getElementById('q-image');
    if(q.image) { img.src = q.image; img.classList.remove('hidden'); } else { img.classList.add('hidden'); }
    const container = document.getElementById('answer-container');
    if(container.childElementCount !== q.answer.length) {
        container.innerHTML = "";
        for(let i=1; i<=q.answer.length; i++) {
            const input = document.createElement('input');
            input.className = "answer-box";
            input.id = `box-${i}`;
            input.maxLength = 1;
            input.oninput = (e) => { if(myPos === i) update(ref(db, `rooms/${roomId}/answers`), { [i]: e.target.value }); };
            container.appendChild(input);
        }
        updatePosButtons(q.answer.length);
    }
    for(let i=1; i<=q.answer.length; i++) {
        const box = document.getElementById(`box-${i}`);
        const val = data.answers?.[i] || "";
        if(i !== myPos) box.value = (data.status === 'reveal' || data.status === 'judged') ? val : (val ? "●" : "");
        else box.value = val;
        if(data.status === 'judged') box.style.background = data.result ? "#dcfce7" : "#fee2e2";
        else box.style.background = "white";
    }
    document.getElementById('host-panel').classList.toggle('hidden', !isHost);
    document.getElementById('judge-controls').classList.toggle('hidden', data.status === 'waiting');
    document.getElementById('display-timer').innerText = `残り ${data.timer || 0} 秒`;
}

window.updatePosButtons = (len) => {
    const container = document.getElementById('pos-buttons');
    container.innerHTML = "";
    for(let i=1; i<=len; i++) {
        const b = document.createElement('button');
        b.innerText = `${i}番`;
        b.onclick = () => { myPos = i; alert(`${i}番に決定`); };
        container.appendChild(b);
    }
};

window.startNextQuestion = () => {
    const setId = document.getElementById('set-selector').value;
    onValue(ref(db, `library/${setId}`), (snap) => {
        const setData = snap.val();
        const q = setData.questions[0];
        let timeLeft = q.time;
        set(ref(db, `rooms/${roomId}`), { currentQuestion: q, status: 'playing', answers: {}, timer: timeLeft });
        if(window.gameInterval) clearInterval(window.gameInterval);
        window.gameInterval = setInterval(() => {
            timeLeft--;
            update(ref(db, `rooms/${roomId}`), { timer: timeLeft });
            if(timeLeft <= 0) { clearInterval(window.gameInterval); revealAnswers(); }
        }, 1000);
    }, { onlyOnce: true });
};

window.revealAnswers = () => update(ref(db, `rooms/${roomId}`), { status: 'reveal' });
window.judge = (res) => update(ref(db, `rooms/${roomId}`), { status: 'judged', result: res });
