const operate = function (a, b, operator) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? 'ERROR' : a / b;
    case '√':
      return b < 0 ? 'ERROR' : Math.sqrt(b);
    case '%':
      return ((a ?? 1) * b) / 100;
    default:
      return 'ERROR';
  }
};

const displayValue = document.querySelector('.value');
const signIndicator = document.querySelector('.sign');
const memIndicator = document.querySelector('.memory');

const getFloatFromDisplay = function () {
  let value = displayValue.textContent;
  if (value === 'ERROR') return value;

  if (signIndicator.classList.contains('negative')) value = '-' + value;
  return parseFloat(value);
};

let shortMem = null;
let longMem = 0;
let recalled = false;
let replaced = false;
let waitingForNextValue = false;
let lastValue = null;
let lastOperator = null;

const clear = function () {
  const value = displayValue.textContent;
  if (value === '0' || value === 'ERROR') lastValue = lastOperator = null;

  shortMem = null;
  recalled = replaced = waitingForNextValue = false;
  displayValue.textContent = '0';
  signIndicator.classList.remove('negative');
};

const handleMemKeys = function (e) {
  const key = e.target.value;
  const currentValue = getFloatFromDisplay();
  if (currentValue === 'ERROR') return;

  if (key === 'rcm') {
    if (recalled) {
      memIndicator.classList.remove('set');
      longMem = 0;
      return;
    }

    updateDisplayValue(longMem);
    recalled = true;
    waitingForNextValue = false;
    return;
  }

  longMem = operate(longMem, currentValue, key === 'm-' ? '-' : '+');

  const abs = Math.abs(longMem);
  if (abs > 9999999999) longMem = 9999999999;
  if (abs < 1e-9) longMem = 0;

  memIndicator.classList.add('set');
  recalled = false;
  replaced = true;
};

const handleValueInput = function (e) {
  let value = displayValue.textContent;
  if (value === 'ERROR') return;

  const key = e.target.value;

  if (recalled || replaced || waitingForNextValue) {
    value = '0';
    signIndicator.classList.remove('negative');
    recalled = replaced = waitingForNextValue = false;
  }

  // font's dot char is zero-width, don't consider it for char/digit limit (10)
  if (value.includes('.') && (key === '.' || value.length >= 11)) return;
  if (!value.includes('.') && value.length >= 10) return;

  if (value === '0') {
    value = key === '.' ? value + key : key;
  } else {
    value += key;
  }

  displayValue.textContent = value;
};

const negateValue = function () {
  if (displayValue.textContent === 'ERROR') return;
  shortMem = null;
  if (recalled || waitingForNextValue) replaced = true;
  recalled = waitingForNextValue = false;
  signIndicator.classList.toggle('negative');
};

const template = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 9,
  signDisplay: 'never',
  useGrouping: false,
});

const updateDisplayValue = function (value) {
  let newValue;
  let sign;

  if (value !== 'ERROR') {
    newValue = Math.abs(value);
    newValue = template.format(Math.min(newValue, 9999999999).toPrecision(10));
    sign = Math.sign(value) < 0 ? true : false;
  }

  displayValue.textContent = newValue ?? value;

  if (sign && newValue !== '0') {
    signIndicator.classList.add('negative');
  } else {
    signIndicator.classList.remove('negative');
  }
};

const handleOperatorKey = function (e) {
  const currentValue = getFloatFromDisplay();
  if (currentValue === 'ERROR') return;

  const currentOperator = e.target.value;
  shortMem = null;

  if (currentOperator === '√' || currentOperator === '%') {
    updateDisplayValue(operate(lastValue, currentValue, currentOperator));
    recalled = waitingForNextValue = false;
    replaced = true;
    return;
  }

  if (lastValue === null || lastOperator === null) {
    lastValue = currentValue;
    lastOperator = currentOperator;
    waitingForNextValue = true;
    return;
  }

  // To allow mistake correction, don't operate if the displayValue
  // hasn't changed, just replace operator
  if (waitingForNextValue) {
    lastOperator = currentOperator;
    return;
  }

  lastValue = operate(lastValue, currentValue, lastOperator);
  updateDisplayValue(lastValue);
  lastOperator = currentOperator;
  waitingForNextValue = true;
};

const handleEqualsKey = function () {
  let currentValue = getFloatFromDisplay();
  if (currentValue === 'ERROR') return;
  if (lastOperator === null && shortMem === null) return;

  if (shortMem === null) {
    shortMem = { value: currentValue, operator: lastOperator };
  }

  // Repeats last calculation e.g.: [10][-][1][=][=][=]... for a countdown
  if (lastOperator === null) {
    lastValue = currentValue;
    currentValue = shortMem.value;
    lastOperator = shortMem.operator;
  }

  lastValue = operate(lastValue, currentValue, lastOperator);
  updateDisplayValue(lastValue);
  lastValue = lastOperator = null;
  waitingForNextValue = true;
};

const numKeys = document.querySelectorAll('.num');
const negateKey = document.querySelector('.negate');
const clearKey = document.querySelector('.clear');
const memoryKeys = document.querySelectorAll('.mem');
const operatorKeys = document.querySelectorAll('.operator');

numKeys.forEach((key) => key.addEventListener('click', handleValueInput));
negateKey.addEventListener('click', negateValue);
clearKey.addEventListener('click', clear);
memoryKeys.forEach((key) => key.addEventListener('click', handleMemKeys));
operatorKeys.forEach((key) => {
  key.addEventListener(
    'click',
    key.value === '=' ? handleEqualsKey : handleOperatorKey,
  );
});

const typeableKeys = document.querySelectorAll('.keypad button[data-key]');
document.addEventListener('keydown', (e) => {
  let pressed = e.key;
  if (pressed === 'Enter') pressed = '=';

  const match = typeableKeys
    .values()
    .find((key) => key.dataset.key === pressed);

  if (match) match.dispatchEvent(new Event('click'));
});
