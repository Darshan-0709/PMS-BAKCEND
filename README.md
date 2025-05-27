### What is a pure function
A pure function is a function whose output depends only on its input arguments and produces no side effects. This means that given the same inputs, a pure function will always return the same output, and it does not modify any external state or data.

Let's take an example to see the difference between pure and impure functions,

Example: Pure vs. Impure Functions
// Impure Function
let numberArray = [];
const impureAddNumber = (number) => numberArray.push(number);

// Pure Function
const pureAddNumber = (number) => (inputArray) =>
  inputArray.concat([number]);

// Usage
console.log(impureAddNumber(6)); // returns 1
console.log(numberArray);        // returns [6]

console.log(pureAddNumber(7)(numberArray)); // returns [6, 7]
console.log(numberArray);                   // remains [6]
impureAddNumber changes the external variable numberArray and returns the new length of the array, making it impure.
pureAddNumber creates a new array with the added number and does not modify the original array, making it pure.
Benefits
Easier testing: Since output depends only on input, pure functions are simple to test.
Predictability: No hidden side effects make behavior easier to reason about.
Immutability: Pure functions align with ES6 best practices, such as preferring const over let, supporting safer and more maintainable code.
No side effects: Reduces bugs related to shared state or mutation.