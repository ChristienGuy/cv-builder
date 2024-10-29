// Adapted from https://observablehq.com/@dgreensp/implementing-fractional-indexing
// by @dgreensp (twitter @DavidLG)

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const INTEGER_ZERO = "a0";
const SMALLEST_INTEGER = "A00000000000000000000000000";

/**
 * Get the length of an integer.
 * @param head - The integer to use.
 */
export function getIntegerLength(head: string): number {
  if (head >= "a" && head <= "z") {
    return head.charCodeAt(0) - "a".charCodeAt(0) + 2;
  } else if (head >= "A" && head <= "Z") {
    return "Z".charCodeAt(0) - head.charCodeAt(0) + 2;
  } else {
    throw new Error("Invalid order key head: " + head);
  }
}

/**
 * Validate an integer.
 * @param int - The integer to use.
 */
export function validateInteger(int: string): asserts int is string {
  if (int.length !== getIntegerLength(int.charAt(0))) {
    throw new Error("invalid integer part of order key: " + int);
  }
}

export function isNotUndefined(n: string | undefined): asserts n is string {
  if (n === undefined) throw Error("n is undefined");
}

/**
 * Increment an integer.
 * @param x - The integer to increment
 */
export function incrementInteger(x: string): string | undefined {
  validateInteger(x);
  const [head, ...digs] = x.split("");
  let carry = true;
  for (let i = digs.length - 1; carry && i >= 0; i--) {
    const d = DIGITS.indexOf(digs[i]) + 1;
    if (d === DIGITS.length) {
      digs[i] = "0";
    } else {
      digs[i] = DIGITS.charAt(d);
      carry = false;
    }
  }
  if (carry) {
    if (head === "Z") return "a0";
    if (head === "z") return undefined;
    const h = String.fromCharCode(head.charCodeAt(0) + 1);
    if (h > "a") {
      digs.push("0");
    } else {
      digs.pop();
    }
    return h + digs.join("");
  } else {
    return head + digs.join("");
  }
}

/**
 * Decrement an integer.
 * @param x - The integer to decrement
 */
export function decrementInteger(x: string): string | undefined {
  validateInteger(x);
  const [head, ...digs] = x.split("");
  let borrow = true;
  for (let i = digs.length - 1; borrow && i >= 0; i--) {
    const d = DIGITS.indexOf(digs[i]) - 1;
    if (d === -1) {
      digs[i] = DIGITS.slice(-1);
    } else {
      digs[i] = DIGITS.charAt(d);
      borrow = false;
    }
  }
  if (borrow) {
    if (head === "a") return "Z" + DIGITS.slice(-1);
    if (head === "A") return undefined;
    const h = String.fromCharCode(head.charCodeAt(0) - 1);
    if (h < "Z") {
      digs.push(DIGITS.slice(-1));
    } else {
      digs.pop();
    }
    return h + digs.join("");
  } else {
    return head + digs.join("");
  }
}

/**
 * Get the midpoint between two orders.
 * @param a - The start order.
 * @param b - The end order.
 */
export function midpoint(a: string, b: string | undefined): string {
  if (b !== undefined && a >= b) {
    throw new Error(a + " >= " + b);
  }
  if (a.slice(-1) === "0" || (b && b.slice(-1) === "0")) {
    throw new Error("trailing zero");
  }
  if (b) {
    let n = 0;
    while ((a.charAt(n) || "0") === b.charAt(n)) {
      n++;
    }
    if (n > 0) {
      return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
    }
  }
  const digitA = a ? DIGITS.indexOf(a.charAt(0)) : 0;
  const digitB = b !== undefined ? DIGITS.indexOf(b.charAt(0)) : DIGITS.length;
  if (digitB - digitA > 1) {
    const midDigit = Math.round(0.5 * (digitA + digitB));
    return DIGITS.charAt(midDigit);
  } else {
    if (b && b.length > 1) {
      return b.slice(0, 1);
    } else {
      return DIGITS.charAt(digitA) + midpoint(a.slice(1), undefined);
    }
  }
}

/**
 * Get the integer part of an order.
 * @param order - The order to use.
 */
export function getIntegerPart(order: string): string {
  const integerPartLength = getIntegerLength(order.charAt(0));
  if (integerPartLength > order.length) {
    throw new Error("invalid order: " + order);
  }
  return order.slice(0, integerPartLength);
}

/**
 * Validate an order.
 * @param x - The order to validate.
 */
export function validateOrder(order: string): asserts order is string {
  if (order === SMALLEST_INTEGER) {
    throw new Error("invalid order: " + order);
  }
  // getIntegerPart will throw if the first character is bad,
  // or the key is too short.  we'd call it to check these things
  // even if we didn't need the result
  const i = getIntegerPart(order);
  const f = order.slice(i.length);
  if (f.slice(-1) === "0") {
    throw new Error("invalid order: " + order);
  }
}

/**
 * A string made up of an integer part followed by a fraction part.
 * The fraction point consists of zero or more digits with no trailing zeros.
 */
export type OrderKey = string;

/**
 * Generate an order key at the midpoint between a start and end.
 * @param a - The start order key string.
 * @param b - The end order key string, greater than A.
 */
export function generateKeyBetween(
  a: OrderKey | undefined,
  b: OrderKey | undefined
): OrderKey {
  if (a !== undefined) validateOrder(a);
  if (b !== undefined) validateOrder(b);
  if (a !== undefined && b !== undefined && a >= b) {
    throw new Error(a + " >= " + b);
  }
  if (a === undefined && b === undefined) {
    return INTEGER_ZERO;
  }
  if (a === undefined) {
    if (b === undefined) throw Error("b is undefined");
    const ib = getIntegerPart(b);
    const fb = b.slice(ib.length);
    if (ib === SMALLEST_INTEGER) {
      return ib + midpoint("", fb);
    }
    if (ib < b) {
      return ib;
    }
    const ibl = decrementInteger(ib);
    isNotUndefined(ibl);
    return ibl;
  }
  if (b === undefined) {
    const ia = getIntegerPart(a);
    const fa = a.slice(ia.length);
    const i = incrementInteger(ia);
    return i === undefined ? ia + midpoint(fa, undefined) : i;
  }
  const ia = getIntegerPart(a);
  const fa = a.slice(ia.length);
  const ib = getIntegerPart(b);
  const fb = b.slice(ib.length);
  if (ia === ib) {
    return ia + midpoint(fa, fb);
  }
  const i = incrementInteger(ia);
  isNotUndefined(i);
  return i < b ? i : ia + midpoint(fa, undefined);
}

/**
 * Generate N number of order keys between the start and end order.
 * @param a - The start order key string.
 * @param b - The end order key, greater than A string.
 * @param n - The number of order keys to generate.
 */
export function generateNKeysBetween(
  a: string | undefined,
  b: string | undefined,
  n: number
): string[] {
  if (n === 0) return [];
  if (n === 1) return [generateKeyBetween(a, b)];
  if (b === undefined) {
    let c = generateKeyBetween(a, b);
    const result = [c];
    for (let i = 0; i < n - 1; i++) {
      c = generateKeyBetween(c, b);
      result.push(c);
    }
    return result;
  }
  if (a === undefined) {
    let c = generateKeyBetween(a, b);
    const result = [c];
    for (let i = 0; i < n - 1; i++) {
      c = generateKeyBetween(a, c);
      result.push(c);
    }
    result.reverse();
    return result;
  }
  const mid = Math.floor(n / 2);
  const c = generateKeyBetween(a, b);
  return [
    ...generateNKeysBetween(a, c, mid),
    c,
    ...generateNKeysBetween(c, b, n - mid - 1),
  ];
}
