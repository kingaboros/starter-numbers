'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
//////// Converting and checking numbers //////////

console.log(23 === 23.0);

console.log(0.1 + 0.2); //JS can't represent certain fractions
console.log(0.1 + 0.2 === 0.3); //this should be true, but because of the error in JS is false

// Converting from string to numbers
console.log(Number('23'));
console.log(+'23'); // simpler way to convert a string to a number. JS does type coercion when seeing the + op.

// Parsing for intergers

console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('p2', 10)); // NaN - it must

// Parse float
console.log(Number.parseFloat('2.5rem')); // displays the decimal as well

console.log(Number.parseInt('2.5rem')); // stops at 2

// Check is a value NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
console.log(Number.isNaN(23 / 0));

// Check is a value is a number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20x'));
console.log(Number.isFinite(23 / 0));

// Check is a value is integer
console.log(Number.isInteger(20));
console.log(Number.isInteger(20.0));
console.log(Number.isInteger(23 / 0));



/////////////// Math and rounding ///////////////////

// Square route
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // calculate the square route
console.log(8 ** (1 / 3)); // this is how to calculate a cubic route

// return the max value

console.log(Math.max(23, 435, 6, 77, 2));
console.log(Math.max(23, '435', 6, 77, 2)); // type coercion
console.log(Math.max(23, '435px', 6, 77, 2)); // parsing doesn't work

// return the min value

console.log(Math.min(23, 435, 6, 77, 2));

//constant - calculate the radious of a circle

console.log(Math.PI * Number.parseFloat('10px') ** 2);

// generating a random number

console.log(Math.trunc(Math.random() * 6) + 1);

// random number function
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0 ...1 -> 0 ... (max-min) -> min...max

// console.log(randomInt(10, 20));

// Rounding integers

console.log(Math.trunc(23.5)); // removes decimals

console.log(Math.round(23.3)); // rounds to the nearest integer
console.log(Math.round(23.9));

console.log(Math.ceil(23.3)); // rounds up
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3)); // rounds down
console.log(Math.floor(23.9));

console.log(Math.trunc(-23.3)); // just removes the decimal
console.log(Math.floor(-23.9)); // with negative numbers it;s the other way arround

// Rounding floating point numbers (decimals)

console.log((2.7).toFixed(0)); // tofixed always returns a string
console.log((2.7).toFixed(3)); // adds zeros until it has 3 decimal parts
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2)); // converts a string to a number


////////////// Remainder operator % ////////////////

console.log(5 % 2);
console.log(5 / 2); // 5 = 2*2+1

console.log(8 % 3);
console.log(8 / 3); // 8 = 2*3 + 2

console.log(6 % 2);
console.log(6 / 2); // 6 = 2*3 + 0

console.log(7 % 2);
console.log(7 / 2); // 7 = 2*3 + 1

// Check if a number is divizible to any number
const isEven = n => n % 2 === 0;

console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));


/////////// Working with bigInt ////////

console.log(2 ** 53 - 1); // the biggest number JS can hold

console.log(Number.MAX_SAFE_INTEGER);

console.log(2 ** 53 + 1); // unsafe numbers -> if we add other numbers, JS will not represent these numbers accurately - we might loose precision

console.log(598649864532651794587149659865396539865); // can't display it to the console
console.log(598649864532651794587149659865396539865n);

console.log(BigInt(75630263276116));

// Operations

console.log(100000n + 100000n);
console.log(76423656326255n * 75639876628762972n);

// console.log(Math.sqrt(16n)); // it's not going to work

const huge = 26453287653927591875198651n;
const num = 23;
console.log(huge * BigInt(num)); //

// Exceptions

console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == 20);

console.log(huge + 'is REALLY big!!!');

// Divisions
console.log(11n / 3n);
console.log(10 / 3);



/////// Creating dates //////////

// How to create a date

const now = new Date();
console.log(now);

console.log(new Date('May 27 2021 16:45:58 GMT+0300'));
console.log(new Date('December 24, 2015'));

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5));


// Working with dates

const future = new Date(2037, 10, 19, 15, 23);
console.log(future);

// Get
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); // it's a date string
console.log(future.getTime()); // time stamp for the date - the miliseconds that have passed since Jan 01 1970

console.log(new Date(2142249780000));

console.log(Date.now());

// Set

future.setFullYear(2040);
console.log(future);


////// Operations with Dates //////

const future = new Date(2037, 10, 19, 15, 23);
console.log(Number(future));
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
const days3 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));

console.log(days1);
console.log(days3);
*/

//////////////// Timers ////////////////////

// setTimeout function

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) =>
    console.log(`'Here is your pizza 🍕 with ${ing1} and ${ing2}'`),
  3000,
  ...ingredients
); // this will start counting and move on to the next line

console.log('Waiting....'); // This will show up first. Callsed Async JS

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval - displays the date every second

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);
