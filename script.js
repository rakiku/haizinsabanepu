
// 数値調整用（HTMLのonclickから呼ばれるためDOMContentLoadedの外に定義）
window.adjustCount = function(id, diff) {
    const input = document.getElementById(id);
    if (!input) return;
    let val = parseInt(input.value) + diff;
    if (val < 1) val = 1; 
    if (val > 4) val = 4;
    input.value = val;
    
    // ここから追加
    // プレイヤー数の場合は名前入力欄を更新
    if (id === 'playerCount') {
        updatePlayerNameInputs();
    }
    // ここまで追加
    
    // プレイヤー名入力欄の数を更新するイベントを発火
    const event = new Event('input');
    input.dispatchEvent(event);
};

// プレイヤー名入力欄を更新する関数（adjustCountから呼ばれるためDOMContentLoadedの外に定義）
window.updatePlayerNameInputs = function() {
    const container = document.getElementById('playerNameInputsContainer');
    const count = parseInt(document.getElementById('playerCount').value) || 1;
    const currentInputs = Array.from(container.querySelectorAll('input')).map(i => i.value);
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'playerNameInput';
        input.placeholder = `プレイヤー${i + 1}の名前`;
        if (currentInputs[i]) input.value = currentInputs[i];
        container.appendChild(input);
    }
};

// タブ切り替え機能（HTMLのonclickから呼ばれるためグローバルに定義）
window.showTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (tabName === 'charTab') document.getElementById('tab-char').classList.add('active');
    if (tabName === 'weaponTab') document.getElementById('tab-weapon').classList.add('active');
};

// 一括チェック機能（HTMLのonclickから呼ばれるためグローバルに定義）
window.bulkCheck = function(type, state) {
    if (type === 'char') {
        document.querySelectorAll('.char-owned').forEach(cb => cb.checked = state);
    } else if (type === 'weapon') {
        document.querySelectorAll('.weapon-owned').forEach(cb => cb.checked = state);
    }
};

// 画像パスのエンコード関数（DOMContentLoadedの外に定義して、loadPlayerDataから呼べるようにする）
function encodeImagePath(type, name) {
    if (!name) return null;
    
    // セキュリティチェック（入力時）- パス走査攻撃を防ぐ
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        console.error(`[IMAGE] Invalid name detected: ${name}`);
        return null;
    }
    
    const folderMap = {
        'boss': 'files/boss',
        'character': 'files/characters',
        'weapon': 'files/weapons',
        'element': 'files/elements'
    };
    const folder = folderMap[type];
    const cleanName = name.trim().replace(/\s+/g, '');

    // encodeURIComponent()で正しくエンコード
    const encodedName = encodeURIComponent(cleanName);
    
    console.log(`[IMAGE] type:${type}, name:${name}, path:${folder}/${encodedName}.png`);
    return `${folder}/${encodedName}.png`;
}

document.addEventListener('DOMContentLoaded', function() {

    // --- データベース（2026/02/09版、トワリン除外） ---
    const characters = [
        { name: "ジン", country: "モンド", weapon: "片手剣", element: "風", birth_month: "３月", birthday: "3月14日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "長身女性", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "無相の風", local_specialty: "蒲公英の種", ascension_stat: "与える治療効果", distributed: false, talent_book: "抗争", talent_weekly: "東風の羽根", special_dish: "継続回復系", trace: true, costume: true, release_version: "1.0" },
        { name: "アンバー", country: "モンド", weapon: "弓", element: "炎", birth_month: "８月", birthday: "8月10日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 40, talent_boss: "爆炎樹", local_specialty: "イグサ", ascension_stat: "攻撃力", distributed: true, talent_book: "自由", talent_weekly: "東風の吐息", special_dish: "復活系", trace: false, costume: true, release_version: "1.0" },
        { name: "リサ", country: "モンド", weapon: "法器", element: "雷", birth_month: "６月", birthday: "6月9日", version: "n.0", rarity: ['☆４'], body: "長身女性", role: ["オフフィールドアタッカー"], energy: 80, talent_boss: "無相の雷", local_specialty: "ヴァルベリー", ascension_stat: "元素熟知", distributed: true, talent_book: "詩文", talent_weekly: "東風の爪", special_dish: "継続回復系", trace: false, costume: true, release_version: "1.0" },
        { name: "ガイア", country: "モンド", weapon: "片手剣", element: "氷", birth_month: "１１月", birthday: "11月30日", version: "n.0", rarity: ['☆４'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "急凍樹", local_specialty: "ドドリアン", ascension_stat: "元素チャージ効率", distributed: true, talent_book: "詩文", talent_weekly: "北風の魂箱", special_dish: "回復系", trace: false, costume: true, release_version: "1.0" },
        { name: "バーバラ", country: "モンド", weapon: "法器", element: "水", birth_month: "７月", birthday: "7月5日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "純水精霊", local_specialty: "慕風のマッシュルーム", ascension_stat: "HP", distributed: true, talent_book: "自由", talent_weekly: "北風のリング", special_dish: "スタミナ軽減系", trace: false, costume: true, release_version: "1.0" },
        { name: "ディルック", country: "モンド", weapon: "両手剣", element: "炎", birth_month: "４月", birthday: "4月30日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "爆炎樹", local_specialty: "イグサ", ascension_stat: "会心率", distributed: false, talent_book: "抗争", talent_weekly: "東風の羽根", special_dish: "攻撃系", trace: true, costume: true, release_version: "1.0" },
        { name: "レザー", country: "モンド", weapon: "両手剣", element: "雷", birth_month: "９月", birthday: "9月9日", version: "n.0", rarity: ['☆４'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "無相の雷", local_specialty: "ググプラム", ascension_stat: "物理ダメージ", distributed: false, talent_book: "抗争", talent_weekly: "東風の爪", special_dish: "回復系", trace: false, costume: false, release_version: "1.0" },
        { name: "ウェンティ", country: "モンド", weapon: "弓", element: "風", birth_month: "６月", birthday: "6月16日", version: "n.0", rarity: ['☆５'], body: "中身男性", role: ["オフフィールドアタッカー", "オフフィールドサポーター"], energy: 60, talent_boss: "無相の風", local_specialty: "セシリアの花", ascension_stat: "元素チャージ効率", distributed: false, talent_book: "詩文", talent_weekly: "北風のしっぽ", special_dish: "スタミナ軽減系", trace: true, costume: false, release_version: "1.0" },
        { name: "クレー", country: "モンド", weapon: "法器", element: "炎", birth_month: "７月", birthday: "7月27日", version: "n.0", rarity: ['☆５'], body: "ロリ", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "爆炎樹", local_specialty: "慕風のマッシュルーム", ascension_stat: "炎元素ダメージ", distributed: false, talent_book: "自由", talent_weekly: "北風のリング", special_dish: "防御系", trace: true, costume: true, release_version: "1.0" },
        { name: "ベネット", country: "モンド", weapon: "片手剣", element: "炎", birth_month: "２月", birthday: "2月29日", version: "n.0", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "爆炎樹", local_specialty: "風車アスター", ascension_stat: "元素チャージ効率", distributed: true, talent_book: "抗争", talent_weekly: "東風の羽根", special_dish: "復活系", trace: false, costume: true, release_version: "1.0" },
        { name: "ノエル", country: "モンド", weapon: "両手剣", element: "岩", birth_month: "３月", birthday: "3月21日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オンフィールドアタッカー", "オンフィールドライフキーパー"], energy: 60, talent_boss: "無相の岩", local_specialty: "ヴァルベリー", ascension_stat: "防御力", distributed: false, talent_book: "抗争", talent_weekly: "東風の爪", special_dish: "復活系", trace: false, costume: false, release_version: "1.0" },
        { name: "フィッシュル", country: "モンド", weapon: "弓", element: "雷", birth_month: "５月", birthday: "5月27日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 60, talent_boss: "無相の雷", local_specialty: "イグサ", ascension_stat: "攻撃力", distributed: true, talent_book: "詩文", talent_weekly: "北風の魂箱", special_dish: "攻撃系", trace: false, costume: true, release_version: "1.0" },
        { name: "スクロース", country: "モンド", weapon: "法器", element: "風", birth_month: "１１月", birthday: "11月26日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドサポーター"], energy: 80, talent_boss: "無相の風", local_specialty: "風車アスター", ascension_stat: "風元素ダメージ", distributed: false, talent_book: "自由", talent_weekly: "北風の魂箱", special_dish: "復活系", trace: false, costume: false, release_version: "1.0" },
        { name: "モナ", country: "モンド", weapon: "法器", element: "水", birth_month: "８月", birthday: "8月31日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "中身女性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "純水精霊", local_specialty: "慕風のマッシュルーム", ascension_stat: "元素チャージ効率", distributed: false, talent_book: "抗争", talent_weekly: "北風のリング", special_dish: "攻撃系", trace: false, costume: true, release_version: "1.0" },
        { name: "ディオナ", country: "モンド", weapon: "弓", element: "氷", birth_month: "１月", birthday: "1月18日", version: "n.1", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "急凍樹", local_specialty: "ドドリアン", ascension_stat: "氷元素ダメージ", distributed: true, talent_book: "自由", talent_weekly: "魔王の刃・残片", special_dish: "復活系", trace: false, costume: false, release_version: "1.1" },
        { name: "アルベド", country: "モンド", weapon: "片手剣", element: "岩", birth_month: "９月", birthday: "9月13日", version: "n.2", rarity: ['☆５'], body: "中身男性", role: ["オフフィールドアタッカー"], energy: 40, talent_boss: "無相の岩", local_specialty: "セシリアの花", ascension_stat: "岩元素ダメージ", distributed: false, talent_book: "詩文", talent_weekly: "吞天の鯨・只角", special_dish: "シールド系", trace: true, costume: false, release_version: "1.2" },
        { name: "ロサリア", country: "モンド", weapon: "長柄武器", element: "氷", birth_month: "１月", birthday: "1月24日", version: "n.4", rarity: ['☆４'], body: "長身女性", role: ["オフフィールドアタッカー"], energy: 60, talent_boss: "急凍樹", local_specialty: "ヴァルベリー", ascension_stat: "攻撃力", distributed: false, talent_book: "詩文", talent_weekly: "武煉の魂・孤影", special_dish: "回復系", trace: false, costume: true, release_version: "1.4" },
        { name: "エウルア", country: "モンド", weapon: "両手剣", element: "氷", birth_month: "１０月", birthday: "10月25日", version: "n.5", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "無相の氷", local_specialty: "蒲公英の種", ascension_stat: "会心ダメージ", distributed: false, talent_book: "抗争", talent_weekly: "龍王の冠", special_dish: "シールド系", trace: false, costume: false, release_version: "1.5" },
        { name: "ミカ", country: "モンド", weapon: "長柄武器", element: "氷", birth_month: "８月", birthday: "8月11日", version: "n.5", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 70, talent_boss: "風食ウェネト", local_specialty: "ググプラム", ascension_stat: "HP", distributed: false, talent_book: "詩文", talent_weekly: "無心の淵鏡", special_dish: "攻撃系", trace: false, costume: false, release_version: "3.5" },
        { name: "ダリア", country: "モンド", weapon: "片手剣", element: "水", birth_month: "５月", birthday: "5月25日", version: "n.7", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 80, talent_boss: "秘源機兵・統御デバイス", local_specialty: "ドドリアン", ascension_stat: "HP", distributed: false, talent_book: "詩文", talent_weekly: "蝕滅の羽鱗", special_dish: "継続回復系", trace: false, costume: false, release_version: "5.7" },
        { name: "ドゥリン", country: "モンド", weapon: "片手剣", element: "炎", birth_month: "３月", birthday: "3月14日", version: "n.3", rarity: ['☆５'], body: "中身男性", role: ["オフフィールドサポーター","オフフィールドアタッカー"], energy: 70, talent_boss: "重量級陸巡艦「バトルシップ」", local_specialty: "フロストランプ", ascension_stat: "会心ダメージ", distributed: false, talent_book: "詩文", talent_weekly: "蝕滅の陽炎", special_dish: "回復系", trace: false, costume: true, release_version: "Luna III (6.2)" },
        { name: "ファルカ", country: "モンド", weapon: "両手剣", element: "風", birth_month: "２月", birthday: "2月17日", version: "n.4", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "集光の月ヤモリ", local_specialty: "ググプラム", ascension_stat: "会心ダメージ", distributed: false, talent_book: "自由", talent_weekly: "昇揚のサンプル「ルーク」", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "Luna V (6.4)" }, 
        { name: "魈", country: "璃月", weapon: "長柄武器", element: "風", birth_month: "４月", birthday: "4月17日", version: "n.4", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "エンシェントヴィシャップ・岩", local_specialty: "清心", ascension_stat: "会心率", distributed: false, talent_book: "繁栄", talent_weekly: "武煉の魂・孤影", special_dish: "攻撃系", trace: false, costume: false, release_version: "1.3" },
        { name: "北斗", country: "璃月", weapon: "両手剣", element: "雷", birth_month: "２月", birthday: "2月14日", version: "n.0", rarity: ['☆４'], body: "長身女性", role: ["オフフィールドアタッカー", "オフフィールドライフキーパー"], energy: 80, talent_boss: "無相の雷", local_specialty: "夜泊石", ascension_stat: "雷元素ダメージ", distributed: true, talent_book: "黄金", talent_weekly: "東風の吐息", special_dish: "復活系", trace: false, costume: false, release_version: "1.0" },
        { name: "凝光", country: "璃月", weapon: "法器", element: "岩", birth_month: "８月", birthday: "8月26日", version: "n.0", rarity: ['☆４'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "無相の岩", local_specialty: "瑠璃百合", ascension_stat: "岩元素ダメージ", distributed: false, talent_book: "繁栄", talent_weekly: "北風の魂箱", special_dish: "復活系", trace: true, costume: true, release_version: "1.0" },
        { name: "香菱", country: "璃月", weapon: "長柄武器", element: "炎", birth_month: "１１月", birthday: "11月2日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 80, talent_boss: "爆炎樹", local_specialty: "絶雲の唐辛子", ascension_stat: "元素熟知", distributed: true, talent_book: "勤労", talent_weekly: "東風の爪", special_dish: "継続回復系", trace: false, costume: true, release_version: "1.0" },
        { name: "行秋", country: "璃月", weapon: "片手剣", element: "水", birth_month: "１０月", birthday: "10月9日", version: "n.0", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドアタッカー", "オフフィールドライフキーパー"], energy: 80, talent_boss: "純水精霊", local_specialty: "霓裳花", ascension_stat: "攻撃力", distributed: true, talent_book: "黄金", talent_weekly: "北風のしっぽ", special_dish: "継続回復系", trace: false, costume: true, release_version: "1.0" },
        { name: "重雲", country: "璃月", weapon: "両手剣", element: "氷", birth_month: "９月", birthday: "9月7日", version: "n.0", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドアタッカー", "オフフィールドサポーター"], energy: 40, talent_boss: "急凍樹", local_specialty: "石珀", ascension_stat: "攻撃力", distributed: false, talent_book: "勤労", talent_weekly: "東風の吐息", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "1.0" },
        { name: "七七", country: "璃月", weapon: "片手剣", element: "氷", birth_month: "３月", birthday: "3月3日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "ロリ", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "急凍樹", local_specialty: "瑠璃袋", ascension_stat: "与える治療効果", distributed: false, talent_book: "繁栄", talent_weekly: "北風のしっぽ", special_dish: "攻撃系", trace: true, costume: false, release_version: "1.0" },
        { name: "刻晴", country: "璃月", weapon: "片手剣", element: "雷", birth_month: "１１月", birthday: "11月20日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "無相の雷", local_specialty: "石珀", ascension_stat: "会心ダメージ", distributed: false, talent_book: "繁栄", talent_weekly: "北風のリング", special_dish: "回復系", trace: true, costume: true, release_version: "1.0" },
        { name: "鍾離", country: "璃月", weapon: "長柄武器", element: "岩", birth_month: "１２月", birthday: "12月31日", version: "n.1", rarity: ['☆５'], body: "長身男性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 40, talent_boss: "無相の岩", local_specialty: "石珀", ascension_stat: "岩元素ダメージ", distributed: false, talent_book: "黄金", talent_weekly: "吞天の鯨・只角", special_dish: "継続回復系", trace: true, costume: false, release_version: "1.1" },
        { name: "辛炎", country: "璃月", weapon: "両手剣", element: "炎", birth_month: "１０月", birthday: "10月16日", version: "n.1", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 60, talent_boss: "爆炎樹", local_specialty: "瑠璃袋", ascension_stat: "攻撃力", distributed: true, talent_book: "黄金", talent_weekly: "吞天の鯨・只角", special_dish: "攻撃系", trace: false, costume: false, release_version: "1.1" },
        { name: "甘雨", country: "璃月", weapon: "弓", element: "氷", birth_month: "１２月", birthday: "12月2日", version: "n.2", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "急凍樹", local_specialty: "清心", ascension_stat: "会心ダメージ", distributed: false, talent_book: "勤労", talent_weekly: "武煉の魂・孤影", special_dish: "回復系", trace: true, costume: true, release_version: "1.2" },
        { name: "胡桃", country: "璃月", weapon: "長柄武器", element: "炎", birth_month: "７月", birthday: "7月15日", version: "n.3", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "エンシェントヴィシャップ・岩", local_specialty: "霓裳花", ascension_stat: "会心ダメージ", distributed: false, talent_book: "勤労", talent_weekly: "魔王の刃・残片", special_dish: "復活系", trace: false, costume: true, release_version: "1.3" },
        { name: "煙緋", country: "璃月", weapon: "法器", element: "炎", birth_month: "７月", birthday: "7月28日", version: "n.5", rarity: ['☆４'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "エンシェントヴィシャップ・岩", local_specialty: "夜泊石", ascension_stat: "炎元素ダメージ", distributed: false, talent_book: "黄金", talent_weekly: "血玉の枝", special_dish: "復活系", trace: false, costume: false, release_version: "1.5" },
        { name: "申鶴", country: "璃月", weapon: "長柄武器", element: "氷", birth_month: "３月", birthday: "3月10日", version: "n.4", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドサポーター"], energy: 80, talent_boss: "アビサルヴィシャップ", local_specialty: "清心", ascension_stat: "攻撃力", distributed: false, talent_book: "繁栄", talent_weekly: "獄炎の蝶", special_dish: "攻撃系", trace: true, costume: true, release_version: "2.4" },
        { name: "雲菫", country: "璃月", weapon: "長柄武器", element: "岩", birth_month: "５月", birthday: "5月21日", version: "n.4", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "黄金王獣", local_specialty: "瑠璃百合", ascension_stat: "元素チャージ効率", distributed: false, talent_book: "勤労", talent_weekly: "灰燼の心", special_dish: "スタミナ軽減系", trace: false, costume: false, release_version: "2.4" },
        { name: "夜蘭", country: "璃月", weapon: "弓", element: "水", birth_month: "４月", birthday: "4月20日", version: "n.7", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドアタッカー"], energy: 70, talent_boss: "遺跡サーペント", local_specialty: "星螺", ascension_stat: "会心率", distributed: false, talent_book: "繁栄", talent_weekly: "鍍金の鱗", special_dish: "シールド系", trace: true, costume: true, release_version: "2.7" },
        { name: "ヨォーヨ", country: "璃月", weapon: "長柄武器", element: "草", birth_month: "３月", birthday: "3月6日", version: "n.4", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "無相の草", local_specialty: "絶雲の唐辛子", ascension_stat: "HP", distributed: false, talent_book: "勤労", talent_weekly: "空行の虚鈴", special_dish: "継続回復系", trace: false, costume: true, release_version: "3.4" },
        { name: "白朮", country: "璃月", weapon: "法器", element: "草", birth_month: "４月", birthday: "4月25日", version: "n.6", rarity: ['☆５'], body: "長身男性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 80, talent_boss: "深罪の浸礼者", local_specialty: "瑠璃袋", ascension_stat: "HP", distributed: false, talent_book: "黄金", talent_weekly: "禍神の禊涙", special_dish: "治療効果系", trace: false, costume: false, release_version: "3.6" },
        { name: "閑雲", country: "璃月", weapon: "法器", element: "風", birth_month: "４月", birthday: "4月11日", version: "n.4", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 70, talent_boss: "山隠れの猊獣", local_specialty: "清水玉", ascension_stat: "攻撃力", distributed: false, talent_book: "黄金", talent_weekly: "光なき渦の眼", special_dish: "攻撃系", trace: false, costume: false, release_version: "4.4" },
        { name: "嘉明", country: "璃月", weapon: "両手剣", element: "炎", birth_month: "１２月", birthday: "12月22日", version: "n.4", rarity: ['☆４'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "鉄甲熔炎帝王", local_specialty: "星螺", ascension_stat: "攻撃力", distributed: false, talent_book: "繁栄", talent_weekly: "光なき一塊", special_dish: "継続回復系", trace: false, costume: false, release_version: "4.4" },
        { name: "藍硯", country: "璃月", weapon: "法器", element: "風", birth_month: "１月", birthday: "1月6日", version: "n.3", rarity: ['☆４'], body: "中身女性", role: ["オンフィールドアタッカー", "オンフィールドライフキーパー"], energy: 60, talent_boss: "秘源機兵・機構デバイス", local_specialty: "清水玉", ascension_stat: "攻撃力", distributed: false, talent_book: "勤労", talent_weekly: "蝕滅の陽炎", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "5.3" },
        { name: "兹白", country: "璃月", weapon: "片手剣", element: "岩", birth_month: "５月", birthday: "5月15日", version: "n.4", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "昏き魘夢の主", local_specialty: "瑠璃百合", ascension_stat: "会心ダメージ", distributed: false, talent_book: "黄金", talent_weekly: "昇揚のサンプル「王族」", special_dish: "防御系", trace: false, costume: false, release_version: "Luna IV (6.3)" },
        { name: "神里綾華", country: "稲妻", weapon: "片手剣", element: "氷", birth_month: "９月", birthday: "9月28日", version: "n.0", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "恒常からくり陣形", local_specialty: "緋櫻毬", ascension_stat: "会心ダメージ", distributed: false, talent_book: "風雅", talent_weekly: "血玉の枝", special_dish: "復活系", trace: true, costume: true, release_version: "2.0" },
        { name: "神里綾人", country: "稲妻", weapon: "片手剣", element: "水", birth_month: "３月", birthday: "3月26日", version: "n.6", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "無相の水", local_specialty: "緋櫻毬", ascension_stat: "会心ダメージ", distributed: false, talent_book: "風雅", talent_weekly: "凶将の手眼", special_dish: "シールド系", trace: true, costume: false, release_version: "2.6" },
        { name: "楓原万葉", country: "稲妻", weapon: "片手剣", element: "風", birth_month: "１０月", birthday: "10月29日", version: "n.6", rarity: ['☆５'], body: "中身男性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "魔偶剣鬼", local_specialty: "ウミレイシ", ascension_stat: "元素熟知", distributed: false, talent_book: "勤労", talent_weekly: "鍍金の鱗", special_dish: "回復系", trace: true, costume: false, release_version: "1.6" },
        { name: "宵宮", country: "稲妻", weapon: "弓", element: "炎", birth_month: "６月", birthday: "6月21日", version: "n.0", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "無相の炎", local_specialty: "鳴草", ascension_stat: "会心率", distributed: false, talent_book: "浮世", talent_weekly: "龍王の冠", special_dish: "回復系", trace: false, costume: false, release_version: "2.0" },
        { name: "早柚", country: "稲妻", weapon: "両手剣", element: "風", birth_month: "１０月", birthday: "10月19日", version: "n.0", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "魔偶剣鬼", local_specialty: "晶化骨髄", ascension_stat: "元素熟知", distributed: false, talent_book: "天光", talent_weekly: "鍍金の鱗", special_dish: "継続回復系", trace: false, costume: false, release_version: "2.0" },
        { name: "雷電将軍", country: "稲妻", weapon: "長柄武器", element: "雷", birth_month: "６月", birthday: "6月26日", version: "n.1", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー", "オンフィールドサポーター"], energy: 90, talent_boss: "雷音権現", local_specialty: "天雲草の実", ascension_stat: "元素チャージ効率", distributed: false, talent_book: "天光", talent_weekly: "溶滅の刻", special_dish: "", trace: true, costume: false, release_version: "2.1" },
        { name: "九条裟羅", country: "稲妻", weapon: "弓", element: "雷", birth_month: "７月", birthday: "7月14日", version: "n.1", rarity: ['☆４'], body: "長身女性", role: ["オフフィールドサポーター"], energy: 80, talent_boss: "雷音権現", local_specialty: "血石華", ascension_stat: "攻撃力", distributed: false, talent_book: "風雅", talent_weekly: "灰燼の心", special_dish: "復活系", trace: false, costume: false, release_version: "2.1" },
        { name: "珊瑚宮心海", country: "稲妻", weapon: "法器", element: "水", birth_month: "２月", birthday: "2月22日", version: "n.1", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 70, talent_boss: "無相の水", local_specialty: "珊瑚真珠", ascension_stat: "水元素ダメージ", distributed: false, talent_book: "浮世", talent_weekly: "獄炎の蝶", special_dish: "回復系", trace: false, costume: false, release_version: "2.1" },
        { name: "トーマ", country: "稲妻", weapon: "長柄武器", element: "炎", birth_month: "１月", birthday: "1月9日", version: "n.2", rarity: ['☆４'], body: "長身男性", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "無相の炎", local_specialty: "ユウトウタケ", ascension_stat: "攻撃力", distributed: false, talent_book: "浮世", talent_weekly: "獄炎の蝶", special_dish: "継続回復系", trace: false, costume: false, release_version: "2.2" },
        { name: "荒瀧一斗", country: "稲妻", weapon: "両手剣", element: "岩", birth_month: "６月", birthday: "6月1日", version: "n.3", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "黄金王獣", local_specialty: "オニカブトムシ", ascension_stat: "会心率", distributed: false, talent_book: "風雅", talent_weekly: "灰燼の心", special_dish: "復活系", trace: false, costume: false, release_version: "2.3" },
        { name: "ゴロー", country: "稲妻", weapon: "弓", element: "岩", birth_month: "５月", birthday: "5月18日", version: "n.3", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドサポーター"], energy: 80, talent_boss: "恒常からくり陣形", local_specialty: "珊瑚真珠", ascension_stat: "岩元素ダメージ", distributed: true, talent_book: "天光", talent_weekly: "溶滅の刻", special_dish: "回復系", trace: false, costume: false, release_version: "2.3" },
        { name: "八重神子", country: "稲妻", weapon: "法器", element: "雷", birth_month: "６月", birthday: "6月27日", version: "n.5", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドアタッカー"], energy: 90, talent_boss: "アビサルヴィシャップ", local_specialty: "ウミレイシ", ascension_stat: "会心率", distributed: false, talent_book: "天光", talent_weekly: "万劫の真意", special_dish: "復活系", trace: false, costume: false, release_version: "2.5" },
        { name: "久岐忍", country: "稲妻", weapon: "片手剣", element: "雷", birth_month: "７月", birthday: "7月27日", version: "n.7", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 60, talent_boss: "遺跡サーペント", local_specialty: "鳴草", ascension_stat: "HP", distributed: false, talent_book: "風雅", talent_weekly: "禍神の禊涙", special_dish: "スタミナ軽減系", trace: false, costume: false, release_version: "2.7" },
        { name: "鹿野院平蔵", country: "稲妻", weapon: "法器", element: "風", birth_month: "７月", birthday: "7月24日", version: "n.8", rarity: ['☆４'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "遺跡サーペント", local_specialty: "オニカブトムシ", ascension_stat: "風元素ダメージ", distributed: false, talent_book: "浮世", talent_weekly: "万劫の真意", special_dish: "攻撃系", trace: false, costume: false, release_version: "2.8" },
        { name: "綺良々", country: "稲妻", weapon: "片手剣", element: "草", birth_month: "１月", birthday: "1月22日", version: "n.7", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー", "オフフィールドライフキーパー"], energy: 60, talent_boss: "深罪の浸礼者", local_specialty: "天雲草の実", ascension_stat: "HP", distributed: true, talent_book: "浮世", talent_weekly: "太古の樹海の一瞬", special_dish: "継続回復系", trace: true, costume: true, release_version: "3.7" },
        { name: "千織", country: "稲妻", weapon: "片手剣", element: "岩", birth_month: "８月", birthday: "8月17日", version: "n.5", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 50, talent_boss: "氷風組曲コッペリア", local_specialty: "血石華", ascension_stat: "会心率", distributed: false, talent_book: "天光", talent_weekly: "光なき糸", special_dish: "継続回復系", trace: false, costume: false, release_version: "4.5" },
        { name: "夢見月瑞希", country: "稲妻", weapon: "法器", element: "風", birth_month: "３月", birthday: "3月16日", version: "n.4", rarity: ['☆５', '恒常☆５'], body: "中身女性", role: ["オンフィールドアタッカー", "オンフィールドライフキーパー"], energy: 60, talent_boss: "迷える霊覚の修権者", local_specialty: "ウミレイシ", ascension_stat: "元素熟知", distributed: false, talent_book: "浮世", talent_weekly: "残火の灯燭", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "5.4" },
        { name: "ティナリ", country: "スメール", weapon: "弓", element: "草", birth_month: "１２月", birthday: "12月29日", version: "n.0", rarity: ['☆５', '恒常☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "マッシュラプトル", local_specialty: "サウマラタ蓮", ascension_stat: "草元素ダメージ", distributed: false, talent_book: "忠言", talent_weekly: "万劫の真意", special_dish: "防御系", trace: false, costume: false, release_version: "3.0" },
        { name: "コレイ", country: "スメール", weapon: "弓", element: "草", birth_month: "５月", birthday: "5月8日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 60, talent_boss: "マッシュラプトル", local_specialty: "ルッカデヴァータダケ", ascension_stat: "攻撃力", distributed: true, talent_book: "篤行", talent_weekly: "禍神の禊涙", special_dish: "回復系", trace: false, costume: false, release_version: "3.0" },
        { name: "ドリー", country: "スメール", weapon: "両手剣", element: "雷", birth_month: "１２月", birthday: "12月21日", version: "n.0", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "迅電樹", local_specialty: "カルパラタ蓮", ascension_stat: "HP", distributed: true, talent_book: "創意", talent_weekly: "血玉の枝", special_dish: "攻撃系", trace: false, costume: false, release_version: "3.0" },
        { name: "セノ", country: "スメール", weapon: "長柄武器", element: "雷", birth_month: "６月", birthday: "6月23日", version: "n.1", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "迅電樹", local_specialty: "聖金虫", ascension_stat: "会心ダメージ", distributed: false, talent_book: "忠言", talent_weekly: "凶将の手眼", special_dish: "継続回復系", trace: false, costume: false, release_version: "3.1" },
        { name: "キャンディス", country: "スメール", weapon: "長柄武器", element: "水", birth_month: "５月", birthday: "5月3日", version: "n.1", rarity: ['☆４'], body: "長身女性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "半永久統制マトリックス", local_specialty: "赤念の実", ascension_stat: "HP", distributed: true, talent_book: "忠言", talent_weekly: "禍神の禊涙", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "3.1" },
        { name: "ニィロウ", country: "スメール", weapon: "片手剣", element: "水", birth_month: "１２月", birthday: "12月3日", version: "n.1", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー", "オフフィールドサポーター"], energy: 70, talent_boss: "兆載永劫ドレイク", local_specialty: "パティサラ", ascension_stat: "HP", distributed: false, talent_book: "篤行", talent_weekly: "禍神の禊涙", special_dish: "スタミナ軽減系", trace: false, costume: true, release_version: "3.1" },
        { name: "ナヒーダ", country: "スメール", weapon: "法器", element: "草", birth_month: "１０月", birthday: "10月27日", version: "n.2", rarity: ['☆５'], body: "ロリ", role: ["オフフィールドアタッカー", "オフフィールドサポーター"], energy: 50, talent_boss: "無相の草", local_specialty: "カルパラタ蓮", ascension_stat: "元素熟知", distributed: false, talent_book: "創意", talent_weekly: "傀儡の糸", special_dish: "防御系", trace: true, costume: false, release_version: "3.2" },
        { name: "レイラ", country: "スメール", weapon: "片手剣", element: "氷", birth_month: "１２月", birthday: "12月19日", version: "n.2", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 40, talent_boss: "兆載永劫ドレイク", local_specialty: "サウマラタ蓮", ascension_stat: "HP", distributed: false, talent_book: "創意", talent_weekly: "無心の淵鏡", special_dish: "継続回復系", trace: false, costume: false, release_version: "3.2" },
        { name: "放浪者", country: "スメール", weapon: "法器", element: "風", birth_month: "１月", birthday: "1月3日", version: "n.3", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "兆載永劫ドレイク", local_specialty: "ルッカデヴァータダケ", ascension_stat: "会心率", distributed: false, talent_book: "篤行", talent_weekly: "空行の虚鈴", special_dish: "治療効果系", trace: false, costume: false, release_version: "3.3" },
        { name: "ファルザン", country: "スメール", weapon: "弓", element: "風", birth_month: "８月", birthday: "8月20日", version: "n.3", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドサポーター"], energy: 80, talent_boss: "半永久統制マトリックス", local_specialty: "赤念の実", ascension_stat: "攻撃力", distributed: true, talent_book: "忠言", talent_weekly: "傀儡の糸", special_dish: "復活系", trace: false, costume: false, release_version: "3.3" },
        { name: "アルハイゼン", country: "スメール", weapon: "片手剣", element: "草", birth_month: "２月", birthday: "2月11日", version: "n.4", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "風食ウェネト", local_specialty: "砂脂蛹", ascension_stat: "草元素ダメージ", distributed: false, talent_book: "創意", talent_weekly: "無心の淵鏡", special_dish: "回復系", trace: false, costume: false, release_version: "3.4" },
        { name: "ディシア", country: "スメール", weapon: "両手剣", element: "炎", birth_month: "４月", birthday: "4月7日", version: "n.5", rarity: ['☆５', '恒常☆５'], body: "長身女性", role: ["オフフィールドアタッカー", "オフフィールドライフキーパー"], energy: 70, talent_boss: "半永久統制マトリックス", local_specialty: "砂脂蛹", ascension_stat: "HP", distributed: false, talent_book: "篤行", talent_weekly: "傀儡の糸", special_dish: "HP強化系", trace: true, costume: false, release_version: "3.5" },
        { name: "カーヴェ", country: "スメール", weapon: "両手剣", element: "草", birth_month: "７月", birthday: "7月9日", version: "n.6", rarity: ['☆４'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "無相の草", local_specialty: "悼霊花", ascension_stat: "元素熟知", distributed: false, talent_book: "創意", talent_weekly: "原初のオアシスの初咲き", special_dish: "復活系", trace: false, costume: false, release_version: "3.6" },
        { name: "セトス", country: "スメール", weapon: "弓", element: "雷", birth_month: "５月", birthday: "5月31日", version: "n.7", rarity: ['☆４'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "山隠れの猊獣", local_specialty: "サングイト", ascension_stat: "元素熟知", distributed: false, talent_book: "篤行", talent_weekly: "空行の虚鈴", special_dish: "攻撃系", trace: false, costume: false, release_version: "4.7" },
        { name: "リネ", country: "フォンテーヌ", weapon: "弓", element: "炎", birth_month: "２月", birthday: "2月2日", version: "n.0", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "鉄甲熔炎帝王", local_specialty: "レインボーローズ", ascension_stat: "会心率", distributed: false, talent_book: "公平", talent_weekly: "原初のオアシスの初咲き", special_dish: "攻撃系", trace: false, costume: false, release_version: "4.0" },
        { name: "リネット", country: "フォンテーヌ", weapon: "片手剣", element: "風", birth_month: "２月", birthday: "2月2日", version: "n.0", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 70, talent_boss: "氷風組曲コッペリア", local_specialty: "ルミドゥースベル", ascension_stat: "風元素ダメージ", distributed: true, talent_book: "秩序", talent_weekly: "太古の樹海の一瞬", special_dish: "治療効果系", trace: false, costume: false, release_version: "4.0" },
        { name: "フレミネ", country: "フォンテーヌ", weapon: "両手剣", element: "氷", birth_month: "９月", birthday: "9月24日", version: "n.0", rarity: ['☆４'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "氷風組曲コペリウス", local_specialty: "ロマリタイムフラワー", ascension_stat: "攻撃力", distributed: true, talent_book: "正義", talent_weekly: "天地に映える蕨", special_dish: "継続回復系", trace: false, costume: false, release_version: "4.0" },
        { name: "ヌヴィレット", country: "フォンテーヌ", weapon: "法器", element: "水", birth_month: "１２月", birthday: "12月18日", version: "n.1", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "千年真珠の海駿", local_specialty: "ルエトワール", ascension_stat: "会心ダメージ", distributed: false, talent_book: "公平", talent_weekly: "太古の樹海の一瞬", special_dish: "攻撃系", trace: false, costume: true, release_version: "4.1" },
        { name: "リオセスリ", country: "フォンテーヌ", weapon: "法器", element: "氷", birth_month: "１１月", birthday: "11月23日", version: "n.1", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "実験用フィールド生成装置", local_specialty: "探測ユニット・子機", ascension_stat: "会心ダメージ", distributed: false, talent_book: "秩序", talent_weekly: "原初のオアシスの初咲き", special_dish: "回復系", trace: false, costume: false, release_version: "4.1" },
        { name: "シャルロット", country: "フォンテーヌ", weapon: "法器", element: "氷", birth_month: "４月", birthday: "4月10日", version: "n.2", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 80, talent_boss: "実験用フィールド生成装置", local_specialty: "蒼晶螺", ascension_stat: "攻撃力", distributed: false, talent_book: "正義", talent_weekly: "光なき糸", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "4.2" },
        { name: "フリーナ", country: "フォンテーヌ", weapon: "片手剣", element: "水", birth_month: "１０月", birthday: "10月13日", version: "n.2", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー", "オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "水形タルパ", local_specialty: "湖光の鈴蘭", ascension_stat: "会心率", distributed: false, talent_book: "正義", talent_weekly: "光なき一塊", special_dish: "HP強化系", trace: false, costume: false, release_version: "4.2" },
        { name: "ナヴィア", country: "フォンテーヌ", weapon: "両手剣", element: "岩", birth_month: "８月", birthday: "8月16日", version: "n.3", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "氷風組曲コペリウス", local_specialty: "初露の源", ascension_stat: "会心ダメージ", distributed: false, talent_book: "公平", talent_weekly: "光なき糸", special_dish: "スタミナ軽減系", trace: false, costume: false, release_version: "4.3" },
        { name: "シュヴルーズ", country: "フォンテーヌ", weapon: "長柄武器", element: "炎", birth_month: "１月", birthday: "1月10日", version: "n.3", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "千年真珠の海駿", local_specialty: "ルミドゥースベル", ascension_stat: "HP", distributed: false, talent_book: "秩序", talent_weekly: "光なき渦の眼", special_dish: "治療効果系", trace: false, costume: false, release_version: "4.3" },
        { name: "クロリンデ", country: "フォンテーヌ", weapon: "片手剣", element: "雷", birth_month: "９月", birthday: "9月20日", version: "n.7", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "千年真珠の海駿", local_specialty: "ルエトワール", ascension_stat: "会心率", distributed: false, talent_book: "正義", talent_weekly: "太古の樹海の一瞬", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "4.7" },
        { name: "シグウィン", country: "フォンテーヌ", weapon: "弓", element: "水", birth_month: "３月", birthday: "3月30日", version: "n.7", rarity: ['☆５'], body: "ロリ", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 70, talent_boss: "水形タルパ", local_specialty: "ロマリタイムフラワー", ascension_stat: "HP", distributed: false, talent_book: "公平", talent_weekly: "光なき渦の眼", special_dish: "継続回復系", trace: false, costume: false, release_version: "4.7" },
        { name: "エミリエ", country: "フォンテーヌ", weapon: "長柄武器", element: "草", birth_month: "９月", birthday: "9月22日", version: "n.8", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー"], energy: 50, talent_boss: "魔像レガトゥス", local_specialty: "湖光の鈴蘭", ascension_stat: "会心ダメージ", distributed: false, talent_book: "秩序", talent_weekly: "絹織りの羽", special_dish: "攻撃系", trace: false, costume: false, release_version: "4.8" },
        { name: "エスコフィエ", country: "フォンテーヌ", weapon: "長柄武器", element: "氷", birth_month: "６月", birthday: "6月8日", version: "n.6", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドアタッカー", "オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "秘源機兵・統御デバイス", local_specialty: "蒼晶螺", ascension_stat: "会心率", distributed: false, talent_book: "正義", talent_weekly: "蝕滅の焔角", special_dish: "攻撃系", trace: false, costume: false, release_version: "5.6" },
        { name: "イアンサ", country: "ナタ", weapon: "長柄武器", element: "雷", birth_month: "８月", birthday: "8月8日", version: "n.5", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 70, talent_boss: "深淵なるミミック・パピラ", local_specialty: "琉鱗石", ascension_stat: "攻撃力", distributed: false, talent_book: "角逐", talent_weekly: "否定と裁決", special_dish: "復活系", trace: false, costume: false, release_version: "5.5" },
        { name: "チャスカ", country: "ナタ", weapon: "弓", element: "風", birth_month: "１２月", birthday: "12月10日", version: "n.2", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "深淵なるミミック・パピラ", local_specialty: "枯れ紫菖", ascension_stat: "会心率", distributed: false, talent_book: "紛争", talent_weekly: "絹織りの羽", special_dish: "スタミナ軽減系", trace: false, costume: false, release_version: "5.2" },
        { name: "ムアラニ", country: "ナタ", weapon: "法器", element: "水", birth_month: "８月", birthday: "8月3日", version: "n.0", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "暴君・金焔のクク竜", local_specialty: "波しぶきのエラ", ascension_stat: "会心率", distributed: false, talent_book: "角逐", talent_weekly: "光なき一塊", special_dish: "シールド系", trace: false, costume: false, release_version: "5.0" },
        { name: "オロルン", country: "ナタ", weapon: "弓", element: "雷", birth_month: "１０月", birthday: "10月14日", version: "n.2", rarity: ['☆４'], body: "長身男性", role: ["オフフィールドアタッカー"], energy: 60, talent_boss: "暴君・金焔のクク竜", local_specialty: "蛍光ツノキノコ", ascension_stat: "攻撃力", distributed: false, talent_book: "焚燼", talent_weekly: "光なき糸", special_dish: "攻撃系", trace: false, costume: false, release_version: "5.2" },
        { name: "キィニチ", country: "ナタ", weapon: "両手剣", element: "草", birth_month: "１１月", birthday: "11月11日", version: "n.0", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "山の王・貪食のユムカ竜", local_specialty: "サウリアンサキュレント", ascension_stat: "会心ダメージ", distributed: false, talent_book: "焚燼", talent_weekly: "否定と裁決", special_dish: "攻撃系", trace: false, costume: false, release_version: "5.0" },
        { name: "カチーナ", country: "ナタ", weapon: "長柄武器", element: "岩", birth_month: "４月", birthday: "4月22日", version: "n.0", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドアタッカー"], energy: 70, talent_boss: "山の王・貪食のユムカ竜", local_specialty: "ケネパベリー", ascension_stat: "岩元素ダメージ", distributed: true, talent_book: "紛争", talent_weekly: "残火の灯燭", special_dish: "継続回復系", trace: false, costume: false, release_version: "5.0" },
        { name: "シトラリ", country: "ナタ", weapon: "法器", element: "氷", birth_month: "１月", birthday: "1月20日", version: "n.3", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "迷える霊覚の修権者", local_specialty: "ケネパベリー", ascension_stat: "元素熟知", distributed: false, talent_book: "焚燼", talent_weekly: "否定と裁決", special_dish: "復活系", trace: false, costume: false, release_version: "5.3" },
        { name: "マーヴィカ", country: "ナタ", weapon: "両手剣", element: "炎", birth_month: "８月", birthday: "8月28日", version: "n.3", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー", "オフフィールドアタッカー", "オンフィールドサポーター"], energy: 0, talent_boss: "秘源機兵・機構デバイス", local_specialty: "枯れ紫菖", ascension_stat: "会心ダメージ", distributed: false, talent_book: "角逐", talent_weekly: "蝕滅の焔角", special_dish: "攻撃系", trace: false, costume: false, release_version: "5.3" },
        { name: "ヴァレサ", country: "ナタ", weapon: "法器", element: "雷", birth_month: "１１月", birthday: "11月15日", version: "n.5", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 70, talent_boss: "輝ける溶岩の龍像", local_specialty: "岩裂の花", ascension_stat: "会心率", distributed: false, talent_book: "紛争", talent_weekly: "蝕滅の羽鱗", special_dish: "攻撃系", trace: false, costume: false, release_version: "5.5" },
        { name: "イファ", country: "ナタ", weapon: "法器", element: "風", birth_month: "３月", birthday: "3月23日", version: "n.5", rarity: ['☆４'], body: "長身男性", role: ["オンフィールドライフキーパー"], energy: 60, talent_boss: "輝ける溶岩の龍像", local_specialty: "サウリアンサキュレント", ascension_stat: "元素熟知", distributed: false, talent_book: "紛争", talent_weekly: "昇揚のサンプル「ルーク」", special_dish: "防御系", trace: false, costume: false, release_version: "5.6" },
        { name: "シロネン", country: "ナタ", weapon: "片手剣", element: "岩", birth_month: "３月", birthday: "3月13日", version: "n.1", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドサポーター", "オフフィールドライフキーパー"], energy: 60, talent_boss: "秘源機兵・機構デバイス", local_specialty: "シャクギク", ascension_stat: "防御力", distributed: false, talent_book: "焚燼", talent_weekly: "無心の淵鏡", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "5.1" },
        { name: "タルタリヤ", country: "スネージナヤ", weapon: "弓", element: "水", birth_month: "７月", birthday: "7月20日", version: "n.1", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "純水精霊", local_specialty: "星螺", ascension_stat: "水元素ダメージ", distributed: false, talent_book: "自由", talent_weekly: "魔王の刃・残片", special_dish: "防御系", trace: false, costume: false, release_version: "1.1" },
        { name: "アルレッキーノ", country: "スネージナヤ", weapon: "長柄武器", element: "炎", birth_month: "８月", birthday: "8月22日", version: "n.6", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "魔像レガトゥス", local_specialty: "レインボーローズ", ascension_stat: "会心ダメージ", distributed: false, talent_book: "秩序", talent_weekly: "残火の灯燭", special_dish: "回復系", trace: false, costume: false, release_version: "4.6" },
        { name: "イネファ", country: "ナドクライ", weapon: "長柄武器", element: "雷", birth_month: "４月", birthday: "4月2日", version: "n.8", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー", "オフフィールドライフキーパー"], energy: 60, talent_boss: "秘源機兵・統御デバイス", local_specialty: "蛍光ツノキノコ", ascension_stat: "会心率", distributed: false, talent_book: "紛争", talent_weekly: "蝕滅の陽炎", special_dish: "シールド系", trace: false, costume: false, release_version: "5.8" },
        { name: "フリンズ", country: "ナドクライ", weapon: "長柄武器", element: "雷", birth_month: "１０月", birthday: "10月31日", version: "n.0", rarity: ['☆５'], body: "長身男性", role: ["オンフィールドアタッカー"], energy: 80, talent_boss: "ボコボコダック", local_specialty: "フロストランプ", ascension_stat: "会心ダメージ", distributed: false, talent_book: "流浪", talent_weekly: "昇揚のサンプル「王族」", special_dish: "回復系", trace: false, costume: false, release_version: "Luna I (6.0)" },
        { name: "アイノ", country: "ナドクライ", weapon: "両手剣", element: "水", birth_month: "９月", birthday: "9月21日", version: "n.0", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドサポーター"], energy: 50, talent_boss: "ボコボコダック", local_specialty: "携行型ベアリング", ascension_stat: "元素熟知", distributed: true, talent_book: "楽園", talent_weekly: "絹織りの羽", special_dish: "復活系", trace: false, costume: false, release_version: "Luna I (6.0)" },
        { name: "ラウマ", country: "ナドクライ", weapon: "法器", element: "草", birth_month: "３月", birthday: "3月1日", version: "n.0", rarity: ['☆５'], body: "長身女性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "集光の幻月蝶", local_specialty: "月落銀", ascension_stat: "元素熟知", distributed: false, talent_book: "月光", talent_weekly: "蝕滅の羽鱗", special_dish: "継続回復系", trace: false, costume: false, release_version: "Luna I (6.0)" },
        { name: "ネフェル", country: "ナドクライ", weapon: "法器", element: "草", birth_month: "５月", birthday: "5月9日", version: "n.1", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "霜夜の空を巡る霊主", local_specialty: "月落銀", ascension_stat: "会心ダメージ", distributed: false, talent_book: "楽園", talent_weekly: "昇揚のサンプル「ルーク」", special_dish: "復活系", trace: false, costume: false, release_version: "Luna II (6.1)" },
        { name: "ヤフォダ", country: "ナドクライ", weapon: "弓", element: "風", birth_month: "１月", birthday: "1月5日", version: "n.3", rarity: ['☆４'], body: "中身女性", role: ["オフフィールドライフキーパー"], energy: 70, talent_boss: "集光の幻月蝶", local_specialty: "携行型ベアリング", ascension_stat: "与える治療効果", distributed: true, talent_book: "流浪", talent_weekly: "昇揚のサンプル「ナイト」", special_dish: "回復系", trace: false, costume: false, release_version: "Luna III (6.2)" },
        { name: "コロンビーナ", country: "ナドクライ", weapon: "法器", element: "水", birth_month: "１月", birthday: "1月14日", version: "n.4", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "霜夜の空を巡る霊主", local_specialty: "ヴィンテル草", ascension_stat: "会心率", distributed: false, talent_book: "月光", talent_weekly: "賢医の仮面", special_dish: "HP強化系", trace: false, costume: false, release_version: "Luna IV (6.3)" },
        { name: "イルーガ", country: "ナドクライ", weapon: "長柄武器", element: "岩", birth_month: "１２月", birthday: "12月23日", version: "n.4", rarity: ['☆４'], body: "中身男性", role: ["オフフィールドサポーター"], energy: 60, talent_boss: "重量級陸巡艦「バトルシップ」", local_specialty: "琥珀香", ascension_stat: "元素熟知", distributed: false, talent_book: "楽園", talent_weekly: "蝕滅の焔角", special_dish: "回復系", trace: false, costume: false, release_version: "Luna IV (6.3)" },
        { name: "リンネア", country: "ナドクライ", weapon: "弓", element: "岩", birth_month: "５月", birthday: "5月23日", version: "n.5", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドアタッカー","オフフィールドライフキーパー"], energy: 60, talent_boss: "守護者・堕天", local_specialty: "フェザーモス", ascension_stat: "会心率", distributed: false, talent_book: "流浪", talent_weekly: "異端の薬瓶", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "Luna VI (6.5)" },
        { name: "旅人", country: "例外", weapon: "片手剣", element: "その他", birth_month: "その他", birthday: "なし", version: "n.0", rarity: ['☆５'], body: ["中身男性", "中身女性"], role: ["オンフィールドアタッカー", "オフフィールドアタッカー"], energy: 60, talent_boss: "", local_specialty: "風車アスター", ascension_stat: "攻撃力", displayNames: ["空", "蛍", "風旅人", "水旅人", "草旅人", "炎旅人", "雷旅人"], distributed: true, talent_book: "自由/繁栄/浮世/忠言/公平/焚燼/抗争/勤労/風雅/創意/正義/詩文/黄金/天光/篤行/紛争", talent_weekly: "東風の吐息/北風のしっぽ/凶将の手眼/天地に映える蕨/龍王の冠", special_dish: "", trace: false, costume: true, release_version: "1.0" },
        { name: "スカーク", country: "例外", weapon: "片手剣", element: "氷", birth_month: "１１月", birthday: "11月5日", version: "n.7", rarity: ['☆５'], body: "長身女性", role: ["オンフィールドアタッカー"], energy: 0, talent_boss: "深淵なるミミック・パピラ", local_specialty: "岩裂の花", ascension_stat: "会心ダメージ", distributed: false, talent_book: "角逐", talent_weekly: "昇揚のサンプル「ナイト」", special_dish: "回復系", trace: false, costume: false, release_version: "5.7" },
        { name: "ドール", country: "例外", weapon: "片手剣", element: "その他", birth_month: "その他", birthday: "なし", version: "n.2", rarity: ['☆５'], body: ["中身男性", "中身女性"], role: ["オンフィールドアタッカー"], energy: 60, talent_boss: "", local_specialty: "", ascension_stat: "攻撃力", distributed: false, talent_book: "", talent_weekly: "", special_dish: "", trace: false, costume: false , release_version: "Luna II (6.1)"},
        { name: "アーロイ", country: "例外", weapon: "弓", element: "氷", birth_month: "４月", birthday: "4月4日", version: "n.2", rarity: ['☆５'], body: "中身女性", role: ["オンフィールドアタッカー"], energy: 40, talent_boss: "無相の氷", local_specialty: "晶化骨髄", ascension_stat: "氷元素ダメージ", distributed: true, talent_book: "自由", talent_weekly: "溶滅の刻", special_dish: "回復系", trace: false, costume: false, release_version: "2.1" },
        { name: "ニコ", country: "例外", weapon: "法器", element: "炎", birth_month: "９月", birthday: "9月29日", version: "n.6", rarity: ['☆５'], body: "中身女性", role: ["オフフィールドサポーター","オフフィールドライフキーパー"], energy: "60", talent_boss: "昏き魘夢の主", local_specialty: "琥珀香", ascension_stat: "攻撃力", distributed: false, talent_book: "楽園", talent_weekly: "偽りの樹脂", special_dish: "スタミナ回復系", trace: false, costume: false, release_version: "Luna VII (6.6)" },
        { name: "ローエン", country: "モンド", weapon: "長柄武器", element: "氷", birth_month: "", birthday: "", version: "n.6", rarity: ['☆５'], body: "中身男性", role: ["オンフィールドアタッカー"], energy: "", talent_boss: "集光の月ヤモリ", local_specialty: "フェザーモス", ascension_stat: "", distributed: false, talent_book: "抗争", talent_weekly: "昇揚のサンプル「ナイト」", special_dish: "", trace: false, costume: false, release_version: "Luna VII (6.6)" },
        { name: "プルーネ", country: "モンド", weapon: "法器", element: "風", birth_month: "１１月", birthday: "11月20日", version: "n.6", rarity: ['☆４'], body: "ロリ", role: ["オフフィールドサポーター"], energy:"70" , talent_boss: "霜夜の空を巡る霊主", local_specialty: "ヴィンテル草", ascension_stat: "攻撃力", distributed: false, talent_book: "抗争", talent_weekly: "賢医の仮面", special_dish: "スタミナ軽減系", trace: false, costume: false, release_version: "Luna VII (6.6)" }
    ];
    const enemyMaterialMap = {
        "スライムの液体": ["ウェンティ", "鍾離", "魈", "荒瀧一斗", "コロンビーナ", "リサ", "香菱", "ヨォーヨ", "嘉明"],
        "宝探しの鴉マーク": ["楓原万葉", "ガイア", "北斗", "ベネット", "辛炎", "煙緋", "トーマ", "鹿野院平蔵", "プルーネ"],
        "占いの絵巻": ["旅人", "七七", "クレー", "アルベド", "宵宮", "セノ", "閑雲", "バーバラ", "レイラ"],
        "新兵の記章": ["ディルック", "タルタリヤ", "夜蘭", "リネ", "アルレッキーノ", "凝光", "ロサリア", "ミカ"],
        "フライムの乾核": ["珊瑚宮心海", "アーロイ", "千織", "ゴロー", "久岐忍", "綺良々"],
        "牢固な矢先": ["アンバー", "フィッシュル", "ディオナ", "コレイ", "ダリア"],
        "破損した仮面": ["旅人", "ジン", "エウルア", "レザー", "行秋", "ノエル", "重雲", "九条裟羅", "雲菫"],
        "キノコンの胞子": ["旅人", "ティナリ", "ニィロウ", "ナヒーダ", "白朮", "カーヴェ"],
        "古びた鍔": ["神里綾華", "雷電将軍", "八重神子", "神里綾人", "放浪者", "夢見月瑞希"],
        "トリックフラワーの蜜": ["モナ", "刻晴", "甘雨", "胡桃", "申鶴", "フリーナ", "スクロース", "早柚", "藍硯"],
        "色褪せた赤い絹": ["アルハイゼン", "ディシア", "ドリー", "キャンディス", "ファルザン", "セトス"],
        "異海の露": ["旅人", "ヌヴィレット", "ナヴィア", "クロリンデ", "シグウィン", "フレミネ"],
        "整合の歯車": ["リオセスリ", "エミリエ", "エスコフィエ", "スカーク", "リネット", "シャルロット", "シュヴルーズ"],
        "未熟な牙": ["キィニチ", "チャスカ", "シトラリ", "ヴァレサ", "オロルン", "イファ"],
        "従戦士の木笛": ["ムアラニ", "シロネン", "マーヴィカ", "イネファ", "旅人", "カチーナ", "イアンサ"],
        "破損した駆動軸": ["フリンズ", "ファルカ", "アイノ", "ヤフォダ", "イルーガ"],
        "破損した徽章": ["ラウマ", "ネフェル", "ドゥリン", "兹白", "リンネア", "ニコ"]
    };
    const enemyMaterialByCharacter = {};
    Object.entries(enemyMaterialMap).forEach(([material, names]) => {
        names.forEach(name => {
            if (!enemyMaterialByCharacter[name]) enemyMaterialByCharacter[name] = [];
            enemyMaterialByCharacter[name].push(material);
        });
    });
    characters.forEach(char => {
        char.enemy_material = enemyMaterialByCharacter[char.name] || [];
    });
    const trainingRoadCharacterNames = new Set([
        "ジン", "ディルック", "七七", "モナ", "刻晴", "クレー", "タルタリヤ", "アルベド", "甘雨", "魈",
        "胡桃", "エウルア", "神里綾華", "宵宮", "珊瑚宮心海", "荒瀧一斗", "申鶴", "八重神子", "神里綾人", "ティナリ",
        "セノ", "ニィロウ", "放浪者", "ディシア", "白朮"
    ]);
    characters.forEach(char => {
        char.training_road = trainingRoadCharacterNames.has(char.name);
    });

    const allWeapons = {
        "長柄武器": [
            { name: "聖祭者の輝杖", rarity: 4, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "血染めの荒れ地", rarity: 5, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "金堀りのシャベル", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "香りのシンフォニスト", rarity: 5, type: "長柄武器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "砕け散る光輪", rarity: 5, type: "長柄武器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "玉響停の御噺", rarity: 4, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "鎮山の釘", rarity: 4, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "虹の行方", rarity: 4, type: "長柄武器", ascension_stat: "防御力", is_distributed: false },
            { name: "ルミドゥースの挽歌", rarity: 5, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "赤月のシルエット", rarity: 5, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "砂中の賢者達の問答", rarity: 4, type: "長柄武器", ascension_stat: "HP", is_distributed: true },
            { name: "プロスペクタードリル", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "フィヨルドの歌", rarity: 4, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "正義の報酬", rarity: 4, type: "長柄武器", ascension_stat: "HP", is_distributed: false },
            { name: "赤砂の杖", rarity: 5, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "風信の矛", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: true },
            { name: "ムーンピアサー", rarity: 4, type: "長柄武器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "ドラゴンスピア", rarity: 4, type: "長柄武器", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "黒纓槍", rarity: 3, type: "長柄武器", ascension_stat: "HP", is_distributed: false },
            { name: "黒岩の突槍", rarity: 4, type: "長柄武器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "鉄尖槍", rarity: 2, type: "長柄武器", ascension_stat: "", is_distributed: false },
            { name: "鉾槍", rarity: 3, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "破天の槍", rarity: 5, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "星鎌・試作", rarity: 4, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "西風長槍", rarity: 4, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "草薙の稲光", rarity: 5, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "白纓槍", rarity: 3, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "流月の針", rarity: 4, type: "長柄武器", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "新米の長槍", rarity: 1, type: "長柄武器", ascension_stat: "", is_distributed: false },
            { name: "斬波のひれ長", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "護摩の杖", rarity: 5, type: "長柄武器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "息災", rarity: 5, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "旧貴族猟槍", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "天空の脊", rarity: 5, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "喜多院十文字槍", rarity: 4, type: "長柄武器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "和璞鳶", rarity: 5, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "千岩長槍", rarity: 4, type: "長柄武器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "「漁獲」", rarity: 4, type: "長柄武器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "匣中滅龍", rarity: 4, type: "長柄武器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "死闘の槍", rarity: 4, type: "長柄武器", ascension_stat: "会心率", is_distributed: false },
            { name: "災憾", rarity: 5, type: "長柄武器", ascension_stat: "", is_distributed: false }
        ],
        "法器": [
            { name: "帳の夜曲", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "真言の匣", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "霜辰", rarity: 4, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "夜を紡ぐ天鏡", rarity: 5, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "天光のリュート", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "烏髄の孤灯", rarity: 4, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "ヴィヴィッド・ハート", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "寝正月の初晴", rarity: 5, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "祭星者の眺め", rarity: 5, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "波乗りの旋回", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "ヤシュチェの環", rarity: 4, type: "法器", ascension_stat: "HP", is_distributed: false },
            { name: "蒼紋の角杯", rarity: 4, type: "法器", ascension_stat: "HP", is_distributed: true },
            { name: "サーフィンタイム", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "鶴鳴の余韻", rarity: 5, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "凛流の監視者", rarity: 5, type: "法器", ascension_stat: "会心率", is_distributed: false },
            { name: "久遠流転の大典", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "果てなき紺碧の唄", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "古祠の瓏", rarity: 4, type: "法器", ascension_stat: "会心率", is_distributed: false },
            { name: "純水流華", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "碧落の瓏", rarity: 5, type: "法器", ascension_stat: "HP", is_distributed: false },
            { name: "トゥライトゥーラの記憶", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "千夜に浮かぶ夢", rarity: 5, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "彷徨える星", rarity: 4, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "満悦の実", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "黒岩の緋玉", rarity: 4, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "魔導緒論", rarity: 3, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "金珀・試作", rarity: 4, type: "法器", ascension_stat: "HP", is_distributed: false },
            { name: "誓いの明瞳", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: true },
            { name: "龍殺しの英傑譚", rarity: 3, type: "法器", ascension_stat: "HP", is_distributed: false },
            { name: "西風秘典", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "翡玉法珠", rarity: 3, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "祭礼の断片", rarity: 4, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "神楽の真意", rarity: 5, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "白辰の輪", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "特級の宝玉", rarity: 3, type: "法器", ascension_stat: "会心率", is_distributed: false },
            { name: "流浪楽章", rarity: 4, type: "法器", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "ダークアレイの酒と詩", rarity: 4, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "昭心", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "冬忍びの実", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "異世界旅行記", rarity: 3, type: "法器", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "浮世の錠", rarity: 5, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "旧貴族秘法録", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "生徒ノート", rarity: 1, type: "法器", ascension_stat: "", is_distributed: false },
            { name: "天空の巻", rarity: 5, type: "法器", ascension_stat: "攻撃力", is_distributed: false },
            { name: "四風原典", rarity: 5, type: "法器", ascension_stat: "会心率", is_distributed: false },
            { name: "ドドコの物語", rarity: 4, type: "法器", ascension_stat: "攻撃力", is_distributed: true },
            { name: "ポケット魔導書", rarity: 2, type: "法器", ascension_stat: "", is_distributed: false },
            { name: "匣中日月", rarity: 4, type: "法器", ascension_stat: "会心率", is_distributed: false },
            { name: "不滅の月華", rarity: 5, type: "法器", ascension_stat: "HP", is_distributed: false },
            { name: "万国諸海の図譜", rarity: 4, type: "法器", ascension_stat: "元素熟知", is_distributed: false },
            { name: "塵と光の七つの誓約", rarity: 5, type: "法器", ascension_stat: "攻撃力", is_distributed: false }
        ],
        "弓": [
            { name: "霜契の金枝", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "暁を告げる歴史", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "虹蛇の雨弦", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "羅網の針", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "冷寂の音", rarity: 4, type: "弓", ascension_stat: "HP", is_distributed: true },
            { name: "星鷲の紅き羽", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "花飾りの羽", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "チェーンブレイカー", rarity: 4, type: "弓", ascension_stat: "", is_distributed: false },
            { name: "築雲", rarity: 4, type: "弓", ascension_stat: "元素熟知", is_distributed: true },
            { name: "白雨心弦", rarity: 5, type: "弓", ascension_stat: "HP", is_distributed: false },
            { name: "レンジゲージ", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "烈日の後嗣", rarity: 4, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "静寂の唄", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "始まりの大魔術", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "トキの嘴", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: true },
            { name: "王の近侍", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "竭沢", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "狩人の道", rarity: 5, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "落霞", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "若水", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "黒岩の戦弓", rarity: 4, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "鴉羽の弓", rarity: 3, type: "弓", ascension_stat: "元素熟知", is_distributed: false },
            { name: "飛来の鳴弦", rarity: 5, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "風花の頌歌", rarity: 4, type: "弓", ascension_stat: "元素熟知", is_distributed: true },
            { name: "アモスの弓", rarity: 5, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "リングボウ", rarity: 4, type: "弓", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "澹月・試作", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "西風猟弓", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "蒼翠の狩猟弓", rarity: 4, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "絶弦", rarity: 4, type: "弓", ascension_stat: "元素熟知", is_distributed: false },
            { name: "終焉を嘆く詩", rarity: 5, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "祭礼の弓", rarity: 4, type: "弓", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "シャープシューターの誓い", rarity: 3, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "破魔の弓", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "狩猟弓", rarity: 1, type: "弓", ascension_stat: "", is_distributed: false },
            { name: "曚雲の月", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "ダークアレイの狩人", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "プレデター", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "弾弓", rarity: 3, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "弓蔵", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "幽夜のワルツ", rarity: 4, type: "弓", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "旧貴族長弓", rarity: 4, type: "弓", ascension_stat: "攻撃力", is_distributed: false },
            { name: "天空の翼", rarity: 5, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "リカーブボウ", rarity: 3, type: "弓", ascension_stat: "HP", is_distributed: false },
            { name: "歴戦の狩猟弓", rarity: 2, type: "弓", ascension_stat: "", is_distributed: false },
            { name: "冬極の白星", rarity: 5, type: "弓", ascension_stat: "会心率", is_distributed: false },
            { name: "文使い", rarity: 3, type: "弓", ascension_stat: "会心ダメージ", is_distributed: false }
        ],
        "両手剣": [
            { name: "狼の武勲詩", rarity: 5, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "万能の鍵", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "千烈の日輪", rarity: 5, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "実りの鉤鉈", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "アースシェイカー", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "山の王の長牙", rarity: 5, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "「スーパーアルティメット覇王魔剣」", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "裁断", rarity: 5, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "携帯型チェンソー", rarity: 4, type: "両手剣", ascension_stat: "HP", is_distributed: false },
            { name: "話死合い棒", rarity: 4, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "タイダル・シャドー", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "葦海の標", rarity: 5, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "鉄彩の花", rarity: 4, type: "両手剣", ascension_stat: "元素熟知", is_distributed: true },
            { name: "マカイラの水色", rarity: 4, type: "両手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "森林のレガリア", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "黒岩の斬刀", rarity: 4, type: "両手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "飛天大御剣", rarity: 3, type: "両手剣", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "雪葬の星銀", rarity: 4, type: "両手剣", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "雨裁", rarity: 4, type: "両手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "鉄影段平", rarity: 3, type: "両手剣", ascension_stat: "HP", is_distributed: false },
            { name: "鐘の剣", rarity: 4, type: "両手剣", ascension_stat: "HP", is_distributed: false },
            { name: "赤角石塵滅砕", rarity: 5, type: "両手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "古華・試作", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "訓練用大剣", rarity: 1, type: "両手剣", ascension_stat: "", is_distributed: false },
            { name: "西風大剣", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "銜玉の海皇", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: true },
            { name: "螭龍の剣", rarity: 4, type: "両手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "祭礼の大剣", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "白鉄の大剣", rarity: 3, type: "両手剣", ascension_stat: "防御力", is_distributed: false },
            { name: "白影の剣", rarity: 4, type: "両手剣", ascension_stat: "防御力", is_distributed: false },
            { name: "狼の末路", rarity: 5, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "龍血を浴びた剣", rarity: 3, type: "両手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "桂木斬長正", rarity: 4, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "松韻の響く頃", rarity: 5, type: "両手剣", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "無工の剣", rarity: 5, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "惡王丸", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "旧貴族大剣", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "天空の傲", rarity: 5, type: "両手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "千岩古剣", rarity: 4, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "知恵の溶炎", rarity: 4, type: "両手剣", ascension_stat: "元素熟知", is_distributed: true },
            { name: "傭兵の重剣", rarity: 2, type: "両手剣", ascension_stat: "", is_distributed: false },
            { name: "理屈責め", rarity: 3, type: "両手剣", ascension_stat: "攻撃力", is_distributed: false }
        ],
        "片手剣": [
            { name: "三日月の含光", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "黒蝕", rarity: 5, type: "片手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "月紡ぎの曙光", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "静謐の笛", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "厄水の災い", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: true },
            { name: "岩峰を巡る歌", rarity: 5, type: "片手剣", ascension_stat: "防御力", is_distributed: false },
            { name: "ストロングボーン", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "エズピツァルの笛", rarity: 4, type: "片手剣", ascension_stat: "防御力", is_distributed: false },
            { name: "赦罪", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "有楽御簾切", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "水仙十字の剣", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "静水流転の輝き", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "船渠剣", rarity: 4, type: "片手剣", ascension_stat: "HP", is_distributed: false },
            { name: "狼牙", rarity: 4, type: "片手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "サーンドルの渡し守", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "海淵のフィナーレ", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "翠光の裁葉", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "東花坊時雨", rarity: 4, type: "片手剣", ascension_stat: "元素熟知", is_distributed: true },
            { name: "サイフォスの月明かり", rarity: 4, type: "片手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "聖顕の鍵", rarity: 5, type: "片手剣", ascension_stat: "HP", is_distributed: false },
            { name: "原木刀", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "籠釣瓶一心", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "黒岩の長剣", rarity: 4, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "黒剣", rarity: 4, type: "片手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "黎明の神剣", rarity: 3, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "飛天御剣", rarity: 3, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "風鷹剣", rarity: 5, type: "片手剣", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "霧切の廻光", rarity: 5, type: "片手剣", ascension_stat: "会心ダメージ", is_distributed: false },
            { name: "降臨の剣", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "銀の剣", rarity: 2, type: "片手剣", ascension_stat: "", is_distributed: false },
            { name: "鉄蜂の刺し", rarity: 4, type: "片手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "シナバースピンドル", rarity: 4, type: "片手剣", ascension_stat: "防御力", is_distributed: true },
            { name: "斬岩・試作", rarity: 4, type: "片手剣", ascension_stat: "物理ダメージ", is_distributed: false },
            { name: "西風剣", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "蒼古なる自由への誓い", rarity: 5, type: "片手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "腐食の剣", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: true },
            { name: "笛の剣", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "祭礼の剣", rarity: 4, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "盤岩結緑", rarity: 5, type: "片手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "波乱月白経津", rarity: 5, type: "片手剣", ascension_stat: "会心率", is_distributed: false },
            { name: "暗鉄剣", rarity: 3, type: "片手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "ダークアレイの閃光", rarity: 4, type: "片手剣", ascension_stat: "元素熟知", is_distributed: false },
            { name: "無鋒の剣", rarity: 1, type: "片手剣", ascension_stat: "", is_distributed: false },
            { name: "旅道の剣", rarity: 3, type: "片手剣", ascension_stat: "防御力", is_distributed: false },
            { name: "斬山の刃", rarity: 5, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "旧貴族長剣", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "天空の刃", rarity: 5, type: "片手剣", ascension_stat: "元素チャージ効率", is_distributed: false },
            { name: "天目影打", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "チ虎魚の刀", rarity: 3, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "匣中龍吟", rarity: 4, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "冷刃", rarity: 3, type: "片手剣", ascension_stat: "攻撃力", is_distributed: false },
            { name: "蒼耀", rarity: 5, type: "片手剣", ascension_stat: "会心率", is_distributed: false }
        ]
    };

    const weaponReleaseVersionMap = {
        "狩猟弓": "1.0",
        "無鋒の剣": "1.0",
        "新米の長槍": "1.0",
        "訓練用大剣": "1.0",
        "生徒ノート": "1.0",
        "歴戦の狩猟弓": "1.0",
        "銀の剣": "1.0",
        "鉄尖槍": "1.0",
        "傭兵の重剣": "1.0",
        "ポケット魔導書": "1.0",
        "文使い": "1.0",
        "鴉羽の弓": "1.0",
        "リカーブボウ": "1.0",
        "シャープシューターの誓い": "1.0",
        "弾弓": "1.0",
        "冷刃": "1.0",
        "暗鉄剣": "1.0",
        "チ虎魚の刀": "1.0",
        "黎明の神剣": "1.0",
        "飛天御剣": "1.0",
        "旅道の剣": "1.0",
        "黒纓槍": "1.0",
        "鉾槍": "1.0",
        "白纓槍": "1.0",
        "龍血を浴びた剣": "1.0",
        "理屈責め": "1.0",
        "鉄影段平": "1.0",
        "飛天大御剣": "1.0",
        "白鉄の大剣": "1.0",
        "翡玉法珠": "1.0",
        "魔導緒論": "1.0",
        "異世界旅行記": "1.0",
        "龍殺しの英傑譚": "1.0",
        "特級の宝玉": "1.0",
        "黒岩の戦弓": "1.0",
        "リングボウ": "1.0",
        "西風猟弓": "1.0",
        "澹月・試作": "1.0",
        "旧貴族長弓": "1.0",
        "弓蔵": "1.0",
        "祭礼の弓": "1.0",
        "絶弦": "1.0",
        "蒼翠の狩猟弓": "1.0",
        "黒岩の長剣": "1.0",
        "西風剣": "1.0",
        "鉄蜂の刺し": "1.0",
        "匣中龍吟": "1.0",
        "斬岩・試作": "1.0",
        "旧貴族長剣": "1.0",
        "祭礼の剣": "1.0",
        "降臨の剣": "1.0",
        "黒剣": "1.0",
        "笛の剣": "1.0",
        "黒岩の突槍": "1.0",
        "流月の針": "1.0",
        "死闘の槍": "1.0",
        "匣中滅龍": "1.0",
        "西風長槍": "1.0",
        "星鎌・試作": "1.0",
        "黒岩の斬刀": "1.0",
        "西風大剣": "1.0",
        "古華・試作": "1.0",
        "雨裁": "1.0",
        "旧貴族大剣": "1.0",
        "祭礼の大剣": "1.0",
        "螭龍の剣": "1.0",
        "鐘の剣": "1.0",
        "白影の剣": "1.0",
        "黒岩の緋玉": "1.0",
        "昭心": "1.0",
        "西風秘典": "1.0",
        "万国諸海の図譜": "1.0",
        "金珀・試作": "1.0",
        "旧貴族秘法録": "1.0",
        "祭礼の断片": "1.0",
        "匣中日月": "1.0",
        "流浪楽章": "1.0",
        "アモスの弓": "1.0",
        "天空の翼": "1.0",
        "風鷹剣": "1.0",
        "天空の刃": "1.0",
        "和璞鳶": "1.0",
        "天空の脊": "1.0",
        "天空の傲": "1.0",
        "狼の末路": "1.0",
        "四風原典": "1.0",
        "天空の巻": "1.0",
        "浮世の錠": "1.1",
        "破天の槍": "1.1",
        "無工の剣": "1.1",
        "旧貴族猟槍": "1.1",
        "斬山の刃": "1.2",
        "腐食の剣": "1.2",
        "雪葬の星銀": "1.2",
        "ドラゴンスピア": "1.2",
        "冬忍びの実": "1.2",
        "千岩長槍": "1.3",
        "千岩古剣": "1.3",
        "盤岩結緑": "1.3",
        "護摩の杖": "1.3",
        "終焉を嘆く詩": "1.4",
        "ダークアレイの閃光": "1.4",
        "ダークアレイの狩人": "1.4",
        "ダークアレイの酒と詩": "1.4",
        "風花の頌歌": "1.4",
        "松韻の響く頃": "1.5",
        "蒼古なる自由への誓い": "1.6",
        "幽夜のワルツ": "1.6",
        "ドドコの物語": "1.6",
        "霧切の廻光": "2.0",
        "飛来の鳴弦": "2.0",
        "破魔の弓": "2.0",
        "天目影打": "2.0",
        "喜多院十文字槍": "2.0",
        "桂木斬長正": "2.0",
        "白辰の輪": "2.0",
        "草薙の稲光": "2.1",
        "不滅の月華": "2.1",
        "銜玉の海皇": "2.1",
        "「漁獲」": "2.1",
        "冬極の白星": "2.2",
        "惡王丸": "2.2",
        "斬波のひれ長": "2.2",
        "曚雲の月": "2.2",
        "赤角石塵滅砕": "2.3",
        "シナバースピンドル": "2.3",
        "息災": "2.4",
        "神楽の真意": "2.5",
        "誓いの明瞳": "2.5",
        "波乱月白経津": "2.6",
        "若水": "2.7",
        "落霞": "2.7",
        "籠釣瓶一心": "2.8",
        "狩人の道": "3.0",
        "竭沢": "3.0",
        "原木刀": "3.0",
        "森林のレガリア": "3.0",
        "ムーンピアサー": "3.0",
        "満悦の実": "3.0",
        "王の近侍": "3.0",
        "赤砂の杖": "3.1",
        "聖顕の鍵": "3.1",
        "サイフォスの月明かり": "3.1",
        "マカイラの水色": "3.1",
        "彷徨える星": "3.1",
        "風信の矛": "3.1",
        "千夜に浮かぶ夢": "3.2",
        "トゥライトゥーラの記憶": "3.3",
        "東花坊時雨": "3.3",
        "翠光の裁葉": "3.4",
        "葦海の標": "3.5",
        "鉄彩の花": "3.5",
        "碧落の瓏": "3.6",
        "トキの嘴": "3.7",
        "始まりの大魔術": "4.0",
        "海淵のフィナーレ": "4.0",
        "タイダル・シャドー": "4.0",
        "正義の報酬": "4.0",
        "純水流華": "4.0",
        "静寂の唄": "4.0",
        "狼牙": "4.0",
        "話死合い棒": "4.0",
        "古祠の瓏": "4.0",
        "フィヨルドの歌": "4.0",
        "烈日の後嗣": "4.0",
        "サーンドルの渡し守": "4.0",
        "久遠流転の大典": "4.1",
        "凛流の監視者": "4.1",
        "船渠剣": "4.1",
        "携帯型チェンソー": "4.1",
        "プロスペクタードリル": "4.1",
        "レンジゲージ": "4.1",
        "果てなき紺碧の唄": "4.1",
        "静水流転の輝き": "4.2",
        "水仙十字の剣": "4.2",
        "裁断": "4.3",
        "「スーパーアルティメット覇王魔剣」": "4.3",
        "鶴鳴の余韻": "4.4",
        "有楽御簾切": "4.5",
        "砂中の賢者達の問答": "4.5",
        "赤月のシルエット": "4.6",
        "赦罪": "4.7",
        "白雨心弦": "4.7",
        "築雲": "4.7",
        "ルミドゥースの挽歌": "4.8",
        "山の王の長牙": "5.0",
        "サーフィンタイム": "5.0",
        "エズピツァルの笛": "5.0",
        "アースシェイカー": "5.0",
        "虹の行方": "5.0",
        "ヤシュチェの環": "5.0",
        "チェーンブレイカー": "5.0",
        "蒼紋の角杯": "5.0",
        "岩峰を巡る歌": "5.1",
        "ストロングボーン": "5.1",
        "鎮山の釘": "5.1",
        "実りの鉤鉈": "5.1",
        "星鷲の紅き羽": "5.2",
        "花飾りの羽": "5.2",
        "波乗りの旋回": "5.2",
        "厄水の災い": "5.2",
        "千烈の日輪": "5.3",
        "祭星者の眺め": "5.3",
        "玉響停の御噺": "5.4",
        "寝正月の初晴": "5.4",
        "ヴィヴィッド・ハート": "5.5",
        "香りのシンフォニスト": "5.6",
        "冷寂の音": "5.6",
        "蒼耀": "5.7",
        "砕け散る光輪": "5.8",
        "知恵の溶炎": "5.8",
        "プレデター": "2.1",
        "夜を紡ぐ天鏡": "Luna I (6.0)",
        "月紡ぎの曙光": "Luna I (6.0)",
        "血染めの荒れ地": "Luna I (6.0)",
        "静謐の笛": "Luna I (6.0)",
        "万能の鍵": "Luna I (6.0)",
        "金堀りのシャベル": "Luna I (6.0)",
        "烏髄の孤灯": "Luna I (6.0)",
        "羅網の針": "Luna I (6.0)",
        "天光のリュート": "Luna I (6.0)",
        "聖祭者の輝杖": "Luna II (6.1)",
        "霜辰": "Luna II (6.1)",
        "真言の匣": "Luna II (6.1)",
        "黒蝕": "Luna III (6.2)",
        "暁を告げる歴史": "Luna III (6.2)",
        "虹蛇の雨弦": "Luna III (6.2)",
        "帳の夜曲": "Luna IV (6.3)",
        "三日月の含光": "Luna IV (6.3)",
        "狼の武勲詩": "Luna V (6.4)",
        "霜契の金枝": "Luna VI (6.5)",
        "塵と光の七つの誓約": "Luna VII (6.6)",
        "災憾": "Luna VII (6.6)"
    };
    const weaponReleaseOrderMap = Object.fromEntries(
        Object.keys(weaponReleaseVersionMap).map((weaponName, index) => [weaponName, index])
    );

    Object.values(allWeapons).flat().forEach(weapon => {
        weapon.release_version = weaponReleaseVersionMap[weapon.name] || weapon.release_version || '';
    });

    const bosses = [
        "アビサルヴィシャップ",
        "チャールデリック",
        "マハーヴァスデヴァーヤヴァ太子",
        "アペプ",
        "アンドリアス",
        "エンシェントヴィシャップ・岩",
        "キング＆クイーン",
        "グーシートース",
        "ボコボコダック",
        "マッシュラプトル",
        "兆載永劫ドレイク",
        "公子",
        "千年真珠の海駿",
        "半永久統制マトリックス",
        "召使",
        "吞星の鯨",
        "実験用フィールド生成装置",
        "山の王・貪食のユムカ竜",
        "山隠れの猊獣",
        "急凍樹",
        "恒常からくり陣形",
        "暴君・金焔のクク竜",
        "正機の神",
        "水形タルパ",
        "氷風組曲・コッペリア",
        "氷風組曲・コペリウス",
        "淑女",
        "深淵なるミミックパピラ",
        "深罪の浸礼者",
        "無相の岩",
        "無相の水",
        "無相の氷",
        "無相の炎",
        "無相の草",
        "無相の雷",
        "無相の風",
        "爆炎樹",
        "禍津御建鳴神命",
        "秘源機兵・機構デバイス",
        "秘源機兵・統御デバイス",
        "純水精霊",
        "若陀龍王",
        "輝ける溶岩の龍像",
        "迅電樹",
        "迷える霊覚の修権者",
        "遺跡サーペント",
        "鉄甲熔炎帝王",
        "集光の幻月蝶",
        "雷音権現",
        "風食ウェネト",
        "魔偶剣鬼",
        "ヴィヴィアン",
        "ニニアン",
        "スパコン",
        "リアム",
        "ロッキー",
        "ディアンナラ",
        "シネアス",
        "異色三連星",
        "コシーホ",
        "ジャプー",
        "赤璋巡岳府君",
        "バラチコ",
        "銅の錠",
        "リライ",
        "ピーク",
        "「戦羊」と「鉄爪」",
        "微末",
        "最後のテノチズトク人",
        "シグルド",
        "カニ皇帝",
        "ラスコルニコフ",
        "十六倍マンドラゴラ",
        "ハイジェード",
        "故郷を偲ぶ孤独の狼",
        "魔像レガトゥス",
        "守護者・堕天",
        "黄金王獣",
        "ドットーレ"
    ];
    const weeklyBosses = ["ドットーレ","博士","グーシートース", "キング＆クイーン", "召使", "吞星の鯨", "アペプ", "正機の神", "若陀龍王", "禍津御建鳴神命", "アンドリアス", "淑女", "公子"];
    const elementColors = { "水": "#00c0fe", "炎": "#fe6640", "雷": "#cc85ff", "氷": "#74E4E2", "風": "#36d6a0", "岩": "#F3AC11", "草": "#8dcc06", "その他": "#808080" };
    const ownership100Characters = ["香菱", "旅人", "ガイア", "バーバラ", "コレイ", "ノエル", "リサ", "アンバー"];
    const initialCharacters = ["旅人", "リサ", "アンバー", "ガイア", "ノエル", "バーバラ", "レザー", "香菱", "北斗", "ベネット", "行秋", "凝光", "フィッシュル", "重雲", "スクロース", "ジン", "ディルック", "七七", "モナ", "刻晴", "ウェンティ", "クレー"];
    const alphabetData = {"A": ["アイノ", "荒瀧一斗", "アルベド", "アルレッキーノ", "アルハイゼン", "アンバー", "アーロイ"], "B": ["バーバラ", "白朮", "ベネット", "北斗"], "C": ["キャンディス", "コロンビーナ", "クロリンデ", "コレイ", "シャルロット", "シュヴルーズ", "シトラリ", "セノ", "千織", "チャスカ", "重雲"], "D": ["ドール", "ドゥリン", "ドリー", "ディシア", "ディルック", "ディオナ", "ダリア"], "E": ["エミリエ", "エウルア", "エスコフィエ"], "F": ["フリンズ", "ファルザン", "フリーナ", "フレミネ", "フィッシュル"], "G": ["嘉明", "甘雨", "ゴロー"], "H": ["胡桃"], "I": ["イルーガ", "イアンサ", "イファ", "イネファ"], "J": ["ヤフォダ", "ジン"], "K": ["神里綾華", "神里綾人", "キィニチ", "綺良々", "久岐忍", "九条裟羅", "クレー", "刻晴", "カチーナ", "カーヴェ"], "L": ["ラウマ", "リサ", "リネ", "リネット", "レイラ", "藍硯"], "M": ["ミカ", "ムアラニ", "モナ", "マーヴィカ"], "N": ["ネフェル","ナヴィア", "ナヒーダ", "ニィロウ", "ヌヴィレット", "ノエル"], "O": ["オロルン"], "Q": ["七七"], "R": ["雷電将軍", "レザー", "ロサリア", "リオセスリ"], "S": ["早柚", "珊瑚宮心海", "鹿野院平蔵", "シグウィン", "申鶴", "スクロース", "セトス", "スカーク"], "T": ["旅人", "ティナリ", "タルタリヤ", "トーマ"], "V": ["ウェンティ", "ヴァレサ","ファルカ"], "W": ["放浪者"], "X": ["行秋", "魈", "香菱", "辛炎", "シロネン", "閑雲"], "Y": ["煙緋", "夜蘭", "雲菫", "八重神子", "宵宮", "ヨォーヨ", "夢見月瑞希"], "Z": ["鍾離"]};

    const binds = ["☆４キャラ武器", "回復禁止", "恒常☆５縛り", "所持率100％縛り", "国縛り", "初期キャラのみ", "鍛錬の道縛り", "UI非表示+リロール", "誰か一人が倒れたら負け縛り", "無凸縛り", "キャラルーレット", "武器種縛り", "キャラ武器ルーレット", "聖遺物禁止", "爆発禁止+リロール", "旅人縛り", "モノ元素縛り", "各1.1縛り", "誕生月", "アルファベット縛り", "☆１、聖遺物なし", "武器縛り", "体型縛り", "役割縛り", "スキル禁止", "元素エネルギー縛り", "完凸禁止", "配布武器縛り", "配布キャラ縛り", "ボス素材縛り", "特産品縛り", "敵素材縛り", "クラウン禁止", "突破ステータス縛り(キャラ)", "突破ステータス縛り(武器)", "聖遺物セット禁止", "天賦素材縛り", "別衣装縛り", "オリジナル料理種別縛り", "軌跡ついてるキャラ縛り", "週ボス素材縛り"];
    
    const jpSort = (list) => [...list].sort((a, b) => String(a).localeCompare(String(b), 'ja'));

    const subRoulettes = {
        "国縛り": jpSort([...new Set(characters.map(c => c.country))]),
        "モノ元素縛り": jpSort([...new Set(characters.filter(c => c.element !== "その他").map(c => c.element))]),
        "武器種縛り": jpSort(Object.keys(allWeapons)),
        "誕生月": ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"],
        "各1.1縛り": jpSort([...new Set(characters.map(c => c.version))].filter(v => v !== 'その他')),
        "アルファベット縛り": Object.keys(alphabetData).sort(),
        "武器縛り": jpSort(Object.values(allWeapons).flat().map(w => w.name)),
        "体型縛り": ["長身男性", "長身女性", "中身男性", "中身女性", "ロリ"],
        "役割縛り": ["オンフィールドアタッカー", "オンフィールドサポーター", "オンフィールドライフキーパー", "オフフィールドアタッカー", "オフフィールドサポーター", "オフフィールドライフキーパー"],
        "元素エネルギー縛り": [0, 40, 50, 60, 70, 80, 90],
        "ボス素材縛り": jpSort([...new Set(characters.map(c => c.talent_boss).filter(b => b))]),
        "特産品縛り": jpSort([...new Set(characters.map(c => c.local_specialty).filter(l => l))]),
        "敵素材縛り": jpSort([...new Set(characters.flatMap(c => Array.isArray(c.enemy_material) ? c.enemy_material : (c.enemy_material ? [c.enemy_material] : [])))]),
        "突破ステータス縛り(キャラ)": jpSort([...new Set(characters.map(c => c.ascension_stat).filter(s => s))]),
        "突破ステータス縛り(武器)": jpSort([...new Set(Object.values(allWeapons).flat().map(w => w.ascension_stat).filter(s => s))]),
        "配布武器縛り": jpSort(Object.values(allWeapons).flat().filter(w => w.is_distributed).map(w => w.name)),
        "配布キャラ縛り": jpSort([...characters.filter(c => c.distributed).map(c => c.name), "周年配布☆５で選んだキャラ", "海灯祭で選んだキャラ"]),
        "天賦素材縛り": jpSort([...new Set(characters.map(c => c.talent_book).filter(b => b && !b.includes('/')))]),
        "オリジナル料理種別縛り": jpSort([...new Set(characters.map(c => c.special_dish).filter(d => d))]),
        "週ボス素材縛り": jpSort([...new Set(characters.map(c => c.talent_weekly).filter(w => w && !w.includes('/')))])
    };

    const playerBindTypes = ["キャラルーレット", "キャラ武器ルーレット", "武器縛り", "アルファベット縛り", "誕生月", "武器種縛り", "体型縛り", "役割縛り", "元素エネルギー縛り", "ボス素材縛り", "特産品縛り", "敵素材縛り", "突破ステータス縛り(キャラ)", "突破ステータス縛り(武器)", "配布キャラ縛り", "配布武器縛り", "天賦素材縛り", "別衣装縛り", "オリジナル料理種別縛り", "軌跡ついてるキャラ縛り", "週ボス素材縛り"];
    const bindPhaseOrder = { prerequisite: 0, equipment: 1, finalRoulette: 2 };
    const bindPhaseByName = {
        "武器種縛り": "equipment",
        "突破ステータス縛り(武器)": "equipment",
        "配布武器縛り": "equipment",
        "武器縛り": "equipment",
        "☆４キャラ武器": "equipment",
        "☆１、聖遺物なし": "equipment",
        "キャラルーレット": "finalRoulette",
        "キャラ武器ルーレット": "finalRoulette"
    };
    const bindPriorityByName = {
        "軌跡ついてるキャラ縛り": 0,
        "旅人縛り": 5,
        "初期キャラのみ": 10,
        "鍛錬の道縛り": 12,
        "所持率100％縛り": 15,
        "恒常☆５縛り": 20,
        "配布キャラ縛り": 25,
        "国縛り": 30,
        "モノ元素縛り": 35,
        "各1.1縛り": 40,
        "体型縛り": 45,
        "役割縛り": 50,
        "元素エネルギー縛り": 55,
        "ボス素材縛り": 60,
        "特産品縛り": 65,
        "敵素材縛り": 70,
        "突破ステータス縛り(キャラ)": 75,
        "誕生月": 80,
        "アルファベット縛り": 85,
        "天賦素材縛り": 90,
        "週ボス素材縛り": 95,
        "別衣装縛り": 100,
        "オリジナル料理種別縛り": 105,
        "武器種縛り": 110,
        "突破ステータス縛り(武器)": 120,
        "配布武器縛り": 130,
        "武器縛り": 140,
        "☆４キャラ武器": 145,
        "☆１、聖遺物なし": 150,
        "キャラルーレット": 200,
        "キャラ武器ルーレット": 210
    };
    const BIND_FALLBACK_PRIORITY_OFFSET = 1000;
    const BIND_UNKNOWN_PRIORITY = 9999;
    const BIND_SORT_LOCALE = 'ja';

    function getBindResolutionMeta(bindName) {
        const hasBindName = typeof bindName === 'string' && bindName.length > 0;
        return {
            phase: bindPhaseByName[bindName] || "prerequisite",
            priority: bindPriorityByName[bindName] ?? (hasBindName ? BIND_FALLBACK_PRIORITY_OFFSET : BIND_UNKNOWN_PRIORITY)
        };
    }

    function getBindName(bindItem) {
        if (typeof bindItem === 'string') return bindItem;
        if (bindItem && typeof bindItem === 'object' && typeof bindItem.name === 'string') return bindItem.name;
        return '';
    }

    function compareBindResolutionOrder(a, b) {
        const aName = getBindName(a);
        const bName = getBindName(b);
        const aMeta = getBindResolutionMeta(aName);
        const bMeta = getBindResolutionMeta(bName);
        const phaseDiff = bindPhaseOrder[aMeta.phase] - bindPhaseOrder[bMeta.phase];
        if (phaseDiff !== 0) return phaseDiff;
        if (aMeta.priority !== bMeta.priority) return aMeta.priority - bMeta.priority;
        const nameDiff = aName.localeCompare(bName, BIND_SORT_LOCALE);
        if (nameDiff !== 0) return nameDiff;
        const aPlayer = typeof a === 'object' ? (a.player || 0) : 0;
        const bPlayer = typeof b === 'object' ? (b.player || 0) : 0;
        return aPlayer - bPlayer;
    }

    let playerCount, bindCount, mode, currentRoulette, currentBindName, currentBindIndex, items, angle = 0, spinning = false, results = {}, currentPlayer = 1, lastResult;
    let rerolledChars, rerolledWeapons, rerolledCommonWeapons, playerNames = [], bindSelectionPhase, bindsToResolve, excludedSubItems = {};
    let prerenderedRoulette = null, spinSpeed = 0, visualItems = [];
    let isWeeklyBossMode = false;
    const theaterElements = ['炎', '水', '風', '雷', '草', '氷', '岩'];
    const theaterDifficultySettings = {
        easy: { label: 'イージー', min: 8, max: 10 },
        normal: { label: 'ノーマル', min: 12, max: 14 },
        hard: { label: 'ハード', min: 16, max: 20 },
        master: { label: 'マスター', min: 22, max: 26 },
        moon: { label: '月諭', min: 28, max: 32 }
    };
    let theaterSelectedElements = new Set();
    let theaterOpeningCast = new Set();
    let theaterSpecialCast = new Set();
    let theaterSpecialSearchKeyword = '';
    const kanjiCharacterReadings = {
        "魈": "しょう",
        "北斗": "ほくと",
        "凝光": "ぎょうこう",
        "香菱": "しゃんりん",
        "行秋": "ゆくあき",
        "重雲": "ちょううん",
        "七七": "なな",
        "刻晴": "こくせい",
        "鍾離": "しょうり",
        "辛炎": "しんえん",
        "甘雨": "かんう",
        "胡桃": "ふーたお",
        "煙緋": "えんひ",
        "申鶴": "しんかく",
        "雲菫": "うんきん",
        "夜蘭": "いぇらん",
        "白朮": "びゃくじゅつ",
        "閑雲": "かんうん",
        "嘉明": "がみん",
        "藍硯": "らんやん",
        "兹白": "しはく",
        "神里綾華": "かみさとあやか",
        "神里綾人": "かみさとあやと",
        "楓原万葉": "かえではらかずは",
        "宵宮": "よいみや",
        "早柚": "さゆ",
        "雷電将軍": "らいでんしょうぐん",
        "九条裟羅": "くじょうさら",
        "珊瑚宮心海": "さんごのみやここみ",
        "荒瀧一斗": "あらたきいっと",
        "八重神子": "やえみこ",
        "久岐忍": "くきしのぶ",
        "鹿野院平蔵": "しかのいんへいぞう",
        "綺良々": "きらら",
        "千織": "ちおり",
        "夢見月瑞希": "ゆめみづきみずき",
        "放浪者": "ほうろうしゃ",
        "旅人": "たびびと"
    };

    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    const defaultColors = ['#00c0fe', '#36d6a0', '#fe6640', '#8dcc06', '#74E4E2', '#cc85ff', '#F3AC11'];

    let playerPossession = JSON.parse(localStorage.getItem('genshin_roulette_possession') || '{}');
    let editingPlayer = "";



    function showScreen(screenId) {
        ['startScreen', 'bindSelection', 'rouletteScreen', 'resultScreen', 'customBindScreen', 'spiralModeScreen', 'theaterModeScreen'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if(target) target.classList.remove('hidden');
        const homeButton = document.getElementById('homeButton');
        if (homeButton) {
            if (screenId === 'startScreen') homeButton.classList.add('hidden');
            else homeButton.classList.remove('hidden');
        }
        updateScreenBackground(screenId);
    }

    function updateScreenBackground(screenId) {
        if (!document.body) return;
        document.body.classList.remove('screen-background-spiral', 'screen-background-theater');
        if (screenId === 'spiralModeScreen') {
            document.body.classList.add('screen-background-spiral');
        } else if (screenId === 'theaterModeScreen') {
            document.body.classList.add('screen-background-theater');
        }
    }
    
    function initialize() {
        playerCount = parseInt(document.getElementById('playerCount').value) || 1;
        bindCount = parseInt(document.getElementById('bindCount').value) || 1;
        playerNames = Array.from(document.querySelectorAll('.playerNameInput')).map((inp, i) => inp.value || `プレイヤー${i+1}`);
        results = { boss: null, common: {}, players: Array(playerCount).fill(0).map(() => ({})) };
        currentPlayer = 1; currentBindIndex = 0; lastResult = null;
        rerolledChars = Array(playerCount + 1).fill(0).map(() => []);
        rerolledWeapons = Array(playerCount + 1).fill(0).map(() => ({}));
        rerolledCommonWeapons = []; excludedSubItems = {};
        bindSelectionPhase = false; bindsToResolve = [];
    }

    function shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function katakanaToHiragana(text) {
        return String(text || '').replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60));
    }

    function normalizeNameSearchText(text) {
        return katakanaToHiragana(String(text || '').trim().toLocaleLowerCase('ja'));
    }

    function getCharacterSearchTarget(name) {
        const normalizedName = String(name || '').toLocaleLowerCase('ja');
        const hiraganaName = katakanaToHiragana(normalizedName);
        const reading = kanjiCharacterReadings[name] || '';
        return `${normalizedName}\n${hiraganaName}\n${reading}`;
    }

    function isTraveler(charName) {
        return charName === '旅人';
    }

    function isDoll(charName) {
        return charName === 'ドール';
    }

    function canUseTravelerInTheater(selectedElements) {
        return selectedElements.some(el => el !== '氷');
    }

    function getPlayerOwnedCharacters(playerName) {
        const pData = playerPossession[playerName];
        if (!pData) return { exists: false, owned: [] };
        const owned = characters.filter(char => !isDoll(char.name) && pData.chars[char.name] && pData.chars[char.name].owned === true);
        return { exists: true, owned };
    }

    function setModeMessage(elementId, message) {
        const msgEl = document.getElementById(elementId);
        if (msgEl) msgEl.textContent = message;
    }

    function createCharacterCard(char, selected, disabled) {
        const card = document.createElement('div');
        card.className = 'selection-chip';
        if (selected) card.classList.add('selected');
        if (disabled) card.classList.add('disabled');

        const img = document.createElement('img');
        const imagePath = encodeImagePath('character', char.name);
        if (imagePath) {
            img.src = imagePath;
            img.alt = char.name;
            img.onerror = function() { this.style.display = 'none'; };
        } else {
            img.style.display = 'none';
        }
        card.appendChild(img);

        const label = document.createElement('span');
        label.className = 'selection-chip-name';
        label.textContent = char.name;
        card.appendChild(label);
        return card;
    }

    function renderResultCards(containerId, charNames) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        charNames.forEach(name => {
            const card = document.createElement('div');
            card.className = 'result-card';
            const img = document.createElement('img');
            img.className = 'result-mini-image';
            const imagePath = encodeImagePath('character', name);
            if (imagePath) {
                img.src = imagePath;
                img.alt = name;
                img.onerror = function() { this.style.display = 'none'; };
            } else {
                img.style.display = 'none';
            }
            card.appendChild(img);
            const span = document.createElement('span');
            span.textContent = name;
            card.appendChild(span);
            container.appendChild(card);
        });
    }

    function openMemberSettingsFromMode(inputId) {
        const nameInput = document.getElementById(inputId);
        const playerName = (nameInput && nameInput.value.trim()) || 'プレイヤー1';
        showMemberSettings();
        const modalInput = document.getElementById('modalPlayerNameInput');
        if (modalInput) modalInput.value = playerName;
    }

    function getTheaterOpeningCandidates() {
        const selectedElements = Array.from(theaterSelectedElements);
        return characters.filter(char => {
            if (isDoll(char.name)) return false;
            if (isTraveler(char.name)) return canUseTravelerInTheater(selectedElements);
            return selectedElements.includes(char.element);
        });
    }

    function getTheaterSpecialCandidates() {
        const selectedElements = Array.from(theaterSelectedElements);
        return characters.filter(char => {
            if (isDoll(char.name)) return false;
            if (isTraveler(char.name)) return canUseTravelerInTheater(selectedElements);
            return true;
        });
    }

    function syncTheaterSelections() {
        const openingValid = new Set(getTheaterOpeningCandidates().map(c => c.name));
        theaterOpeningCast = new Set(Array.from(theaterOpeningCast).filter(name => openingValid.has(name)).slice(0, 6));
        const specialValid = new Set(getTheaterSpecialCandidates().map(c => c.name));
        theaterSpecialCast = new Set(Array.from(theaterSpecialCast).filter(name => specialValid.has(name)).slice(0, 4));
    }

    function renderTheaterElementSelector() {
        const container = document.getElementById('theaterElementSelector');
        if (!container) return;
        container.innerHTML = '';
        theaterElements.forEach(element => {
            const chip = document.createElement('div');
            chip.className = 'selection-chip element-chip';
            if (theaterSelectedElements.has(element)) chip.classList.add('selected');

            const imgPath = encodeImagePath('element', element + '元素');
            if (imgPath) {
                const img = document.createElement('img');
                img.src = imgPath;
                img.alt = element;
                img.onerror = function() { this.style.display = 'none'; };
                chip.appendChild(img);
            }
            const span = document.createElement('span');
            span.className = 'selection-chip-name';
            span.textContent = element;
            chip.appendChild(span);

            chip.addEventListener('click', () => {
                if (theaterSelectedElements.has(element)) {
                    theaterSelectedElements.delete(element);
                } else {
                    if (theaterSelectedElements.size >= 3) {
                        setModeMessage('theaterModeMessage', '元素は3つまで選択できます。');
                        return;
                    }
                    theaterSelectedElements.add(element);
                }
                syncTheaterSelections();
                setModeMessage('theaterModeMessage', '');
                renderTheaterSelectors();
            });
            container.appendChild(chip);
        });
    }

    function renderTheaterOpeningSelector() {
        const container = document.getElementById('theaterOpeningCastSelector');
        if (!container) return;
        container.innerHTML = '';
        const candidates = getTheaterOpeningCandidates();
        if (theaterSelectedElements.size === 0) {
            container.innerHTML = '<p style="grid-column:1/-1;color:#bdc3c7;">先に元素を選択してください。</p>';
            return;
        }
        candidates.forEach(char => {
            const selected = theaterOpeningCast.has(char.name);
            const card = createCharacterCard(char, selected, false);
            card.addEventListener('click', () => {
                if (theaterOpeningCast.has(char.name)) {
                    theaterOpeningCast.delete(char.name);
                } else {
                    if (theaterOpeningCast.size >= 6) {
                        setModeMessage('theaterModeMessage', '開幕キャストは6人までです。');
                        return;
                    }
                    theaterOpeningCast.add(char.name);
                }
                setModeMessage('theaterModeMessage', '');
                renderTheaterSelectors();
            });
            container.appendChild(card);
        });
    }

    function renderTheaterSpecialSelector() {
        const container = document.getElementById('theaterSpecialCastSelector');
        if (!container) return;
        container.innerHTML = '';
        const normalizedKeyword = normalizeNameSearchText(theaterSpecialSearchKeyword);
        const candidates = getTheaterSpecialCandidates().filter(char => {
            return !normalizedKeyword || getCharacterSearchTarget(char.name).includes(normalizedKeyword);
        });
        if (candidates.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1;color:#bdc3c7;">該当するキャラがいません。</p>';
            return;
        }
        candidates.forEach(char => {
            const selected = theaterSpecialCast.has(char.name);
            const card = createCharacterCard(char, selected, false);
            card.addEventListener('click', () => {
                if (theaterSpecialCast.has(char.name)) {
                    theaterSpecialCast.delete(char.name);
                } else {
                    if (theaterSpecialCast.size >= 4) {
                        setModeMessage('theaterModeMessage', '特別招待キャストは4人までです。');
                        return;
                    }
                    theaterSpecialCast.add(char.name);
                }
                setModeMessage('theaterModeMessage', '');
                renderTheaterSelectors();
            });
            container.appendChild(card);
        });
    }

    function renderTheaterSelectors() {
        renderTheaterElementSelector();
        renderTheaterOpeningSelector();
        renderTheaterSpecialSelector();
    }

    function executeSpiralDraw() {
        const playerInput = document.getElementById('spiralPlayerNameInput');
        const playerName = (playerInput && playerInput.value.trim()) || 'プレイヤー1';
        if (playerInput) playerInput.value = playerName;
        const resultBox = document.getElementById('spiralModeResult');
        if (resultBox) resultBox.classList.add('hidden');

        const ownedInfo = getPlayerOwnedCharacters(playerName);
        if (!ownedInfo.exists) {
            setModeMessage('spiralModeMessage', 'この名前の所持データがないよ！所持キャラ設定をしてね。');
            return;
        }
        if (ownedInfo.owned.length < 8) {
            setModeMessage('spiralModeMessage', '所持キャラは8人以上必要です。');
            return;
        }

        const selected = shuffleArray(ownedInfo.owned).slice(0, 8).map(c => c.name);
        renderResultCards('spiralTopResult', selected.slice(0, 4));
        renderResultCards('spiralBottomResult', selected.slice(4, 8));
        if (resultBox) resultBox.classList.remove('hidden');
        setModeMessage('spiralModeMessage', `${playerName} の螺旋抽選が完了しました。`);
    }

    function executeTheaterDraw() {
        const playerInput = document.getElementById('theaterPlayerNameInput');
        const playerName = (playerInput && playerInput.value.trim()) || 'プレイヤー1';
        if (playerInput) playerInput.value = playerName;
        const resultBox = document.getElementById('theaterModeResult');
        if (resultBox) resultBox.classList.add('hidden');

        if (theaterSelectedElements.size !== 3) {
            setModeMessage('theaterModeMessage', '対応元素を3つ選んでください。');
            return;
        }
        if (theaterOpeningCast.size !== 6) {
            setModeMessage('theaterModeMessage', '開幕キャストを6人選んでください。');
            return;
        }
        if (theaterSpecialCast.size !== 4) {
            setModeMessage('theaterModeMessage', '特別招待キャストを4人選んでください。');
            return;
        }

        const ownedInfo = getPlayerOwnedCharacters(playerName);
        if (!ownedInfo.exists) {
            setModeMessage('theaterModeMessage', 'この名前の所持データがないよ！所持キャラ設定をしてね。');
            return;
        }

        const ownedSet = new Set(ownedInfo.owned.map(c => c.name));
        const specialOwned = Array.from(theaterSpecialCast).filter(name => ownedSet.has(name));
        if (specialOwned.length < 4) {
            setModeMessage('theaterModeMessage', '特別招待キャストに未所持キャラが含まれているよ！');
            return;
        }

        const selectedElements = Array.from(theaterSelectedElements);
        const theaterCandidates = new Map();
        ownedInfo.owned.forEach(char => {
            if (isTraveler(char.name)) {
                if (canUseTravelerInTheater(selectedElements)) theaterCandidates.set(char.name, char);
                return;
            }
            if (selectedElements.includes(char.element)) theaterCandidates.set(char.name, char);
        });
        specialOwned.forEach(name => {
            const char = characters.find(c => c.name === name);
            if (!char || isDoll(char.name)) return;
            if (isTraveler(char.name) && !canUseTravelerInTheater(selectedElements)) return;
            theaterCandidates.set(char.name, char);
        });

        const difficulty = document.getElementById('theaterDifficultySelect').value;
        const setting = theaterDifficultySettings[difficulty] || theaterDifficultySettings.normal;
        const candidateNames = Array.from(theaterCandidates.keys());
        const targetCount = Math.min(setting.max, candidateNames.length);

        if (targetCount < setting.min) {
            setModeMessage('theaterModeMessage', 'キャラが足りないよ！');
            return;
        }

        const finalMembers = Array.from(theaterOpeningCast);
        const remaining = shuffleArray(candidateNames.filter(name => !finalMembers.includes(name)));
        while (finalMembers.length < targetCount && remaining.length > 0) {
            finalMembers.push(remaining.shift());
        }

        renderResultCards('theaterResultList', finalMembers);
        if (resultBox) resultBox.classList.remove('hidden');
        setModeMessage('theaterModeMessage', `${setting.label}で${finalMembers.length}人を抽選しました。`);
    }

    function updateDisplayInfo() {
        const d = document.getElementById('currentPlayerNameDisplay');
        if (bindSelectionPhase) d.textContent = '縛りカテゴリーを抽選中...';
        else if (currentRoulette === 'boss') d.textContent = 'ボスを抽選中...';
        else if (playerBindTypes.includes(currentBindName)) d.textContent = `${playerNames[currentPlayer-1]} の ${currentBindName} 抽選`;
        else d.textContent = `全員共通: ${currentBindName} 抽選`;
    }

    function checkCharEligibility(char, filters, playerIdx) {
        const pName = playerNames[playerIdx - 1];
        const pData = playerPossession[pName];
        if (pData && (!pData.chars[char.name] || pData.chars[char.name].owned === false)) return false;
        if (filters["完凸禁止"] && pData && pData.chars[char.name] && pData.chars[char.name].c6 === true) return false;
        if (filters["無凸縛り"] && pData && pData.chars[char.name] && pData.chars[char.name].c0 !== true) return false;
        for (const bindName in filters) {
            const value = filters[bindName];
            if (value === undefined || value === null || value === "") continue;
            let match = false;
            switch(bindName) {
                case "国縛り": match = (char.country === value); break;
                case "モノ元素縛り": match = (char.element === value); break;
                case "武器種縛り": match = (char.weapon === value); break;
                case "誕生月": match = (char.birth_month === value); break;
                case "各1.1縛り": match = (char.version === value); break;
                case "体型縛り": match = Array.isArray(char.body) ? char.body.includes(value) : (char.body === value); break;
                case "役割縛り": match = Array.isArray(char.role) ? char.role.includes(value) : (char.role === value); break;
                case "元素エネルギー縛り": match = Array.isArray(char.energy) ? char.energy.includes(value) : (char.energy === value); break;
                case "ボス素材縛り": match = (char.talent_boss === value); break;
                case "特産品縛り": match = (char.local_specialty === value); break;
                case "敵素材縛り": match = Array.isArray(char.enemy_material) ? char.enemy_material.includes(value) : (char.enemy_material === value); break;
                case "突破ステータス縛り(キャラ)": match = (char.ascension_stat === value); break;
                case "配布キャラ縛り": match = (typeof value === 'string' && value !== "true") ? (char.name === value) : char.distributed; break;
                case "天賦素材縛り": match = (char.talent_book === value); break;
                case "別衣装縛り": match = (char.costume === true); break;
                case "オリジナル料理種別縛り": match = (char.special_dish === value); break;
                case "軌跡ついてるキャラ縛り": match = (char.trace === true); break;
                case "週ボス素材縛り": match = (char.talent_weekly === value); break;
                case "所持率100％縛り": match = ownership100Characters.includes(char.name); break;
                case "アルファベット縛り": match = (char.name === "旅人") ? (value === "T") : (alphabetData[value] && alphabetData[value].includes(char.name)); break;
                case "旅人縛り": match = (char.name === "旅人"); break;
                case "恒常☆５縛り": match = char.rarity.includes('恒常☆５'); break;
                case "☆４キャラ武器": match = char.rarity.includes('☆４'); break;
                case "初期キャラのみ": match = initialCharacters.includes(char.name); break;
                case "鍛錬の道縛り": match = !!char.training_road; break;
                case "武器縛り": case "配布武器縛り": case "突破ステータス縛り(武器)": case "☆１、聖遺物なし":
                    const pool = allWeapons[char.weapon] || [];
                    match = pool.some(w => {
                        if (pData && pData.weapons[w.name] !== true) return false;
                        if (bindName === "武器縛り" && w.name !== value) return false;
                        if (bindName === "配布武器縛り" && typeof value === 'string' && value !== "true" && w.name !== value) return false;
                        if (bindName === "配布武器縛り" && (typeof value !== 'string' || value === "true") && !w.is_distributed) return false;
                        if (bindName === "突破ステータス縛り(武器)" && w.ascension_stat !== value) return false;
                        if (bindName === "☆１、聖遺物なし" && w.rarity !== 1) return false;
                        return true;
                    });
                    break;
                default: match = true; break;
            }
            if (!match) return false;
        }
        // Weekly boss mode check - prevent duplicate characters
        if (isWeeklyBossMode) {
            for (let i = 0; i < playerIdx - 1; i++) {
                const pRes = results.players[i];
                const pChar = pRes['キャラルーレット'] || (pRes['キャラ武器ルーレット'] ? pRes['キャラ武器ルーレット'].char : null);
                if (pChar === char.name) return false;
            }
        }
        return true;
    }

    function getFilteredCharacters(customFilters = null, player = currentPlayer) {
        const filters = customFilters || {...results.common, ...results.players[player - 1]};
        return characters.filter(c => !rerolledChars[player].includes(c.name) && checkCharEligibility(c, filters, player));
    }

    function getFilteredWeapons(type, charName) {
        let pool = allWeapons[type] || [];
        const f = {...results.common, ...results.players[currentPlayer - 1]};
        const rw = rerolledWeapons[currentPlayer][charName] || [];
        const pData = playerPossession[playerNames[currentPlayer - 1]];
        return pool.filter(w => {
            if (pData && pData.weapons[w.name] === false) return false;
            if (rw.includes(w.name)) return false;
            if (f["☆４キャラ武器"] && w.rarity >= 5) return false;
            if (f["配布武器縛り"]) {
                const val = f["配布武器縛り"];
                if (typeof val === 'string' && val !== "true") { if(w.name !== val) return false; }
                else if (!w.is_distributed) return false;
            }
            if (f["突破ステータス縛り(武器)"] && w.ascension_stat !== f["突破ステータス縛り(武器)"]) return false;
            if (f["武器縛り"] && w.name !== f["武器縛り"]) return false;
            if (f["☆１、聖遺物なし"] && w.rarity !== 1) return false;
            return true;
        }).map(w => w.name);
    }

    function prerenderRouletteImage() {
        if (!items || items.length === 0) return;
        visualItems = [...items].sort(() => Math.random() - 0.5);
        if (visualItems.length > 0 && visualItems.length <= 10) {
            const factor = Math.ceil(15 / visualItems.length);
            visualItems = Array(factor).fill(visualItems).flat();
        }
        prerenderedRoulette = document.createElement('canvas');
        prerenderedRoulette.width = 500; prerenderedRoulette.height = 500;
        const pctx = prerenderedRoulette.getContext('2d');
        const arc = 2 * Math.PI / visualItems.length;
        visualItems.forEach((item, i) => {
            const start = i * arc;
            pctx.beginPath(); pctx.arc(250, 250, 230, start, start + arc); pctx.lineTo(250, 250);
            let color = defaultColors[i % defaultColors.length];
            const isCharBased = (currentRoulette === 'character' || (currentRoulette === 'sub' && (currentBindName === '配布キャラ縛り' || currentBindName === 'キャラルーレット')));
            if (isCharBased) {
                const char = characters.find(c => c.name === item);
                if (char) color = (char.name === "旅人" || char.name === "ドール") ? "#808080" : (elementColors[char.element] || "#808080");
            } else if (currentBindName === "モノ元素縛り") {
                color = elementColors[item] || color;
            }
            pctx.fillStyle = color; pctx.fill();
            pctx.strokeStyle = "#000"; pctx.lineWidth = 2; pctx.stroke();
            pctx.save(); pctx.translate(250, 250); pctx.rotate(start + arc/2);
            pctx.fillStyle = "#fff"; pctx.font = 'bold 14px Arial'; pctx.textAlign = 'right'; pctx.fillText(item, 220, 0); pctx.restore();
        });
    }

    function drawRoulette() {
        ctx.clearRect(0, 0, 500, 500);
        if (!prerenderedRoulette) return;
        ctx.save(); ctx.translate(250, 250); ctx.rotate(angle);
        ctx.drawImage(prerenderedRoulette, -250, -250); ctx.restore();
        ctx.beginPath(); ctx.moveTo(480, 235); ctx.lineTo(480, 265); ctx.lineTo(450, 250);
        ctx.fillStyle = '#FF0000'; ctx.fill();
    }

    function setupRouletteForBind(bindName, player = 1) {
        currentBindName = bindName; currentPlayer = player;
        const currentFilters = {...results.common, ...results.players[currentPlayer - 1]};
        if (subRoulettes[bindName]) {
            currentRoulette = 'sub';
            let subItems = subRoulettes[bindName];
            const exKey = bindName + "_" + player;
            const exList = excludedSubItems[exKey] || [];
            subItems = subItems.filter(si => !exList.includes(si));
            if (bindName === "武器縛り") {
                const wt = currentFilters["武器種縛り"];
                if(wt) subItems = subItems.filter(wName => Object.values(allWeapons[wt]).some(d => d.name === wName));
                if(currentFilters["☆４キャラ武器"]) subItems = subItems.filter(wName => {
                    const wd = Object.values(allWeapons).flat().find(d => d.name === wName);
                    return wd && wd.rarity < 5;
                });
            } else if (bindName === "突破ステータス縛り(武器)") {
                const weaponType = currentFilters["武器種縛り"];
                let weaponPool = weaponType ? (allWeapons[weaponType] || []) : Object.values(allWeapons).flat();
                if (currentFilters["☆４キャラ武器"]) weaponPool = weaponPool.filter(w => w.rarity < 5);
                if (currentFilters["配布武器縛り"]) weaponPool = weaponPool.filter(w => w.is_distributed);
                const pDataLocal = playerPossession[playerNames[player - 1]];
                if (pDataLocal) weaponPool = weaponPool.filter(w => pDataLocal.weapons[w.name] !== false);
                const availableStats = new Set(weaponPool.map(w => w.ascension_stat).filter(s => s));
                subItems = subItems.filter(stat => availableStats.has(stat));
            } else {
                 subItems = subItems.filter(opt => characters.some(char => checkCharEligibility(char, {...currentFilters, [bindName]: opt}, player)));
            }
            items = subItems;
        } else if (bindName === 'キャラルーレット' || bindName === 'キャラ武器ルーレット') {
            currentRoulette = 'character';
            if (bindName === 'キャラ武器ルーレット' && results.players[player - 1]['キャラ武器ルーレット'] && results.players[player-1]['キャラ武器ルーレット'].char) {
                const charData = characters.find(c => c.name === results.players[player - 1]['キャラ武器ルーレット'].char);
                currentRoulette = 'weapon'; items = getFilteredWeapons(charData.weapon, charData.name);
            } else {
                // 配布武器縛り × キャラ武器ルーレット の制約ロジック
                if (bindName === 'キャラ武器ルーレット' && currentFilters["配布武器縛り"]) {
                    // 配布武器が決まっている場合、その武器が使えるキャラのみをフィルタリング
                    // Note: 配布武器縛り can be either boolean true or string (weapon name)
                    const distributedWeaponName = (typeof currentFilters["配布武器縛り"] === 'string' && currentFilters["配布武器縛り"] !== "true") 
                        ? currentFilters["配布武器縛り"] 
                        : null;
                    
                    if (distributedWeaponName) {
                        // 特定の配布武器が指定されている場合、その武器種のキャラのみ
                        const weaponData = Object.values(allWeapons).flat().find(w => w.name === distributedWeaponName);
                        if (weaponData) {
                            items = getFilteredCharacters(null, player).filter(c => c.weapon === weaponData.type).map(c => c.name);
                        } else {
                            items = getFilteredCharacters(null, player).map(c => c.name);
                        }
                    } else {
                        // 配布武器縛りが有効だが特定武器未指定の場合、配布武器が存在する武器種のキャラのみ
                        items = getFilteredCharacters(null, player).filter(c => {
                            const weaponType = c.weapon;
                            const distributedWeapons = allWeapons[weaponType]?.filter(w => w.is_distributed) || [];
                            return distributedWeapons.length > 0;
                        }).map(c => c.name);
                    }
                } else {
                    items = getFilteredCharacters(null, player).map(c => c.name);
                }
            }
        } else {
            results.common[bindName] = true; proceedToNext(); return;
        }
        updateDisplayInfo(); 
        if (items.length === 1 && currentRoulette !== 'boss' && currentRoulette !== 'bind') {
            lastResult = items[0]; processResult();
            showPopup(`${bindName}: ${lastResult} に確定`);
        } else if (items.length === 0) { proceedToNext(); }
        else { prerenderedRoulette = null; prerenderRouletteImage(); document.getElementById('spinButton').disabled = false; showScreen('rouletteScreen'); drawRoulette(); }
    }

    function spinRoulette() {
        if (spinning || !items || items.length === 0) return;
        spinning = true; spinSpeed = 0.2 + Math.random() * 0.1;
        document.getElementById('spinButton').disabled = true; document.getElementById('stopButton').disabled = false;
        (function anim() { if (spinning) { angle += spinSpeed; drawRoulette(); requestAnimationFrame(anim); } })();
    }

    function stopRoulette() {
        const si = setInterval(() => {
            spinSpeed *= 0.96; angle += spinSpeed;
            if (Math.abs(spinSpeed) < 0.001) {
                spinning = false; clearInterval(si);
                let idx = Math.floor(((2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI)) / (2 * Math.PI / visualItems.length));
                lastResult = visualItems[idx]; showPopup(lastResult);
            } else drawRoulette();
        }, 20);
        document.getElementById('stopButton').disabled = true;
    }

    function showPopup(text) {
        const p = document.getElementById('popup');
        if (!p) {
            console.error('popup要素が見つかりません');
            return;
        }
        
        let content = `<span class="popup-close" onclick="this.parentElement.click()">×</span>`;
        content += `<div class="popup-text">${text}</div>`;
        
        // ルーレット種別に応じて画像を表示
        let imageType = null;
        if (currentRoulette === 'boss') imageType = 'boss';
        else if (currentRoulette === 'character') imageType = 'character';
        else if (currentRoulette === 'weapon') imageType = 'weapon';
        else if (currentRoulette === 'sub' && ['配布武器縛り', '武器縛り', '突破ステータス縛り(武器)'].includes(currentBindName)) imageType = 'weapon';

        const imageName = imageType === 'boss' ? text : lastResult;
        if (imageType && imageName) {
            const imagePath = encodeImagePath(imageType, imageName);
            console.log(`[POPUP] ${imageType}: ${imageName}, パス: ${imagePath}`);
            if (imagePath) {
                content += `<img src="${imagePath}" alt="${imageName}" class="popup-image" onerror="console.log('画像読み込みエラー: ${imagePath}'); this.style.display='none'">`;
            }
        }
        
        p.innerHTML = content;
        p.style.display = 'block';
        
        const cb = () => {
            p.style.display = 'none';
            document.getElementById('nextButton').classList.remove('hidden');
            if(currentRoulette === 'character' || currentRoulette === 'weapon' ||
                (currentRoulette === 'sub' && ['配布武器縛り', '武器縛り', '突破ステータス縛り(武器)'].includes(currentBindName)))
                document.getElementById('notOwnedButton').classList.remove('hidden');
            p.removeEventListener('click', cb);
        };
        p.addEventListener('click', cb);
    }

    function nextStep() { processResult(); document.getElementById('nextButton').classList.add('hidden'); document.getElementById('notOwnedButton').classList.add('hidden'); }

    function processResult() {
        if (bindSelectionPhase) {
            bindsToResolve.push(lastResult); if (lastResult.includes("リロール")) bindCount++;
            if (bindsToResolve.length < bindCount) { items = getAvailableBinds(); prerenderRouletteImage(); drawRoulette(); document.getElementById('spinButton').disabled = false; }
            else {
                bindSelectionPhase = false;
                let bindNames = bindsToResolve.map(b => typeof b === 'object' ? b.name : b);
                if(bindNames.includes("キャラ武器ルーレット")) bindNames = bindNames.filter(n => n !== "キャラルーレット");
                let full = []; bindNames.forEach(bName => {
                    if (playerBindTypes.includes(bName)) for (let i = 1; i <= playerCount; i++) full.push({ name: bName, player: i });
                    else full.push({ name: bName, player: 0 });
                });
                full.sort(compareBindResolutionOrder);
                bindsToResolve = full; currentBindIndex = 0; startNextSelectedBind();
            }
            return;
        }
        if (currentRoulette === 'boss') {
            results.boss = lastResult;
            // カスタムモード判定を最優先に
            if (mode === 'custom_selected') { currentBindIndex = 0; startNextSelectedBind(); }
            else if (mode === 'boss') showResults();
            else { bindSelectionPhase = true; currentRoulette = 'bind'; items = getAvailableBinds(); prerenderRouletteImage(); drawRoulette(); document.getElementById('spinButton').disabled = false; }
            return;
        }
        if (playerBindTypes.includes(currentBindName)) {
            if (currentBindName === 'キャラ武器ルーレット') {
                if (currentRoulette === 'character') {
                    results.players[currentPlayer - 1][currentBindName] = { char: lastResult, weapon: null };
                    currentRoulette = 'weapon'; 
                    items = getFilteredWeapons(characters.find(c => c.name === lastResult).weapon, lastResult);
                    setupRouletteForBind('キャラ武器ルーレット', currentPlayer); return;
                } else results.players[currentPlayer - 1][currentBindName].weapon = lastResult;
            } else results.players[currentPlayer - 1][currentBindName] = lastResult;
        } else results.common[currentBindName] = lastResult;
        proceedToNext();
    }

    function notOwned() {
        document.getElementById('nextButton').classList.add('hidden');
        document.getElementById('notOwnedButton').classList.add('hidden');
        if(currentRoulette === 'character') { rerolledChars[currentPlayer].push(lastResult); items = getFilteredCharacters(null, currentPlayer).map(c => c.name); }
        else if (currentRoulette === 'weapon') {
            const cn = results.players[currentPlayer - 1]['キャラ武器ルーレット'].char;
            if (!rerolledWeapons[currentPlayer][cn]) rerolledWeapons[currentPlayer][cn] = [];
            rerolledWeapons[currentPlayer][cn].push(lastResult);
            items = getFilteredWeapons(characters.find(c => c.name === cn).weapon, cn);
        } else if (currentRoulette === 'sub') {
            const exKey = currentBindName + "_" + currentPlayer;
            if (!excludedSubItems[exKey]) excludedSubItems[exKey] = [];
            excludedSubItems[exKey].push(lastResult);
            setupRouletteForBind(currentBindName, currentPlayer); return;
        }
        if (items.length === 0) { alert("候補がいなくなりました"); proceedToNext(); return; }
        prerenderRouletteImage(); drawRoulette(); document.getElementById('spinButton').disabled = false;
    }

    function showResults() {
        showScreen('resultScreen'); 
        const resDiv = document.getElementById('results');
        
        let html = '';
        
        // ===== ボス画像セクション =====
        html += `<div class="result-section">`;
        html += `<h2>ボス：${results.boss || "未選択"}</h2>`;
        if (results.boss && results.boss !== "未選択") {
            const bossImagePath = encodeImagePath('boss', results.boss);
            console.log(`[RESULTS] ボス: ${results.boss}, パス: ${bossImagePath}`);
            if (bossImagePath) {
                html += `<img src="${bossImagePath}" alt="${results.boss}" class="result-image" onerror="console.log('ボス画像読み込みエラー'); this.style.display='none'">`;
            }
        }
        html += `</div>`;
        
        // ===== 共通の縛り =====
        if (Object.keys(results.common).length > 0) {
            html += `<h3>共通の縛り：</h3><ul>` + 
                    Object.keys(results.common).map(k => 
                        `<li>${k}${results.common[k]===true?'':': '+results.common[k]}</li>`
                    ).join('') + 
                    `</ul>`;
        }
        
        // ===== プレイヤーごとのセクション =====
        for (let i = 0; i < playerCount; i++) {
            const pb = results.players[i];
            html += `<div style="border-top:1px solid #7f8c8d; padding:15px 0;">`;
            html += `<h3>${playerNames[i]}の結果</h3>`;
            html += `<ul>`;
            
            Object.keys(pb).forEach(k => {
                let val = pb[k];
                if (k === 'キャラ武器ルーレット') {
                    val = `${pb[k].char} - ${pb[k].weapon || '未選択'}`;
                }
                html += `<li>${k}: ${val}</li>`;
            });
            html += `</ul>`;
            
            const f = {...results.common, ...pb};
            let chars = (pb['キャラルーレット']||(pb['キャラ武器ルーレット']&&pb['キャラ武器ルーレット'].char)) ? [{name:pb['キャラルーレット']||pb['キャラ武器ルーレット'].char}] : characters.filter(c => checkCharEligibility(c, f, i + 1));
            
            // ===== キャラクター画像 =====
            const selectedChar = pb['キャラルーレット'] || 
                                (pb['キャラ武器ルーレット'] && pb['キャラ武器ルーレット'].char);
            if (selectedChar) {
                const charImagePath = encodeImagePath('character', selectedChar);
                console.log(`[RESULTS] キャラ: ${selectedChar}, パス: ${charImagePath}`);
                html += `<div class="result-section">`;
                html += `<h4>キャラクター：</h4>`;
                html += `<p class="char-list-final">${selectedChar}</p>`;
                if (charImagePath) {
                    html += `<img src="${charImagePath}" alt="${selectedChar}" class="result-image" onerror="console.log('キャラ画像読み込みエラー'); this.style.display='none'">`;
                }
                html += `</div>`;
            }
            let wepText = "すべて";
            let availableWeapons = [];
            if (f["武器種縛り"]) wepText = f["武器種縛り"];
            if (f["☆４キャラ武器"]) wepText = "☆４" + (f["武器種縛り"] || "武器");
            if (f["配布武器縛り"]) {
                if (typeof f["配布武器縛り"] === 'string' && f["配布武器縛り"] !== "true") {
                    const selectedDistWeapon = f["配布武器縛り"];
                    const wd = Object.values(allWeapons).flat().find(w => w.name === selectedDistWeapon);
                    availableWeapons = wd ? [wd] : [];
                    wepText = selectedDistWeapon;
                } else {
                    const charWeaponType = characters.find(cd => cd.name === chars[0]?.name)?.weapon;
                    const distributedWeaponsList = allWeapons[charWeaponType || "片手剣"].filter(w => w.is_distributed);
                    availableWeapons = distributedWeaponsList;
                    wepText = jpSort(distributedWeaponsList.map(w => w.name)).join('、') || "なし";
                }
            }
            if (pb["キャラ武器ルーレット"] && pb["キャラ武器ルーレット"].weapon) wepText = pb["キャラ武器ルーレット"].weapon;
            else if (f["武器縛り"]) wepText = f["武器縛り"];
            // 突破ステータス縛り(武器)が設定されていて、かつ特定武器が未確定の場合に利用可能武器リストを生成
            // 特定武器確定ケース: キャラ武器ルーレットで武器が決定済み、武器縛りで名称指定済み、配布武器縛りで特定武器名指定済み
            const hasSpecificWeapon = (pb["キャラ武器ルーレット"] && pb["キャラ武器ルーレット"].weapon) ||
                f["武器縛り"] ||
                (typeof f["配布武器縛り"] === 'string' && f["配布武器縛り"] !== "true");
            if (f["突破ステータス縛り(武器)"] && !hasSpecificWeapon) {
                const statFilter = f["突破ステータス縛り(武器)"];
                let pool = f["武器種縛り"] ? (allWeapons[f["武器種縛り"]] || []) : Object.values(allWeapons).flat();
                if (f["☆４キャラ武器"]) pool = pool.filter(w => w.rarity < 5);
                if (f["配布武器縛り"]) pool = pool.filter(w => w.is_distributed);
                const pDataW = playerPossession[playerNames[i]];
                availableWeapons = pool.filter(w => w.ascension_stat === statFilter && !(pDataW && pDataW.weapons[w.name] === false));
                wepText = availableWeapons.length > 0 ? jpSort(availableWeapons.map(w => w.name)).join('、') : "条件不一致";
            }
            
            // ===== 武器画像 =====
            const selectedWeapon = (pb["キャラ武器ルーレット"] && pb["キャラ武器ルーレット"].weapon) || f["武器縛り"];
            if (selectedWeapon && selectedWeapon !== "すべて") {
                const weaponImagePath = encodeImagePath('weapon', selectedWeapon);
                console.log(`[RESULTS] 武器: ${selectedWeapon}, パス: ${weaponImagePath}`);
                html += `<div class="result-section">`;
                html += `<h4>使用可能武器:</h4>`;
                html += `<p class="char-list-final">${wepText}</p>`;
                if (weaponImagePath) {
                    html += `<img src="${weaponImagePath}" alt="${selectedWeapon}" class="result-image" onerror="console.log('武器画像読み込みエラー'); this.style.display='none'">`;
                }
                html += `</div>`;
            } else if (availableWeapons.length >= 1 && availableWeapons.length <= 20) {
                // 候補武器が8つ以内なら画像を横並び表示
                html += `<div class="result-section">`;
                html += `<h4>使用可能武器 (${availableWeapons.length}種):</h4>`;
                html += `<div class="result-image-container">`;
                availableWeapons.forEach(w => {
                    const weaponImagePath = encodeImagePath('weapon', w.name);
                    html += `
                        <div class="result-card">
                            <img src="${weaponImagePath}" alt="${w.name}" class="result-mini-image" onerror="this.style.display='none'">
                            <span>${w.name}</span>
                        </div>`;
                });
                html += `</div></div>`;
            } else {
                html += `<h4>使用可能武器:</h4><p class="char-list-final">${wepText}</p>`;
            }
            
            if (!selectedChar) {
                // 候補キャラが20人以内なら画像を横並び表示（足りなくなったら2段目・3段目と自動展開）
                if (chars.length >= 1 && chars.length <= 20) {
                    html += `<div class="result-section">`;
                    html += `<h4>対象キャラクター (${chars.length}人)：</h4>`;
                    html += `<div class="result-image-container">`;
                    chars.forEach(c => {
                        const charImagePath = encodeImagePath('character', c.name);
                        html += `
                            <div class="result-card">
                                <img src="${charImagePath}" alt="${c.name}" class="result-mini-image" onerror="this.style.display='none'">
                                <span>${c.name}</span>
                            </div>`;
                    });
                    html += `</div></div>`;
                } else {
                    // 21人より多い場合、または0人の場合は名前リストのみ表示
                    html += `<h4>対象キャラクター:</h4><p class="char-list-final">${chars.map(c=>c.name).join('、')||'条件不一致'}</p>`;
                }
            }
            const playerBindKeys = Object.keys(pb);
            if (playerBindKeys.length > 0) {
                html += `<div class="retry-player-container" id="retryPlayerContainer${i+1}"></div>`;
            }
            html += `</div>`;
        }
        
        resDiv.innerHTML = html;
        makeResultItemsClickable();

        // 各プレイヤーの再抽選ドロップダウンを生成（DOM APIで安全に構築）
        for (let i = 0; i < playerCount; i++) {
            const pb = results.players[i];
            const container = document.getElementById(`retryPlayerContainer${i+1}`);
            if (!container || !pb) continue;
            const playerBindKeys = Object.keys(pb);
            if (playerBindKeys.length === 0) continue;
            const sel = document.createElement('select');
            sel.className = 'retry-player-select';
            sel.dataset.playerIndex = String(i + 1);
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '--- やり直す項目を選択 ---';
            sel.appendChild(defaultOpt);
            playerBindKeys.forEach(bindName => {
                const opt = document.createElement('option');
                opt.value = `player_${i+1}_${bindName}`;
                opt.textContent = `${bindName}をやり直す`;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', e => {
                if (e.target.value) retryBind(e.target.value);
            });
            container.appendChild(sel);
        }

        // 全員分リトライドロップダウンを生成
        const retryContainer = document.getElementById('retryContainer');
        if (retryContainer) {
            retryContainer.innerHTML = '';
            const commonBinds = Object.keys(results.common);
            let hasAnyBind = commonBinds.length > 0;
            if (!hasAnyBind) {
                for (let p = 0; p < playerCount; p++) {
                    if (results.players[p] && Object.keys(results.players[p]).length > 0) { hasAnyBind = true; break; }
                }
            }

            if (hasAnyBind) {
                const select = document.createElement('select');
                select.id = 'retryBindSelect';
                select.className = 'retry-all-select';
                select.innerHTML = '<option value="">--- 全員分やり直す項目を選択 ---</option>';

                commonBinds.forEach(bindName => {
                    const option = document.createElement('option');
                    option.value = `common_${bindName}`;
                    option.textContent = `共通: ${bindName}をやり直す`;
                    select.appendChild(option);
                });

                for (let p = 1; p <= playerCount; p++) {
                    const pb = results.players[p - 1];
                    if (pb) {
                        Object.keys(pb).forEach(bindName => {
                            const option = document.createElement('option');
                            option.value = `player_${p}_${bindName}`;
                            option.textContent = `${playerNames[p-1]}: ${bindName}をやり直す`;
                            select.appendChild(option);
                        });
                    }
                }

                const optionAll = document.createElement('option');
                optionAll.value = 'retry_all';
                optionAll.textContent = 'すべてやり直す';
                select.appendChild(optionAll);

                select.addEventListener('change', (e) => {
                    if (e.target.value === 'retry_all') {
                        backToStart();
                    } else if (e.target.value) {
                        retryBind(e.target.value);
                    }
                });

                retryContainer.appendChild(select);
            }
        }
    }

    function rerollPlayer(idx) {
        let pBinds = [];
        playerBindTypes.forEach(bt => { if (results.players[idx-1][bt] !== undefined) pBinds.push({ name: bt, player: idx }); });
        if (pBinds.length > 0) {
            results.players[idx-1] = {}; rerolledChars[idx] = []; rerolledWeapons[idx] = {}; excludedSubItems = {};
            bindsToResolve = pBinds.sort(compareBindResolutionOrder);
            currentBindIndex = 0; mode = 'reroll'; startNextSelectedBind();
        } else showResults();
    }

    function retryBind(selection) {
        const firstSep = selection.indexOf('_');
        const type = selection.substring(0, firstSep);
        const rest = selection.substring(firstSep + 1);
        let bindName, playerNum;

        if (type === 'common') {
            bindName = rest;
            playerNum = 0;
            delete results.common[bindName];
            Object.keys(excludedSubItems).forEach(key => {
                if (key.startsWith(bindName + '_')) delete excludedSubItems[key];
            });
        } else if (type === 'player') {
            const secondSep = rest.indexOf('_');
            playerNum = parseInt(rest.substring(0, secondSep));
            bindName = rest.substring(secondSep + 1);
            delete results.players[playerNum - 1][bindName];
            if (bindName === 'キャラ武器ルーレット') {
                rerolledChars[playerNum] = [];
                rerolledWeapons[playerNum] = {};
            }
            delete excludedSubItems[bindName + '_' + playerNum];
        } else {
            return;
        }

        bindSelectionPhase = false;
        bindsToResolve = [{ name: bindName, player: playerNum }];
        currentBindIndex = 0;
        mode = 'reroll';
        startNextSelectedBind();
    }

    function showCustomBindScreen() {
        initialize(); mode = 'custom'; showScreen('customBindScreen');
        const bSel = document.getElementById('customBossSelect');
        bSel.innerHTML = '<option value="random">ランダム</option>' + jpSort(bosses).map(b => `<option value="${b}">${b}</option>`).join('');
        const cg = document.getElementById('customBindGrid'), cb = document.getElementById('customBindButtonsCommon'), pc = document.getElementById('customBindsPlayersContainer');
        cg.innerHTML = ''; cb.innerHTML = ''; pc.innerHTML = '';
        ['国縛り', 'モノ元素縛り'].forEach(n => createBindItem(n, 'select', cg));
        ['恒常☆５縛り', '☆４キャラ武器', '初期キャラのみ', '鍛錬の道縛り', '所持率100％縛り', '旅人縛り', 'スキル禁止', '完凸禁止', 'クラウン禁止', '配布武器縛り', '回復禁止', '聖遺物セット禁止'].forEach(n => createBindItem(n, 'check', cb));
        for (let i = 1; i <= playerCount; i++) {
            const d = document.createElement('div'); d.className = 'custom-bind-player-section'; d.innerHTML = `<h3>${playerNames[i-1]}の縛り</h3>`;
            const g = document.createElement('div'); g.className = 'custom-bind-grid';
            ['各1.1縛り', '体型縛り', '役割縛り', '元素エネルギー縛り', 'ボス素材縛り', '特産品縛り', '敵素材縛り', '突破ステータス縛り(キャラ)', '突破ステータス縛り(武器)', '武器種縛り', '誕生月', 'アルファベット縛り', '天賦素材縛り', 'オリジナル料理種別縛り', '週ボス素材縛り'].forEach(n => createBindItem(n, 'select', g, i));
            const b = document.createElement('div'); b.className = 'button-group-checkbox';
            ['武器縛り', 'キャラルーレット', 'キャラ武器ルーレット', '配布キャラ縛り', '配布武器縛り', '別衣装縛り', '軌跡ついてるキャラ縛り'].forEach(n => createBindItem(n, 'check', b, i));
            d.appendChild(g); d.appendChild(b); pc.appendChild(d);
        }
    }

    function createBindItem(n, t, c, pi = 0) {
        const item = document.createElement('div'); item.className = t === 'check' ? 'checkbox-label' : 'custom-bind-item';
        const l = document.createElement('label'); const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.dataset.bindName = n; if(pi > 0) cb.dataset.player = pi;
        l.appendChild(cb); l.appendChild(document.createTextNode(' '+n)); item.appendChild(l);
        if (t === 'select') {
            const s = document.createElement('select'); s.style.display = 'none';
            s.innerHTML = '<option value="random">ランダム</option>' + subRoulettes[n].map(o => `<option value="${o}">${o}</option>`).join('');
            item.appendChild(s); cb.addEventListener('change', e => s.style.display = e.target.checked ? 'block' : 'none');
        }
        c.appendChild(item);
    }
    
    function executeCustomBinds() {
        initialize(); mode = 'custom_selected'; bindsToResolve = [];
        const bossVal = document.getElementById('customBossSelect').value;
        if(bossVal !== 'random') results.boss = bossVal;
        document.querySelectorAll('#customBindScreen input[type="checkbox"]:checked').forEach(c => {
            const n = c.dataset.bindName, p = c.dataset.player ? parseInt(c.dataset.player) : 0, s = c.closest('div').querySelector('select');
            let t = p ? results.players[p-1] : results.common;
            if (s && s.value !== 'random') t[n] = (n === '元素エネルギー縛り') ? parseInt(s.value) : s.value;
            else bindsToResolve.push({ name: n, player: p });
        });
        bindsToResolve.sort(compareBindResolutionOrder);
        if (!results.boss) { 
            currentRoulette = 'boss'; 
            items = bosses; 
            showScreen('rouletteScreen'); 
            updateDisplayInfo(); 
            prerenderRouletteImage(); 
            drawRoulette();
            document.getElementById('spinButton').disabled = false;
        }
        else { startNextSelectedBind(); }
    }

    function getAvailableBinds() {
        const selected = [...Object.keys(results.common), ...bindsToResolve.map(b => typeof b === 'object' ? b.name : b)];
        return binds.filter(b => !selected.includes(b)).filter(b => {
            const filters = { ...results.common };
            if (subRoulettes[b]) return subRoulettes[b].some(opt => characters.some(c => checkCharEligibility(c, {...filters, [b]: opt}, 1)));
            return characters.some(c => checkCharEligibility(c, filters, 1));
        });
    }

    function proceedToNext() { 
        currentBindIndex++; 
        if (currentBindIndex >= bindsToResolve.length) showResults();
        else startNextSelectedBind(); 
    }

    function showSpiralMode() {
        const input = document.getElementById('spiralPlayerNameInput');
        if (input && !input.value.trim()) input.value = 'プレイヤー1';
        setModeMessage('spiralModeMessage', '');
        document.getElementById('spiralModeResult').classList.add('hidden');
        showScreen('spiralModeScreen');
    }

    function showTheaterMode() {
        const input = document.getElementById('theaterPlayerNameInput');
        if (input && !input.value.trim()) input.value = 'プレイヤー1';
        theaterSpecialSearchKeyword = '';
        const searchInput = document.getElementById('theaterSpecialSearchInput');
        if (searchInput) searchInput.value = '';
        syncTheaterSelections();
        renderTheaterSelectors();
        setModeMessage('theaterModeMessage', '');
        document.getElementById('theaterModeResult').classList.add('hidden');
        showScreen('theaterModeScreen');
    }

    function backToStart() {
        spinning = false;
        // Reset popup completely
        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.display = 'none';
            popup.innerHTML = '';
        }
        document.getElementById('nextButton').classList.add('hidden');
        document.getElementById('notOwnedButton').classList.add('hidden');
        initialize();
        showScreen('startScreen');
    }

   function showMemberSettings() {
        const modal = document.getElementById('memberSettingsModal');
        if (modal) modal.classList.remove('hidden');

        const playerNameInputScreen = document.getElementById('playerNameInputScreen');
        playerNameInputScreen.classList.remove('hidden');
        document.querySelector('.member-select-row').classList.add('hidden');
        document.getElementById('possessionTabs').classList.add('hidden');

        // Clear text input
        const nameInput = document.getElementById('modalPlayerNameInput');
        nameInput.value = '';

        // Populate quick-select buttons from the current player list
        let quickSelectDiv = document.getElementById('playerQuickSelect');
        if (!quickSelectDiv) {
            quickSelectDiv = document.createElement('div');
            quickSelectDiv.id = 'playerQuickSelect';
            playerNameInputScreen.insertBefore(quickSelectDiv, playerNameInputScreen.firstChild);
        }

        const currentPlayerNames = Array.from(document.querySelectorAll('.playerNameInput'))
            .map((inp, i) => inp.value.trim() || `プレイヤー${i + 1}`);

        if (currentPlayerNames.length > 0) {
            quickSelectDiv.innerHTML = '<p style="margin-bottom: 8px; font-weight: bold;">プレイヤーを選択：</p>';
            currentPlayerNames.forEach(name => {
                const btn = document.createElement('button');
                btn.textContent = name;
                btn.className = 'player-quick-select-btn';
                btn.addEventListener('click', () => {
                    nameInput.value = name;
                    goToSettingsScreen();
                });
                quickSelectDiv.appendChild(btn);
            });
            quickSelectDiv.style.marginBottom = '16px';
        } else {
            quickSelectDiv.innerHTML = '';
        }
    }

    function closeMemberSettings() {
        const modal = document.getElementById('memberSettingsModal');
        if (modal) modal.classList.add('hidden');
        // Reset the modal to initial state
        document.getElementById('playerNameInputScreen').classList.remove('hidden');
        document.querySelector('.member-select-row').classList.add('hidden');
        document.getElementById('possessionTabs').classList.add('hidden');
        document.getElementById('modalPlayerNameInput').value = '';
    }

    function goToSettingsScreen() {
        const playerName = document.getElementById('modalPlayerNameInput').value.trim();
        if (!playerName) {
            alert('プレイヤー名を入力してください');
            return;
        }

        // Hide player name input screen
        document.getElementById('playerNameInputScreen').classList.add('hidden');

        // Show the member-select-row with player name and a "back" button
        const memberSelectRow = document.querySelector('.member-select-row');
        memberSelectRow.classList.remove('hidden');
        memberSelectRow.innerHTML = '';

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px;';

        const backBtn = document.createElement('button');
        backBtn.textContent = '← プレイヤー選択に戻る';
        backBtn.className = 'back-to-player-list-btn';
        backBtn.addEventListener('click', showMemberSettings);

        const playerLabel = document.createElement('span');
        playerLabel.textContent = `${playerName} の設定`;
        playerLabel.className = 'editing-player-label';

        infoDiv.appendChild(backBtn);
        infoDiv.appendChild(playerLabel);
        memberSelectRow.appendChild(infoDiv);

        // Show possession tabs
        const possessionTabs = document.getElementById('possessionTabs');
        if (possessionTabs) possessionTabs.classList.remove('hidden');

        // Load data for this player
        loadPlayerData(playerName);
    }

function loadPlayerData(playerName) {
    editingPlayer = playerName;
    
    if (!playerPossession[playerName]) {
        playerPossession[playerName] = { chars: {}, weapons: {} };
    }
    
    const pData = playerPossession[playerName];
    const charList = document.getElementById('charSettingList');
    const weaponList = document.getElementById('weaponSettingList');
    
    // Group characters by country
    charList.innerHTML = '';
    const countries = [...new Set(characters.map(c => c.country))];
    countries.forEach(country => {
        const countryHeader = document.createElement('h3');
        countryHeader.textContent = country;
        countryHeader.style.marginTop = '15px';
        countryHeader.style.marginBottom = '10px';
        countryHeader.style.borderBottom = '2px solid #3498db';
        charList.appendChild(countryHeader);
        
        // Filter and sort characters: rarity, then release order, then name
        const countryChars = characters
            .filter(c => c.country === country)
            .sort(compareCharacterDisplayOrder);
            
        countryChars.forEach(char => {
            const div = document.createElement('div');
            div.className = 'possession-item';
            const owned = pData.chars[char.name] ? pData.chars[char.name].owned !== false : false;
            const c6 = pData.chars[char.name] ? pData.chars[char.name].c6 : false;
            const c0 = pData.chars[char.name] ? pData.chars[char.name].c0 : false;
            
            // ===== キャラクター画像サムネイル =====
            const imageThumb = document.createElement('span');
            imageThumb.className = 'possession-item-thumbnail';
            const thumbImg = document.createElement('img');
            
            const charImagePath = encodeImagePath('character', char.name);
            if (charImagePath) {
                thumbImg.src = charImagePath;
                thumbImg.alt = char.name;
                thumbImg.style.display = 'block';
                thumbImg.style.marginBottom = '8px';
                thumbImg.style.maxWidth = '60px';
                thumbImg.style.maxHeight = '60px';
                thumbImg.style.borderRadius = '5px';
                thumbImg.onerror = function() { this.style.display = 'none'; };
                imageThumb.appendChild(thumbImg);
            }
            div.appendChild(imageThumb);
            
            const labelsContainer = document.createElement('div');
            labelsContainer.innerHTML = `
                <label style="display: block; margin-bottom: 5px;">
                    <input type="checkbox" class="char-owned" data-char="${char.name}" ${owned ? 'checked' : ''}>
                    ${char.name}
                </label>
                <label style="display: block; margin-bottom: 5px; margin-left: 10px;">
                    <input type="checkbox" class="char-c6" data-char="${char.name}" ${c6 ? 'checked' : ''}>
                    完凸
                </label>
                <label style="display: block; margin-left: 10px;">
                    <input type="checkbox" class="char-c0" data-char="${char.name}" ${c0 ? 'checked' : ''}>
                    無凸
                </label>
            `;
            div.appendChild(labelsContainer);
            charList.appendChild(div);
        });
    });
    
    // Group weapons by type
    weaponList.innerHTML = '';
    const weaponTypes = Object.keys(allWeapons);
    weaponTypes.forEach(weaponType => {
        const typeHeader = document.createElement('h3');
        typeHeader.textContent = weaponType;
        typeHeader.style.marginTop = '15px';
        typeHeader.style.marginBottom = '10px';
        typeHeader.style.borderBottom = '2px solid #3498db';
        weaponList.appendChild(typeHeader);
        
        const weaponsOfType = [...allWeapons[weaponType]].sort(compareWeaponDisplayOrder);
        weaponsOfType.forEach(weapon => {
            const div = document.createElement('div');
            div.className = 'possession-item';
            const owned = pData.weapons[weapon.name] === true;
            
            // Create thumbnail image
            const imageThumb = document.createElement('span');
            imageThumb.className = 'possession-item-thumbnail';
            const weaponThumb = document.createElement('img');
            weaponThumb.src = encodeImagePath('weapon', weapon.name);
            weaponThumb.alt = weapon.name;
            weaponThumb.style.maxWidth = '50px';
            weaponThumb.style.maxHeight = '50px';
            weaponThumb.style.display = 'block';
            weaponThumb.style.marginBottom = '8px';
            weaponThumb.onerror = function() { this.style.display = 'none'; };
            imageThumb.appendChild(weaponThumb);
            div.appendChild(imageThumb);
            
            const labelContainer = document.createElement('div');
            labelContainer.innerHTML = `
                <label>
                    <input type="checkbox" class="weapon-owned" data-weapon="${weapon.name}" ${owned ? 'checked' : ''}>
                    ${weapon.name}
                </label>
            `;
            div.appendChild(labelContainer);
            weaponList.appendChild(div);
        });
    });
}


    function savePlayerData() {
        const playerName = editingPlayer;
        
        if (!playerPossession[playerName]) {
            playerPossession[playerName] = { chars: {}, weapons: {} };
        }
        
        const pData = playerPossession[playerName];
        
        document.querySelectorAll('.char-owned').forEach(cb => {
            const charName = cb.dataset.char;
            if (!pData.chars[charName]) pData.chars[charName] = {};
            pData.chars[charName].owned = cb.checked;
        });
        
        document.querySelectorAll('.char-c6').forEach(cb => {
            const charName = cb.dataset.char;
            if (!pData.chars[charName]) pData.chars[charName] = {};
            pData.chars[charName].c6 = cb.checked;
        });
        
        document.querySelectorAll('.char-c0').forEach(cb => {
            const charName = cb.dataset.char;
            if (!pData.chars[charName]) pData.chars[charName] = {};
            pData.chars[charName].c0 = cb.checked;
        });
        
        document.querySelectorAll('.weapon-owned').forEach(cb => {
            const weaponName = cb.dataset.weapon;
            pData.weapons[weaponName] = cb.checked;
        });
        
        localStorage.setItem('genshin_roulette_possession', JSON.stringify(playerPossession));
        alert('保存しました！');
    }

    function showAbout() {
        const modal = document.getElementById('aboutScreen');
        if (modal) modal.classList.remove('hidden');
    }

    function closeAbout() {
        const modal = document.getElementById('aboutScreen');
        if (modal) modal.classList.add('hidden');
    }

    document.getElementById('stopButton').addEventListener('click', stopRoulette);
    document.getElementById('spinButton').addEventListener('click', spinRoulette);
    document.getElementById('nextButton').addEventListener('click', nextStep);
    document.getElementById('notOwnedButton').addEventListener('click', notOwned);
    document.getElementById('homeButton').addEventListener('click', backToStart);
    document.getElementById('backToStartButton').addEventListener('click', backToStart);

    document.getElementById('startAllButton').addEventListener('click', () => startRoulette('all'));
    document.getElementById('startBossButton').addEventListener('click', () => startRoulette('boss'));
    document.getElementById('startBindButton').addEventListener('click', () => {
        startRoulette('bind');
    });
    document.getElementById('showBindSelectionButton').addEventListener('click', showBindSelection);
    document.getElementById('executeSelectionButton').addEventListener('click', () => {
        isWeeklyBossMode = document.getElementById('weeklyBossModeSelection').checked;
        executeBinds();
    });
    document.getElementById('showCustomBindScreenButton').addEventListener('click', showCustomBindScreen);
    document.getElementById('executeCustomBindsButton').addEventListener('click', () => {
        isWeeklyBossMode = document.getElementById('weeklyBossModeCustom').checked;
        executeCustomBinds();
    });
    document.getElementById('startSpiralModeButton').addEventListener('click', showSpiralMode);
    document.getElementById('startTheaterModeButton').addEventListener('click', showTheaterMode);
    document.getElementById('executeSpiralDrawButton').addEventListener('click', executeSpiralDraw);
    document.getElementById('executeTheaterDrawButton').addEventListener('click', executeTheaterDraw);
    document.getElementById('openSpiralMemberSettingsButton').addEventListener('click', () => openMemberSettingsFromMode('spiralPlayerNameInput'));
    document.getElementById('openTheaterMemberSettingsButton').addEventListener('click', () => openMemberSettingsFromMode('theaterPlayerNameInput'));
    document.getElementById('showMemberSettingsButton').addEventListener('click', showMemberSettings);
    const theaterSpecialSearchInput = document.getElementById('theaterSpecialSearchInput');
    if (theaterSpecialSearchInput) {
        theaterSpecialSearchInput.addEventListener('input', () => {
            theaterSpecialSearchKeyword = theaterSpecialSearchInput.value.trim();
            renderTheaterSpecialSelector();
        });
    }
    
    const goToSettingsBtn = document.getElementById('goToSettingsButton');
    if (goToSettingsBtn) {
        goToSettingsBtn.addEventListener('click', goToSettingsScreen);
    }
    
    const closeMemberSettingsBtn = document.getElementById('closeMemberSettings');
    if (closeMemberSettingsBtn) {
        closeMemberSettingsBtn.addEventListener('click', closeMemberSettings);
    }
    
    const savePlayerDataBtn = document.getElementById('savePlayerData');
    if (savePlayerDataBtn) {
        savePlayerDataBtn.addEventListener('click', savePlayerData);
    }
    
    document.getElementById('showAboutButton').addEventListener('click', showAbout);
    document.getElementById('closeAboutButton').addEventListener('click', closeAbout);

    updatePlayerNameInputs();
    showScreen('startScreen');
    renderTheaterSelectors();
    function startRoulette(rouletteMode) {
        initialize();
        mode = rouletteMode;
        
        if (mode === 'all' || mode === 'boss') {
            currentRoulette = 'boss';
            items = bosses;
            updateDisplayInfo();
            prerenderRouletteImage();
            showScreen('rouletteScreen');
            drawRoulette();
            document.getElementById('spinButton').disabled = false;
        } else if (mode === 'bind') {
            bindSelectionPhase = true;
            items = getAvailableBinds();
            currentRoulette = 'bind';
            updateDisplayInfo();
            prerenderRouletteImage();
            showScreen('rouletteScreen');
            drawRoulette();
            document.getElementById('spinButton').disabled = false;
        }
    }

    function showBindSelection() {
        initialize();
        mode = 'selection';
        
        // bindButtonsに縛り選択チェックボックスを生成
        const bindButtonsDiv = document.getElementById('bindButtons');
        bindButtonsDiv.innerHTML = '';
        
        binds.forEach(bindName => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.bindName = bindName;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + bindName));
            bindButtonsDiv.appendChild(label);
        });
        
        showScreen('bindSelection');
    }

    function startNextSelectedBind() {
        if (currentBindIndex >= bindsToResolve.length) {
            showResults();
            return;
        }
        
        const bindItem = bindsToResolve[currentBindIndex];
        const bindName = bindItem.name;
        const player = bindItem.player || currentPlayer;
        
        if (player > 0) {
            currentPlayer = player;
        }
        
        setupRouletteForBind(bindName, player > 0 ? player : currentPlayer);
    }

    function executeBinds() {
        initialize();
        mode = 'selected';
        
        const checkboxes = document.querySelectorAll('#bindButtons input[type="checkbox"]:checked');
        bindsToResolve = [];
        
        checkboxes.forEach(checkbox => {
            const bindName = checkbox.dataset.bindName;
            // playerBindTypes are binds that apply individually to each player
            // (e.g. キャラルーレット, 武器縛り). Add one entry per player so
            // each player's roulette is resolved separately.
            if (playerBindTypes.includes(bindName)) {
                // Per-player binds are added once for each player
                for (let i = 1; i <= playerCount; i++) {
                    bindsToResolve.push({ name: bindName, player: i });
                }
            } else {
                bindsToResolve.push({ name: bindName, player: 0 });
            }
        });
        
        if (bindsToResolve.length === 0) {
            alert('縛りを選択してください');
            return;
        }
        
        bindsToResolve.sort(compareBindResolutionOrder);
        
        // Start with the first selected bind, not boss roulette
        currentBindIndex = 0;
        startNextSelectedBind();
    }

    updatePlayerNameInputs();

    // ============================================================
    // キャラクター/武器データモーダル
    // ============================================================

    window.showCharDataTab = function(tabName) {
        document.querySelectorAll('#charDataModal .tab-content').forEach(t => t.classList.add('hidden'));
        document.getElementById(tabName).classList.remove('hidden');
        document.querySelectorAll('#charDataModal .tab-btn').forEach(b => b.classList.remove('active'));
        if (tabName === 'charDataCharTab') document.getElementById('charDataTab-char').classList.add('active');
        if (tabName === 'charDataWeaponTab') document.getElementById('charDataTab-weapon').classList.add('active');
    };

    function showCharDataModal() {
        const modal = document.getElementById('charDataModal');
        if (modal) modal.classList.remove('hidden');
        buildCharDataFilters();
        renderCharDataList();
        buildWeaponDataFilters();
        renderWeaponDataList();
    }

    function closeCharDataModal() {
        const modal = document.getElementById('charDataModal');
        if (modal) modal.classList.add('hidden');
    }

    let charDataFilters = {};
    let weaponDataFilters = {};

    function parseReleaseVersionSortKey(versionValue) {
        const lunaMatch = String(versionValue || '').match(/^Luna\s+\w+\s+\((\d+\.\d+)\)/);
        // Luna系は通常バージョン(例: 5.8)より後ろに並ぶようにオフセットを加算する
        return lunaMatch ? parseFloat(lunaMatch[1]) + 100 : parseFloat(versionValue) || 0;
    }

    function getEnemyMaterialList(char) {
        if (!char) return [];
        return Array.isArray(char.enemy_material) ? char.enemy_material : (char.enemy_material ? [char.enemy_material] : []);
    }

    function compareWeaponDisplayOrder(a, b) {
        const rarityDiff = (b.rarity || 0) - (a.rarity || 0);
        if (rarityDiff !== 0) return rarityDiff;
        const versionDiff = parseReleaseVersionSortKey(a.release_version) - parseReleaseVersionSortKey(b.release_version);
        if (versionDiff !== 0) return versionDiff;
        const releaseOrderDiff = (weaponReleaseOrderMap[a.name] ?? Number.MAX_SAFE_INTEGER) - (weaponReleaseOrderMap[b.name] ?? Number.MAX_SAFE_INTEGER);
        if (releaseOrderDiff !== 0) return releaseOrderDiff;
        return String(a.name || '').localeCompare(String(b.name || ''), 'ja');
    }

    function getCharacterDisplayRarity(char) {
        const rarityList = Array.isArray(char?.rarity) ? char.rarity : [char?.rarity];
        if (rarityList.some(rarity => String(rarity || '').includes('☆５'))) return 5;
        if (rarityList.some(rarity => String(rarity || '').includes('☆４'))) return 4;
        return 0;
    }

    function compareCharacterDisplayOrder(a, b) {
        const rarityDiff = getCharacterDisplayRarity(b) - getCharacterDisplayRarity(a);
        if (rarityDiff !== 0) return rarityDiff;
        const versionDiff = parseReleaseVersionSortKey(a.release_version) - parseReleaseVersionSortKey(b.release_version);
        if (versionDiff !== 0) return versionDiff;
        return String(a.name || '').localeCompare(String(b.name || ''), 'ja');
    }

    function buildCharDataFilters() {
        const container = document.getElementById('charDataFilters');
        if (!container) return;
        container.innerHTML = '';
        const filterDefs = [
            { key: 'name', label: '名前', type: 'text' },
            { key: 'country', label: '国', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.country))])] },
            { key: 'weapon', label: '武器種', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.weapon))])] },
            { key: 'element', label: '元素', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.element))])] },
            { key: 'birth_month', label: '誕生月', type: 'select', values: () => ['', ...["１月","２月","３月","４月","５月","６月","７月","８月","９月","１０月","１１月","１２月","その他"]] },
            { key: 'release_version', label: '実装バージョン', type: 'select', values: () => ['', ...([...new Set(characters.map(c => c.release_version).filter(Boolean))].sort((a, b) => parseReleaseVersionSortKey(a) - parseReleaseVersionSortKey(b)))] },
            { key: 'version', label: 'バージョン', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.version))])] },
            { key: 'rarity', label: 'レアリティ', type: 'select', values: () => ['', '☆５', '☆４'] },
            { key: 'body', label: '体型', type: 'select', values: () => ['', ...jpSort([...new Set(characters.flatMap(c => Array.isArray(c.body) ? c.body : [c.body]))])] },
            { key: 'role', label: '役割', type: 'select', values: () => ['', ...jpSort([...new Set(characters.flatMap(c => c.role || []))])] },
            { key: 'energy', label: 'エネルギー', type: 'select', values: () => ['', ...[...new Set(characters.map(c => c.energy))].sort((a,b) => a-b)] },
            { key: 'talent_boss', label: 'ボス素材', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.talent_boss).filter(b => b))])] },
            { key: 'local_specialty', label: '特産品', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.local_specialty).filter(l => l))])] },
            { key: 'enemy_material', label: '敵素材', type: 'select', values: () => ['', ...jpSort([...new Set(characters.flatMap(c => getEnemyMaterialList(c)))])] },
            { key: 'ascension_stat', label: '突破ステータス', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.ascension_stat).filter(s => s))])] },
            { key: 'talent_book', label: '天賦', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.talent_book).filter(b => b && !b.includes('/')))])] },
            { key: 'talent_weekly', label: '週ボス素材', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.talent_weekly).filter(w => w && !w.includes('/')))])] },
            { key: 'special_dish', label: 'オリジナル料理', type: 'select', values: () => ['', ...jpSort([...new Set(characters.map(c => c.special_dish).filter(d => d))])] },
            { key: 'distributed', label: '配布', type: 'select', values: () => ['', 'true', 'false'] },
            { key: 'training_road', label: '鍛錬の道', type: 'select', values: () => ['', 'true', 'false'] },
            { key: 'trace', label: '軌跡', type: 'select', values: () => ['', 'true', 'false'] },
            { key: 'costume', label: '別衣装', type: 'select', values: () => ['', 'true', 'false'] },
        ];
        const defaultFilters = Object.fromEntries(filterDefs.map(def => [def.key, '']));
        charDataFilters = Object.fromEntries(filterDefs.map(def => [def.key, charDataFilters[def.key] ?? defaultFilters[def.key]]));
        let resetButton = null;
        const updateResetButtonState = () => {
            if (!resetButton) return;
            resetButton.disabled = filterDefs.every(def => (charDataFilters[def.key] ?? '') === '');
        };
        filterDefs.forEach(def => {
            const item = document.createElement('div');
            item.className = 'data-filter-item';
            const label = document.createElement('label');
            label.textContent = def.label;
            item.appendChild(label);
            if (def.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = def.label + '検索';
                input.dataset.filterKey = def.key;
                input.value = charDataFilters[def.key] || '';
                input.addEventListener('input', () => {
                    charDataFilters[def.key] = input.value.trim();
                    updateResetButtonState();
                    renderCharDataList();
                });
                item.appendChild(input);
            } else {
                const sel = document.createElement('select');
                sel.dataset.filterKey = def.key;
                def.values().forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v === '' ? 'すべて' : v === 'true' ? 'あり' : v === 'false' ? 'なし' : v;
                    sel.appendChild(opt);
                });
                sel.value = charDataFilters[def.key] || '';
                sel.addEventListener('change', () => {
                    charDataFilters[def.key] = sel.value;
                    updateResetButtonState();
                    renderCharDataList();
                });
                item.appendChild(sel);
            }
            container.appendChild(item);
        });
        resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = 'data-filter-reset-button';
        resetButton.textContent = 'フィルターをリセット';
        resetButton.addEventListener('click', () => {
            charDataFilters = { ...defaultFilters };
            container.querySelectorAll('input[data-filter-key], select[data-filter-key]').forEach(el => {
                const key = el.dataset.filterKey;
                el.value = defaultFilters[key] ?? '';
            });
            updateResetButtonState();
            renderCharDataList();
        });
        container.appendChild(resetButton);
        updateResetButtonState();
    }

    function renderCharDataList() {
        const container = document.getElementById('charDataList');
        if (!container) return;
        container.innerHTML = '';
        const f = charDataFilters;
        const normalizedNameFilter = normalizeNameSearchText(f.name);
        let filtered = characters.filter(c => {
            if (normalizedNameFilter && !getCharacterSearchTarget(c.name).includes(normalizedNameFilter)) return false;
            if (f.country && f.country !== '' && c.country !== f.country) return false;
            if (f.weapon && f.weapon !== '' && c.weapon !== f.weapon) return false;
            if (f.element && f.element !== '' && c.element !== f.element) return false;
            if (f.birth_month && f.birth_month !== '' && c.birth_month !== f.birth_month) return false;
            if (f.release_version && f.release_version !== '' && c.release_version !== f.release_version) return false;
            if (f.version && f.version !== '' && c.version !== f.version) return false;
            if (f.rarity && f.rarity !== '') {
                const rList = Array.isArray(c.rarity) ? c.rarity : [c.rarity];
                if (!rList.some(r => r.includes(f.rarity))) return false;
            }
            if (f.body && f.body !== '') {
                const bList = Array.isArray(c.body) ? c.body : [c.body];
                if (!bList.includes(f.body)) return false;
            }
            if (f.role && f.role !== '') {
                const rList = Array.isArray(c.role) ? c.role : [c.role];
                if (!rList.includes(f.role)) return false;
            }
            if (f.energy && f.energy !== '') { if (c.energy !== Number(f.energy)) return false; }
            if (f.talent_boss && f.talent_boss !== '' && c.talent_boss !== f.talent_boss) return false;
            if (f.local_specialty && f.local_specialty !== '' && c.local_specialty !== f.local_specialty) return false;
            if (f.enemy_material && f.enemy_material !== '') {
                const eList = getEnemyMaterialList(c);
                if (!eList.includes(f.enemy_material)) return false;
            }
            if (f.ascension_stat && f.ascension_stat !== '' && c.ascension_stat !== f.ascension_stat) return false;
            if (f.talent_book && f.talent_book !== '' && c.talent_book !== f.talent_book) return false;
            if (f.talent_weekly && f.talent_weekly !== '' && c.talent_weekly !== f.talent_weekly) return false;
            if (f.special_dish && f.special_dish !== '' && c.special_dish !== f.special_dish) return false;
            if (f.distributed && f.distributed !== '') {
                if (f.distributed === 'true' && !c.distributed) return false;
                if (f.distributed === 'false' && c.distributed) return false;
            }
            if (f.training_road && f.training_road !== '') {
                if (f.training_road === 'true' && !c.training_road) return false;
                if (f.training_road === 'false' && c.training_road) return false;
            }
            if (f.trace && f.trace !== '') {
                if (f.trace === 'true' && !c.trace) return false;
                if (f.trace === 'false' && c.trace) return false;
            }
            if (f.costume && f.costume !== '') {
                if (f.costume === 'true' && !c.costume) return false;
                if (f.costume === 'false' && c.costume) return false;
            }
            return true;
        }).sort(compareCharacterDisplayOrder);
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#95a5a6;">該当するキャラクターがいません</p>';
            return;
        }
        filtered.forEach(char => {
            const card = document.createElement('div');
            card.className = 'data-card';
            const img = document.createElement('img');
            const imgPath = encodeImagePath('character', char.name);
            if (imgPath) { img.src = imgPath; img.alt = char.name; img.onerror = function() { this.style.display = 'none'; }; }
            else { img.style.display = 'none'; }
            card.appendChild(img);
            const nameSpan = document.createElement('span');
            nameSpan.className = 'data-card-name';
            nameSpan.textContent = char.name;
            card.appendChild(nameSpan);
            const raritySpan = document.createElement('span');
            raritySpan.className = 'data-card-rarity';
            raritySpan.textContent = (Array.isArray(char.rarity) ? char.rarity[0] : char.rarity) || '';
            card.appendChild(raritySpan);
            card.addEventListener('click', () => showCharDetail(char));
            container.appendChild(card);
        });
    }

    function buildWeaponDataFilters() {
        const container = document.getElementById('weaponDataFilters');
        if (!container) return;
        container.innerHTML = '';
        const allWeaponList = Object.values(allWeapons).flat();
        const filterDefs = [
            { key: 'name', label: '名前', type: 'text' },
            { key: 'type', label: '武器種', type: 'select', values: () => ['', ...jpSort(Object.keys(allWeapons))] },
            { key: 'rarity', label: 'レアリティ', type: 'select', values: () => ['', ...[...new Set(allWeaponList.map(w => w.rarity))].sort((a,b) => b-a).map(String)] },
            { key: 'ascension_stat', label: '突破ステータス', type: 'select', values: () => ['', ...jpSort([...new Set(allWeaponList.map(w => w.ascension_stat).filter(s => s))])] },
            { key: 'release_version', label: '実装バージョン', type: 'select', values: () => ['', ...([...new Set(allWeaponList.map(w => w.release_version).filter(Boolean))].sort((a, b) => parseReleaseVersionSortKey(a) - parseReleaseVersionSortKey(b)))] },
            { key: 'is_distributed', label: '配布', type: 'select', values: () => ['', 'true', 'false'] },
        ];
        filterDefs.forEach(def => {
            const item = document.createElement('div');
            item.className = 'data-filter-item';
            const label = document.createElement('label');
            label.textContent = def.label;
            item.appendChild(label);
            if (def.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = def.label + '検索';
                input.addEventListener('input', () => { weaponDataFilters[def.key] = input.value.trim(); renderWeaponDataList(); });
                item.appendChild(input);
            } else {
                const sel = document.createElement('select');
                def.values().forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v === '' ? 'すべて' : v === 'true' ? 'あり' : v === 'false' ? 'なし' : v;
                    sel.appendChild(opt);
                });
                sel.addEventListener('change', () => { weaponDataFilters[def.key] = sel.value; renderWeaponDataList(); });
                item.appendChild(sel);
            }
            container.appendChild(item);
        });
    }

    function renderWeaponDataList() {
        const container = document.getElementById('weaponDataList');
        if (!container) return;
        container.innerHTML = '';
        const allWeaponList = Object.values(allWeapons).flat();
        const f = weaponDataFilters;
        let filtered = allWeaponList.filter(w => {
            if (f.name && !w.name.includes(f.name)) return false;
            if (f.type && f.type !== '' && w.type !== f.type) return false;
            if (f.rarity && f.rarity !== '' && w.rarity !== Number(f.rarity)) return false;
            if (f.ascension_stat && f.ascension_stat !== '' && w.ascension_stat !== f.ascension_stat) return false;
            if (f.release_version && f.release_version !== '' && w.release_version !== f.release_version) return false;
            if (f.is_distributed && f.is_distributed !== '') {
                if (f.is_distributed === 'true' && !w.is_distributed) return false;
                if (f.is_distributed === 'false' && w.is_distributed) return false;
            }
            return true;
        }).sort(compareWeaponDisplayOrder);
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#95a5a6;">該当する武器がありません</p>';
            return;
        }
        filtered.forEach(weapon => {
            const card = document.createElement('div');
            card.className = 'data-card';
            const img = document.createElement('img');
            const imgPath = encodeImagePath('weapon', weapon.name);
            if (imgPath) { img.src = imgPath; img.alt = weapon.name; img.onerror = function() { this.style.display = 'none'; }; }
            else { img.style.display = 'none'; }
            card.appendChild(img);
            const nameSpan = document.createElement('span');
            nameSpan.className = 'data-card-name';
            nameSpan.textContent = weapon.name;
            card.appendChild(nameSpan);
            const raritySpan = document.createElement('span');
            raritySpan.className = 'data-card-rarity';
            raritySpan.textContent = '☆' + weapon.rarity;
            card.appendChild(raritySpan);
            card.addEventListener('click', () => showWeaponDetail(weapon));
            container.appendChild(card);
        });
    }

    function showCharDetail(char) {
        const modal = document.getElementById('detailModal');
        const body = document.getElementById('detailModalBody');
        if (!modal || !body) return;
        const imgPath = encodeImagePath('character', char.name);
        const rarityText = Array.isArray(char.rarity) ? char.rarity.join(' / ') : (char.rarity || '');
        const bodyText = Array.isArray(char.body) ? char.body.join(' / ') : (char.body || '');
        const roleText = Array.isArray(char.role) ? char.role.join('、') : (char.role || '');
        const enemyMaterialText = getEnemyMaterialList(char).join(' / ');
        const birthday = char.birthday || '';
        const fields = [
            { label: '国', value: char.country || '' },
            { label: '武器種', value: char.weapon || '' },
            { label: '元素', value: char.element || '' },
            { label: '誕生日', value: birthday },
            { label: '誕生月', value: char.birth_month || '' },
            { label: '実装バージョン', value: char.release_version || '' },
            { label: 'バージョン', value: char.version || '' },
            { label: 'レアリティ', value: rarityText },
            { label: '体型', value: bodyText },
            { label: '役割', value: roleText },
            { label: 'エネルギー', value: char.energy !== undefined ? String(char.energy) : '' },
            { label: 'ボス素材', value: char.talent_boss || '' },
            { label: '特産品', value: char.local_specialty || '' },
            { label: '敵素材', value: enemyMaterialText },
            { label: '突破ステータス', value: char.ascension_stat || '' },
            { label: '天賦', value: char.talent_book || '' },
            { label: '週ボス素材', value: char.talent_weekly || '' },
            { label: 'オリジナル料理', value: char.special_dish || '' },
            { label: '配布', value: char.distributed ? 'あり' : 'なし' },
            { label: '鍛錬の道', value: char.training_road ? 'あり' : 'なし' },
            { label: '軌跡', value: char.trace ? 'あり' : 'なし' },
            { label: '別衣装', value: char.costume ? 'あり' : 'なし' },
        ];
        let html = '<div class="detail-header">';
        if (imgPath) html += `<img src="${imgPath}" alt="${char.name}" onerror="this.style.display='none'">`;
        html += `<div class="detail-title"><h3>${char.name}</h3></div></div>`;
        html += '<div class="detail-grid">';
        fields.forEach(f => {
            if (f.value !== '' && f.value !== undefined && f.value !== null) {
                html += `<div class="detail-item"><div class="detail-item-label">${f.label}</div><div class="detail-item-value">${f.value}</div></div>`;
            }
        });
        html += '</div>';
        body.innerHTML = html;
        modal.classList.remove('hidden');
    }
    window.showCharDetail = showCharDetail;

    function showWeaponDetail(weapon) {
        const modal = document.getElementById('detailModal');
        const body = document.getElementById('detailModalBody');
        if (!modal || !body) return;
        const imgPath = encodeImagePath('weapon', weapon.name);
        const fields = [
            { label: '武器種', value: weapon.type || '' },
            { label: 'レアリティ', value: weapon.rarity ? '☆' + weapon.rarity : '' },
            { label: '突破ステータス', value: weapon.ascension_stat || '' },
            { label: '実装バージョン', value: weapon.release_version || '' },
            { label: '配布', value: weapon.is_distributed ? 'あり' : 'なし' },
        ];
        let html = '<div class="detail-header">';
        if (imgPath) html += `<img src="${imgPath}" alt="${weapon.name}" onerror="this.style.display='none'">`;
        html += `<div class="detail-title"><h3>${weapon.name}</h3></div></div>`;
        html += '<div class="detail-grid">';
        fields.forEach(f => {
            if (f.value !== '' && f.value !== undefined) {
                html += `<div class="detail-item"><div class="detail-item-label">${f.label}</div><div class="detail-item-value">${f.value}</div></div>`;
            }
        });
        html += '</div>';
        body.innerHTML = html;
        modal.classList.remove('hidden');
    }
    window.showWeaponDetail = showWeaponDetail;

    function closeDetailModal() {
        const modal = document.getElementById('detailModal');
        if (modal) modal.classList.add('hidden');
    }

    function makeResultItemsClickable() {
        document.querySelectorAll('.char-list-final').forEach(el => {
            const text = el.textContent.trim();
            const char = characters.find(c => c.name === text);
            if (char) {
                el.classList.add('clickable-result');
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => showCharDetail(char));
            } else {
                const weapon = Object.values(allWeapons).flat().find(w => w.name === text);
                if (weapon) {
                    el.classList.add('clickable-result');
                    el.style.cursor = 'pointer';
                    el.addEventListener('click', () => showWeaponDetail(weapon));
                }
            }
        });
        document.querySelectorAll('.result-card').forEach(card => {
            const nameSpan = card.querySelector('span');
            if (!nameSpan) return;
            const name = nameSpan.textContent.trim();
            const char = characters.find(c => c.name === name);
            if (char) {
                card.classList.add('clickable');
                card.addEventListener('click', () => showCharDetail(char));
            } else {
                const weapon = Object.values(allWeapons).flat().find(w => w.name === name);
                if (weapon) {
                    card.classList.add('clickable');
                    card.addEventListener('click', () => showWeaponDetail(weapon));
                }
            }
        });
    }

    document.getElementById('showCharDataButton').addEventListener('click', showCharDataModal);
    document.getElementById('closeCharDataModal').addEventListener('click', closeCharDataModal);
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);

    // Close modals on overlay click
    document.getElementById('charDataModal').addEventListener('click', function(e) {
        if (e.target === this) closeCharDataModal();
    });
    document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeDetailModal();
    });

});
