// const heroes = {
//   "对抗路": {
//     "刘邦": { "name": "刘邦", "cd": 60, "levelCd": { "1": 0, "2": 5, "3": 10 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/149/149.jpg' },
//   },
//   "中路": {
//     "武则天": { "name": "武则天", "cd": 80, "levelCd": { "1": 0, "2": 10, "3": 20 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/136/136.jpg' },
//   },
//   "发育路": {
//     "成吉思汗": { "name": "成吉思汗", "cd": 2, "levelCd": { "1": 0, "2": 0, "3": 0 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/177/177.jpg' },
//   },
//   "辅助": {
//     "廉颇": { "name": "廉颇", "cd": 50, "levelCd": { "1": 0, "2": 5, "3": 10 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/105/105.jpg' },
//   },
//   "打野": {
//     "梦奇": { "name": "梦奇", "cd": 40, "levelCd": { "1": 0, "2": 5, "3": 10 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/198/198.jpg' },
//   },
//   "召唤师技能": {
//     "狂暴-60秒": { "name": "狂暴", "cd": 60, "levelCd": { "1": 0, "2": 5, "3": 10 }, img: 'https://game.gtimg.cn/images/yxzj/img201606/summoner/80110.jpg' },
//   }
// };

// 冷却时间缩减数据
const cooldownReduction = {
  "冷却鞋": 0.15, "暗影战斧": 0.1, "冰心": 0.2, "金身": 0.1
};

const heroSelection = document.getElementById('hero-selection');
const timersContainer = document.getElementById('timers');

let selectedHeroes = [];

// 初始化分路按钮
for (const lane in heroes) {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-secondary', 'mx-2');
  button.textContent = lane;
  button.onclick = () => filterHeroes(lane);
  document.getElementById('lane-buttons').appendChild(button);
}

function filterHeroes(lane) {
  const heroLanes = document.getElementById('hero-lanes');
  heroLanes.innerHTML = '';

  if (lane === '全部') {
    for (const l in heroes) {
      createLaneGroup(l, heroes[l]);
    }
  } else {
    createLaneGroup(lane, heroes[lane]);
  }
}

function createLaneGroup(lane, laneHeroes) {
  const laneGroup = document.createElement('div');
  laneGroup.classList.add('hero-lane-group', 'col-md-12');
  laneGroup.innerHTML = `<h3>${lane}</h3>`;

  for (const heroName in laneHeroes) {
    const button = document.createElement('button');
    button.style.backgroundImage = `url(${laneHeroes[heroName].img})`;
    button.classList.add('btn','hero-button');
    button.dataset.heroName = heroName;
    button.addEventListener('click', () => handleHeroClick(laneHeroes[heroName], button));
    button.onmouseover = () => showHeroName(button);
    button.onmouseout = () => hideHeroName(button);
    laneGroup.appendChild(button);
  }
  document.getElementById('hero-lanes').appendChild(laneGroup);
}

function showHeroName(button) {
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip', 'text-center');
  tooltip.textContent = button.dataset.heroName;
  button.appendChild(tooltip);
}

function hideHeroName(button) {
  const tooltip = button.querySelector('.tooltip');
  if (tooltip) button.removeChild(tooltip);
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
      <button data-item="冷却鞋"><span class="tooltip-text">冷却鞋 (-15%)</span></button>
      <button data-item="暗影战斧"><span class="tooltip-text">暗影战斧 (-10%)</span></button>
      <button data-item="冰心"><span class="tooltip-text">冰心 (-20%)</span></button>
      <button data-item="金身"><span class="tooltip-text">金身 (-10%)</span></button>
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
  const totalDashArray = 2 * Math.PI * 45;
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
  hero.currentCd = (hero.originalCd - hero.levelCd[hero.level]) * (1 - hero.totalCooldownReduction);
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
  hero.totalCooldownReduction = Math.min(hero.equippedItems.reduce((acc, equippedItem) => acc + cooldownReduction[equippedItem], 0), 0.4);
  hero.currentCd = (hero.originalCd - hero.levelCd[hero.level]) * (1 - hero.totalCooldownReduction);
  updateCountdownCircle(hero);
}

function updateLevel(hero, levelSpan, change) {
  const maxLevel = Object.keys(hero.levelCd).length;
  hero.level = Math.min(Math.max(hero.level + change, 1), maxLevel);
  levelSpan.textContent = hero.level;
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

// 初始化时显示全部英雄
filterHeroes('全部');
