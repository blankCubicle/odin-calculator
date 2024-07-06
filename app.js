const add = function (a, b) {
  return a + b;
};

const subtract = function (a, b) {
  return a - b;
};

const multiply = function (a, b) {
  return a * b;
};

const divide = function (a, b) {
  if (b === 0) return 'ERROR';
  return a / b;
};

const operate = function (a, b, operator) {
  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      return divide(a, b);
    default:
      return 'ERROR';
  }
};

const clear = function () {
  const value = displayValue.textContent;
  if (value === '0' || value === 'ERROR') a = b = operator = null;

  memory = null;
  waiting = false;
  displayValue.textContent = '0';
  sign.classList.remove('negative');
};

const handleValueInput = function (e) {
  let value = displayValue.textContent;
  if (value === 'ERROR') return;

  const key = e.target.value;

  if (waiting) {
    value = '0';
    sign.classList.remove('negative');
    waiting = false;
  }

  if (value.length >= 10) return;
  if (key === '.' && (value.includes('.') || value.length >= 9)) return;

  if (value === '0') {
    value = key === '.' ? value + key : key;
  } else {
    value += key;
  }

  displayValue.textContent = value;
};

const negateValue = function () {
  memory = null;
  waiting = false;
  sign.classList.toggle('negative');
};

const getDisplayedNumber = function () {
  let value = displayValue.textContent;
  if (value === 'ERROR') return value;

  if (sign.classList.contains('negative')) value = '-' + value;
  return parseFloat(value);
};

const updateDisplay = function (value) {
  displayValue.textContent = value === 'ERROR' ? value : Math.abs(value);

  if (value < 0) {
    sign.classList.add('negative');
  } else {
    sign.classList.remove('negative');
  }
};

let memory = null;
let waiting = false;
let a = null;
let operator = null;

const handleOperatorInput = function (e) {
  const currentValue = getDisplayedNumber();
  if (currentValue === 'ERROR') return;

  const key = e.target.value;

  if (key !== '=') {
    memory = null;

    if (a === null || operator === null) {
      a = currentValue;
      operator = key;
      waiting = true;
      return;
    }

    // Last operation is only repeated with '=', else,
    // just replace operator until a second value is input
    if (waiting) return (operator = key);

    a = operate(a, currentValue, operator);
    operator = key;
    waiting = true;
    updateDisplay(a);
    return;
  }

  if (operator === null && memory === null) return;

  let b = currentValue;

  if (memory === null) memory = { value: b, operator };

  if (operator === null) {
    a = b;
    b = memory.value;
    operator = memory.operator;
  }

  a = operate(a, b, operator);
  operator = null;
  waiting = true;
  updateDisplay(a);
};

const displayValue = document.querySelector('.value');
const sign = document.querySelector('.sign');
const numKeys = document.querySelectorAll('.num');
const negateKey = document.querySelector('.negate');
const clearKey = document.querySelector('.clear');
const operatorKeys = document.querySelectorAll('.operator');

numKeys.forEach((key) => key.addEventListener('click', handleValueInput));
negateKey.addEventListener('click', negateValue);
clearKey.addEventListener('click', clear);
operatorKeys.forEach((key) =>
  key.addEventListener('click', handleOperatorInput),
);
