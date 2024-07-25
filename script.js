const heroes = {
  "对抗路": {
    "孙悟空": { "name": "孙悟空", "cd": 30, "levelCd": { "1": 0, "2": 5, "3": 10, "4": 15, "5": 20, "6": 25 } },
    "项羽": { "name": "项羽", "cd": 50, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "关羽": { "name": "关羽", "cd": 70, "levelCd": { "1": 0, "2": 10, "3": 20 } },
    "吕布": { "name": "吕布", "cd": 50, "levelCd": { "1": 0, "2": 0, "3": 0 } },
    "亚连": { "name": "亚连", "cd": 45, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "哪吒": { "name": "哪吒", "cd": 50, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "司空震": { "name": "司空震", "cd": 50, "levelCd": { "1": 0, "2": 10, "3": 20 } },
  },
  "中路": {
    "海月": { "name": "海月", "cd": 70, "levelCd": { "1": 0, "2": 0, "3": 0 } },
  },
  "发育路": {
    "马可波罗": { "name": "马可波罗", "cd": 120, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "敖隐": { "name": "敖隐", "cd": 80, "levelCd": { "1": 0, "2": 5, "3": 10 } },
  },
  "辅助": {
    "太乙真人": { "name": "太乙真人", "cd": 70, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "大乔": { "name": "大乔", "cd": 80, "levelCd": { "1": 0, "2": 8, "3": 16 } },
  },
  "打野": {
    "凯": { "name": "凯", "cd": 60, "levelCd": { "1": 0, "2": 5, "3": 10 } },
    "宫本武藏": { "name": "宫本武藏", "cd": 50, "levelCd": { "1": 0, "2": 5, "3": 10 } },
  }
};

const cooldownReduction = {
  "冷却鞋": 0.15, "暗影战斧": 0.1, "冰心": 0.2, "金身": 0.1
};

const heroSelection = document.getElementById('hero-selection');
const timersContainer = document.getElementById('timers');

let selectedHeroes = [];

for (const lane in heroes) {
  const laneGroup = document.createElement('div');
  laneGroup.classList.add('hero-lane-group', 'col-md-4');
  laneGroup.innerHTML = `<h3>${lane}</h3>`;

  for (const heroName in heroes[lane]) {
    const button = document.createElement('button');
    button.textContent = heroName;
    button.classList.add('btn', 'btn-secondary', 'btn-block');
    button.addEventListener('click', () => handleHeroClick(heroes[lane][heroName], button));
    laneGroup.appendChild(button);
  }
  document.getElementById('hero-lanes').appendChild(laneGroup);
}

function handleHeroClick(hero, button) {
  const heroIndex = selectedHeroes.indexOf(hero);
  if (heroIndex === -1 && selectedHeroes.length < 5) {
    selectedHeroes.push(hero);
    button.classList.add('selected');
    createHeroTimer(hero);
  } else if (heroIndex !== -1) {
    selectedHeroes.splice(heroIndex, 1);
    button.classList.remove('selected');
    removeHeroTimer(hero);
  }
}

function createHeroTimer(hero) {
  const div = document.createElement('div');
  div.classList.add('hero');
  div.setAttribute('data-hero', hero.name);
  div.innerHTML = `
    <h2>${hero.name}</h2>
    <div class="countdown-container">
      <svg class="countdown-svg" width="100" height="100">
        <circle class="countdown-circle" cx="50" cy="50" r="45" stroke="#e9ecef"/>
        <circle class="countdown-circle" cx="50" cy="50" r="45" stroke="#007bff" stroke-dasharray="283 283"/>
      </svg>
      <div class="countdown-text">${hero.cd}</div>
    </div>
    <button class="jishiqi start">开始计时</button>
    <button class="jishiqi pause">暂停计时</button>
    <button class="jishiqi reset">重置计时</button>
    <div class="button-group">
      <button data-item="冷却鞋">冷却鞋 (-15%)</button>
      <button data-item="暗影战斧">暗影战斧 (-10%)</button>
      <button data-item="冰心">冰心 (-20%)</button>
      <button data-item="金身">金身 (-10%)</button>
    </div>
    <div class="level-control">
      <button class="level-up">⬆️</button>
      <span class="level">1</span>
      <button class="level-down">⬇️</button>
    </div>
  `;
  timersContainer.appendChild(div);

  hero.timer = null;
  hero.originalCd = hero.cd;
  hero.currentCd = hero.cd;
  hero.equippedItems = [];
  hero.totalCooldownReduction = 0;
  hero.level = 1;

  const startButton = div.querySelector('.start');
  const pauseButton = div.querySelector('.pause');
  const resetButton = div.querySelector('.reset');
  const cooldownButtons = div.querySelectorAll('.button-group button');
  const levelUpButton = div.querySelector('.level-up');
  const levelDownButton = div.querySelector('.level-down');
  const levelSpan = div.querySelector('.level');

  startButton.addEventListener('click', () => startCountdown(hero));
  pauseButton.addEventListener('click', () => pauseCountdown(hero));
  resetButton.addEventListener('click', () => resetCountdown(hero));
  cooldownButtons.forEach(button => {
    button.addEventListener('click', () => applyCooldownReduction(hero, button));
  });
  levelUpButton.addEventListener('click', () => updateLevel(hero, levelSpan, 1));
  levelDownButton.addEventListener('click', () => updateLevel(hero, levelSpan, -1));
}

function startCountdown(hero) {
  if (hero.timer) clearInterval(hero.timer);
  const countdownCircle = document.querySelector(`.hero[data-hero="${hero.name}"] .countdown-svg .countdown-circle:last-child`);
  const countdownText = document.querySelector(`.hero[data-hero="${hero.name}"] .countdown-text`);
  const totalDashArray = 2 * Math.PI * 45; // 2πr
  hero.timer = setInterval(() => {
    hero.currentCd--;
    const dashArrayValue = totalDashArray * (hero.currentCd / hero.originalCd);
    countdownCircle.style.strokeDasharray = `${dashArrayValue} ${totalDashArray}`;
    countdownText.textContent = hero.currentCd;
    if (hero.currentCd === 0) {
      clearInterval(hero.timer);
      speak(`${hero.name} 大招已冷却完毕！`);
      resetCountdown(hero);
    }
  }, 1000);
}

function pauseCountdown(hero) {
  if (hero.timer) clearInterval(hero.timer);
}

function resetCountdown(hero) {
  hero.currentCd = (hero.originalCd - hero.levelCd[hero.level]) * (1 - hero.totalCooldownReduction); // 使用新的冷却时间计算
  updateCountdownCircle(hero);
  clearInterval(hero.timer);
}

function removeHeroTimer(hero) {
  const heroDiv = document.querySelector(`.hero[data-hero="${hero.name}"]`);
  if (heroDiv) timersContainer.removeChild(heroDiv);
}

function applyCooldownReduction(hero, button) {
  const item = button.dataset.item;
  if (button.classList.contains('active')) {
    button.classList.remove('active');
    hero.equippedItems = hero.equippedItems.filter(equippedItem => equippedItem !== item);
  } else {
    button.classList.add('active');
    hero.equippedItems.push(item);
  }

  // 重新计算总冷却缩减
  hero.totalCooldownReduction = Math.min(hero.equippedItems.reduce((acc, equippedItem) => acc + cooldownReduction[equippedItem], 0), 0.4);

  // 更新冷却时间，先减去等级冷却时间，再计算冷却减缩
  hero.currentCd = (hero.originalCd - hero.levelCd[hero.level]) * (1 - hero.totalCooldownReduction); 

  updateCountdownCircle(hero);
}

function updateLevel(hero, levelSpan, change) {
  const maxLevel = Object.keys(hero.levelCd).length;
  hero.level = Math.min(Math.max(hero.level + change, 1), maxLevel);
  levelSpan.textContent = hero.level;

  // 更新冷却时间，先减去等级冷却时间，再计算冷却减缩
  hero.currentCd = (hero.originalCd - hero.levelCd[hero.level]) * (1 - hero.totalCooldownReduction); 

  updateCountdownCircle(hero);
}

function updateCountdownCircle(hero) {
  const countdownCircle = document.querySelector(`.hero[data-hero="${hero.name}"] .countdown-svg .countdown-circle:last-child`);
  const countdownText = document.querySelector(`.hero[data-hero="${hero.name}"] .countdown-text`);
  const totalDashArray = 2 * Math.PI * 45;
  const dashArrayValue = totalDashArray * (hero.currentCd / hero.originalCd);
  countdownCircle.style.strokeDasharray = `${dashArrayValue} ${totalDashArray}`;
  countdownText.textContent = hero.currentCd;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}