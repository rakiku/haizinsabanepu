import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update, push } from "firebase/database";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

// --- 🔴 Firebase設定をここに貼り付けてください ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// 状態変数
let currentRoomId = "";
let myPos = null;
let isHost = false;
let currentQuestionSet = null;

// --- 画面切り替え ---
window.showView = (viewId) => {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
};

// --- 問題作成機能 ---
let questionCount = 0;
window.addQuestionForm = () => {
    questionCount++;
    const div = document.createElement('div');
    div.className = "card";
    div.innerHTML = `
        <p>第${questionCount}問</p>
        <input type="text" class="q-txt" placeholder="問題文">
        <input type="text" class="q-ans" placeholder="正解(5文字なら5文字)">
        <input type="number" class="q-time" placeholder="秒数" value="20">
        <input type="file" class="q-img" accept="image/*">
    `;
    document.getElementById('question-list').appendChild(div);
};

window.saveQuestionSet = async () => {
    const title = document.getElementById('set-title').value;
    const pass = document.getElementById('set-pass').value;
    const forms = document.querySelectorAll('#question-list .card');
    const questions = [];

    for (let form of forms) {
        const file = form.querySelector('.q-img').files[0];
        let imgUrl = "";
        if (file) {
            const storageRef = sRef(storage, `images/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            imgUrl = await getDownloadURL(snapshot.ref);
        }
        questions.push({
            text: form.querySelector('.q-txt').value,
            answer: form.querySelector('.q-ans').value,
            time: parseInt(form.querySelector('.q-time').value),
            image: imgUrl
        });
    }

    const newSetRef = push(ref(db, 'library'));
    await set(newSetRef, { title, pass, questions });
    alert("保存完了！");
    showView('view-lobby');
};

// --- ゲーム進行機能 ---
window.joinRoom = () => {
    currentRoomId = document.getElementById('room-id').value;
    if (!currentRoomId) return alert("IDを入力してください");

    const roomRef = ref(db, `rooms/${currentRoomId}`);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) syncGame(data);
    });

    // 初回ホスト判定（簡易的に誰もいない場合ホスト）
    onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            isHost = true;
            set(roomRef, { status: 'waiting', host: true });
        }
    }, { onlyOnce: true });

    loadSets();
    showView('view-game');
};

async function loadSets() {
    onValue(ref(db, 'library'), (snapshot) => {
        const sets = snapshot.val();
        const select = document.getElementById('set-selector');
        select.innerHTML = '<option value="">セットを選択</option>';
        for (let key in sets) {
            select.innerHTML += `<option value="${key}">${sets[key].title}</option>`;
        }
    });
}

// ゲーム同期のメインロジック
function syncGame(data) {
    const q = data.currentQuestion;
    if (!q) return;

    // 1. 問題表示
    document.getElementById('q-text').innerText = q.text;
    if (q.image) {
        document.getElementById('q-image').src = q.image;
        document.getElementById('q-image').classList.remove('hidden');
    } else {
        document.getElementById('q-image').classList.add('hidden');
    }

    // 2. 文字数に合わせてボックス生成
    const ansContainer = document.getElementById('answer-container');
    if (ansContainer.childElementCount !== q.answer.length) {
        ansContainer.innerHTML = "";
        for (let i = 1; i <= q.answer.length; i++) {
            const input = document.createElement('input');
            input.className = "answer-box";
            input.maxLength = 1;
            input.id = `box-${i}`;
            input.oninput = (e) => sendInput(i, e.target.value);
            ansContainer.appendChild(input);
        }
        updatePosButtons(q.answer.length);
    }

    // 3. 入力同期（他人の回答は伏せる）
    for (let i = 1; i <= q.answer.length; i++) {
        const box = document.getElementById(`box-${i}`);
        const pInput = data.players?.[i]?.input || "";
        if (i === myPos) {
            box.disabled = (data.status === 'reveal');
        } else {
            box.disabled = true;
            box.value = (data.status === 'reveal') ? pInput : (pInput ? "●" : "");
        }
        
        // 判定色
        if (data.status === 'judged') {
            box.classList.add(data.result ? 'correct' : 'wrong');
        } else {
            box.classList.remove('correct', 'wrong');
        }
    }

    // ホスト権限の表示
    document.getElementById('host-controls').classList.toggle('hidden', !isHost);
    document.getElementById('judgement-btns').classList.toggle('hidden', data.status !== 'reveal');
}

window.sendInput = (pos, val) => {
    if (pos !== myPos) return;
    update(ref(db, `rooms/${currentRoomId}/players/${pos}`), { input: val });
};

window.updatePosButtons = (count) => {
    const container = document.getElementById('pos-buttons');
    container.innerHTML = "";
    for (let i = 1; i <= count; i++) {
        const btn = document.createElement('button');
        btn.innerText = `${i}番`;
        btn.onclick = () => { myPos = i; alert(i + "番に決定"); };
        container.appendChild(btn);
    }
};

// ホスト操作
window.startNextQuestion = async () => {
    const setId = document.getElementById('set-selector').value;
    onValue(ref(db, `library/${setId}`), (snapshot) => {
        const set = snapshot.val();
        const q = set.questions[0]; // 簡易的に1問目。実際はindexを管理。
        update(ref(db, `rooms/${currentRoomId}`), {
            currentQuestion: q,
            status: 'playing',
            players: {} // リセット
        });
    }, { onlyOnce: true });
};

window.revealAnswers = () => {
    update(ref(db, `rooms/${currentRoomId}`), { status: 'reveal' });
};

window.judge = (isCorrect) => {
    update(ref(db, `rooms/${currentRoomId}`), { status: 'judged', result: isCorrect });
};
