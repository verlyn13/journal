# TESTING

*Source: <https://bun.sh/docs/test/writing>*
*Fetched: 2025-08-30T00:47:26.769Z*

***

Define tests with a Jest-like API imported from the built-in `bun:test` module. Long term, Bun aims for complete Jest compatibility; at the moment, a [limited set](#matchers) of `expect` matchers are supported.

## [Basic usage](#basic-usage)

To define a simple test:

math.test.ts\`\`\`
import { expect, test } from "bun:test";

test("2 + 2", () => {
expect(2 + 2).toBe(4);
});

```

Jest-style globals

As in Jest, you can use `describe`, `test`, `expect`, and other functions without importing them. Unlike Jest, they are not injected into the global scope. Instead, the Bun transpiler will automatically inject an import from `bun:test` internally.

```

typeof globalThis.describe; // "undefined"
typeof describe; // "function"

````

This transpiler integration only occurs during `bun test`, and only for test files & preloaded scripts. In practice there&#x27;s no significant difference to the end user.

Tests can be grouped into suites with `describe`.

math.test.ts```
import { expect, test, describe } from "bun:test";

describe("arithmetic", () => {
  test("2 + 2", () => {
    expect(2 + 2).toBe(4);
  });

  test("2 * 2", () => {
    expect(2 * 2).toBe(4);
  });
});

````

Tests can be `async`.

```
import { expect, test } from "bun:test";

test("2 * 2", async () => {
  const result = await Promise.resolve(2 * 2);
  expect(result).toEqual(4);
});

```

Alternatively, use the `done` callback to signal completion. If you include the `done` callback as a parameter in your test definition, you *must* call it or the test will hang.

```
import { expect, test } from "bun:test";

test("2 * 2", done => {
  Promise.resolve(2 * 2).then(result => {
    expect(result).toEqual(4);
    done();
  });
});

```

## [Timeouts](#timeouts)

Optionally specify a per-test timeout in milliseconds by passing a number as the third argument to `test`.

```
import { test } from "bun:test";

test("wat", async () => {
  const data = await slowOperation();
  expect(data).toBe(42);
}, 500); // test must run in In `bun:test`, test timeouts throw an uncatchable exception to force the test to stop running and fail. We also kill any child processes that were spawned in the test to avoid leaving behind zombie processes lurking in the background.

The default timeout for each test is 5000ms (5 seconds) if not overridden by this timeout option or `jest.setDefaultTimeout()`.

### [🧟 Zombie process killer](#zombie-process-killer)

When a test times out and processes spawned in the test via `Bun.spawn`, `Bun.spawnSync`, or `node:child_process` are not killed, they will be automatically killed and a message will be logged to the console. This prevents zombie processes from lingering in the background after timed-out tests.

## [`test.skip`](#test-skip)

Skip individual tests with `test.skip`. These tests will not be run.

```

import { expect, test } from "bun:test";

test.skip("wat", () => {
// TODO: fix this
expect(0.1 + 0.2).toEqual(0.3);
});

```

## [`test.todo`](#test-todo)

Mark a test as a todo with `test.todo`. These tests will not be run.

```

import { expect, test } from "bun:test";

test.todo("fix this", () => {
myTestFunction();
});

```

To run todo tests and find any which are passing, use `bun test --todo`.

```

bun test --todo

```
```

my.test.ts:
✗ unimplemented feature
^ this test is marked as todo but passes. Remove `.todo` or check that test is correct.

0 pass
1 fail
1 expect() calls

```

With this flag, failing todo tests will not cause an error, but todo tests which pass will be marked as failing so you can remove the todo mark or fix the test.

## [`test.only`](#test-only)

To run a particular test or suite of tests use `test.only()` or `describe.only()`.

```

import { test, describe } from "bun:test";

test("test #1", () => {
// does not run
});

test.only("test #2", () => {
// runs
});

describe.only("only", () => {
test("test #3", () => {
// runs
});
});

```

The following command will only execute tests #2 and #3.

```

bun test --only

```

The following command will only execute tests #1, #2 and #3.

```

bun test

```

## [`test.if`](#test-if)

To run a test conditionally, use `test.if()`. The test will run if the condition is truthy. This is particularly useful for tests that should only run on specific architectures or operating systems.

```

test.if(Math.random() > 0.5)("runs half the time", () => {
// ...
});

const macOS = process.arch === "darwin";
test.if(macOS)("runs on macOS", () => {
// runs if macOS
});

```

## [`test.skipIf`](#test-skipif)

To instead skip a test based on some condition, use `test.skipIf()` or `describe.skipIf()`.

```

const macOS = process.arch === "darwin";

test.skipIf(macOS)("runs on non-macOS", () => {
// runs if *not* macOS
});

```

## [`test.todoIf`](#test-todoif)

If instead you want to mark the test as TODO, use `test.todoIf()` or `describe.todoIf()`. Carefully choosing `skipIf` or `todoIf` can show a difference between, for example, intent of "invalid for this target" and "planned but not implemented yet."

```

const macOS = process.arch === "darwin";

// TODO: we've only implemented this for Linux so far.
test.todoIf(macOS)("runs on posix", () => {
// runs if *not* macOS
});

```

## [`test.failing`](#test-failing)

Use `test.failing()` when you know a test is currently failing but you want to track it and be notified when it starts passing. This inverts the test result:

- A failing test marked with `.failing()` will pass
- A passing test marked with `.failing()` will fail (with a message indicating it&#x27;s now passing and should be fixed)

```

// This will pass because the test is failing as expected
test.failing("math is broken", () => {
expect(0.1 + 0.2).toBe(0.3); // fails due to floating point precision
});

// This will fail with a message that the test is now passing
test.failing("fixed bug", () => {
expect(1 + 1).toBe(2); // passes, but we expected it to fail
});

```

This is useful for tracking known bugs that you plan to fix later, or for implementing test-driven development.

## [Conditional Tests for Describe Blocks](#conditional-tests-for-describe-blocks)

The conditional modifiers `.if()`, `.skipIf()`, and `.todoIf()` can also be applied to `describe` blocks, affecting all tests within the suite:

```

const isMacOS = process.platform === "darwin";

// Only runs the entire suite on macOS
describe.if(isMacOS)("macOS-specific features", () => {
test("feature A", () => {
// only runs on macOS
});

test("feature B", () => {
// only runs on macOS
});
});

// Skips the entire suite on Windows
describe.skipIf(process.platform === "win32")("Unix features", () => {
test("feature C", () => {
// skipped on Windows
});
});

// Marks the entire suite as TODO on Linux
describe.todoIf(process.platform === "linux")("Upcoming Linux support", () => {
test("feature D", () => {
// marked as TODO on Linux
});
});

```

## [`test.each` and `describe.each`](#test-each-and-describe-each)

To run the same test with multiple sets of data, use `test.each`. This creates a parametrized test that runs once for each test case provided.

```

const cases = \[
\[1, 2, 3],
\[3, 4, 7],
];

test.each(cases)("%p + %p should be %p", (a, b, expected) => {
expect(a + b).toBe(expected);
});

```

You can also use `describe.each` to create a parametrized suite that runs once for each test case:

```

describe.each(\[
\[1, 2, 3],
\[3, 4, 7],
])("add(%i, %i)", (a, b, expected) => {
test(`returns ${expected}`, () => {
expect(a + b).toBe(expected);
});

test(`sum is greater than each value`, () => {
expect(a + b).toBeGreaterThan(a);
expect(a + b).toBeGreaterThan(b);
});
});

```

### [Argument Passing](#argument-passing)

How arguments are passed to your test function depends on the structure of your test cases:

- If a table row is an array (like `[1, 2, 3]`), each element is passed as an individual argument
- If a row is not an array (like an object), it&#x27;s passed as a single argument

```

// Array items passed as individual arguments
test.each(\[
\[1, 2, 3],
\[4, 5, 9],
])("add(%i, %i) = %i", (a, b, expected) => {
expect(a + b).toBe(expected);
});

// Object items passed as a single argument
test.each(\[
{ a: 1, b: 2, expected: 3 },
{ a: 4, b: 5, expected: 9 },
])("add($a, $b) = $expected", data => {
expect(data.a + data.b).toBe(data.expected);
});

```

### [Format Specifiers](#format-specifiers)

There are a number of options available for formatting the test title:

`%p`[`pretty-format`](https://www.npmjs.com/package/pretty-format)`%s`String`%d`Number`%i`Integer`%f`Floating point`%j`JSON`%o`Object`%#`Index of the test case`%%`Single percent sign (`%`)#### Examples

```

// Basic specifiers
test.each(\[
\["hello", 123],
\["world", 456],
])("string: %s, number: %i", (str, num) => {
// "string: hello, number: 123"
// "string: world, number: 456"
});

// %p for pretty-format output
test.each(\[
\[{ name: "Alice" }, { a: 1, b: 2 }],
\[{ name: "Bob" }, { x: 5, y: 10 }],
])("user %p with data %p", (user, data) => {
// "user { name: 'Alice' } with data { a: 1, b: 2 }"
// "user { name: 'Bob' } with data { x: 5, y: 10 }"
});

// %# for index
test.each(\["apple", "banana"])("fruit #%# is %s", fruit => {
// "fruit #0 is apple"
// "fruit #1 is banana"
});

```

## [Assertion Counting](#assertion-counting)

Bun supports verifying that a specific number of assertions were called during a test:

### [expect.hasAssertions()](#expect-hasassertions)

Use `expect.hasAssertions()` to verify that at least one assertion is called during a test:

```

test("async work calls assertions", async () => {
expect.hasAssertions(); // Will fail if no assertions are called

const data = await fetchData();
expect(data).toBeDefined();
});

```

This is especially useful for async tests to ensure your assertions actually run.

### [expect.assertions(count)](#expect-assertions-count)

Use `expect.assertions(count)` to verify that a specific number of assertions are called during a test:

```

test("exactly two assertions", () => {
expect.assertions(2); // Will fail if not exactly 2 assertions are called

expect(1 + 1).toBe(2);
expect("hello").toContain("ell");
});

```

This helps ensure all your assertions run, especially in complex async code with multiple code paths.

## [Type Testing](#type-testing)

Bun includes `expectTypeOf` for testing typescript types, compatible with Vitest.

### [expectTypeOf](#expecttypeof)

**Note** — These functions are no-ops at runtime - you need to run TypeScript separately to verify the type checks.

The `expectTypeOf` function provides type-level assertions that are checked by TypeScript&#x27;s type checker. **Important**:

To test your types:

1. $1
2. $1

```

import { expectTypeOf } from "bun:test";

// Basic type assertions
expectTypeOf().toEqualTypeOf();
expectTypeOf(123).toBeNumber();
expectTypeOf("hello").toBeString();

// Object type matching
expectTypeOf({ a: 1, b: "hello" }).toMatchObjectType();

// Function types
function greet(name: string): string {
return `Hello ${name}`;
}

expectTypeOf(greet).toBeFunction();
expectTypeOf(greet).parameters.toEqualTypeOf();
expectTypeOf(greet).returns.toEqualTypeOf();

// Array types
expectTypeOf(\[1, 2, 3]).items.toBeNumber();

// Promise types
expectTypeOf(Promise.resolve(42)).resolves.toBeNumber();

```

For full documentation on expectTypeOf matchers, see the [API Reference](/reference/bun/test/expectTypeOf)

## [Matchers](#matchers)

Bun implements the following matchers. Full Jest compatibility is on the roadmap; track progress [here](https://github.com/oven-sh/bun/issues/1825).

✅[`.not`](https://jestjs.io/docs/expect#not)✅[`.toBe()`](https://jestjs.io/docs/expect#tobevalue)✅[`.toEqual()`](https://jestjs.io/docs/expect#toequalvalue)✅[`.toBeNull()`](https://jestjs.io/docs/expect#tobenull)✅[`.toBeUndefined()`](https://jestjs.io/docs/expect#tobeundefined)✅[`.toBeNaN()`](https://jestjs.io/docs/expect#tobenan)✅[`.toBeDefined()`](https://jestjs.io/docs/expect#tobedefined)✅[`.toBeFalsy()`](https://jestjs.io/docs/expect#tobefalsy)✅[`.toBeTruthy()`](https://jestjs.io/docs/expect#tobetruthy)✅[`.toContain()`](https://jestjs.io/docs/expect#tocontainitem)✅[`.toContainAllKeys()`](https://jest-extended.jestcommunity.dev/docs/matchers/Object#tocontainallkeyskeys)✅[`.toContainValue()`](https://jest-extended.jestcommunity.dev/docs/matchers/Object#tocontainvaluevalue)✅[`.toContainValues()`](https://jest-extended.jestcommunity.dev/docs/matchers/Object#tocontainvaluesvalues)✅[`.toContainAllValues()`](https://jest-extended.jestcommunity.dev/docs/matchers/Object#tocontainallvaluesvalues)✅[`.toContainAnyValues()`](https://jest-extended.jestcommunity.dev/docs/matchers/Object#tocontainanyvaluesvalues)✅[`.toStrictEqual()`](https://jestjs.io/docs/expect#tostrictequalvalue)✅[`.toThrow()`](https://jestjs.io/docs/expect#tothrowerror)✅[`.toHaveLength()`](https://jestjs.io/docs/expect#tohavelengthnumber)✅[`.toHaveProperty()`](https://jestjs.io/docs/expect#tohavepropertykeypath-value)✅[`.extend`](https://jestjs.io/docs/expect#expectextendmatchers)✅[`.anything()`](https://jestjs.io/docs/expect#expectanything)✅[`.any()`](https://jestjs.io/docs/expect#expectanyconstructor)✅[`.arrayContaining()`](https://jestjs.io/docs/expect#expectarraycontainingarray)✅[`.assertions()`](https://jestjs.io/docs/expect#expectassertionsnumber)✅[`.closeTo()`](https://jestjs.io/docs/expect#expectclosetonumber-numdigits)✅[`.hasAssertions()`](https://jestjs.io/docs/expect#expecthasassertions)✅[`.objectContaining()`](https://jestjs.io/docs/expect#expectobjectcontainingobject)✅[`.stringContaining()`](https://jestjs.io/docs/expect#expectstringcontainingstring)✅[`.stringMatching()`](https://jestjs.io/docs/expect#expectstringmatchingstring--regexp)❌[`.addSnapshotSerializer()`](https://jestjs.io/docs/expect#expectaddsnapshotserializerserializer)✅[`.resolves()`](https://jestjs.io/docs/expect#resolves)✅[`.rejects()`](https://jestjs.io/docs/expect#rejects)✅[`.toHaveBeenCalled()`](https://jestjs.io/docs/expect#tohavebeencalled)✅[`.toHaveBeenCalledTimes()`](https://jestjs.io/docs/expect#tohavebeencalledtimesnumber)✅[`.toHaveBeenCalledWith()`](https://jestjs.io/docs/expect#tohavebeencalledwitharg1-arg2-)✅[`.toHaveBeenLastCalledWith()`](https://jestjs.io/docs/expect#tohavebeenlastcalledwitharg1-arg2-)✅[`.toHaveBeenNthCalledWith()`](https://jestjs.io/docs/expect#tohavebeennthcalledwithnthcall-arg1-arg2-)✅[`.toHaveReturned()`](https://jestjs.io/docs/expect#tohavereturned)✅[`.toHaveReturnedTimes()`](https://jestjs.io/docs/expect#tohavereturnedtimesnumber)✅[`.toHaveReturnedWith()`](https://jestjs.io/docs/expect#tohavereturnedwithvalue)✅[`.toHaveLastReturnedWith()`](https://jestjs.io/docs/expect#tohavelastreturnedwithvalue)✅[`.toHaveNthReturnedWith()`](https://jestjs.io/docs/expect#tohaventhreturnedwithnthcall-value)✅[`.toBeCloseTo()`](https://jestjs.io/docs/expect#tobeclosetonumber-numdigits)✅[`.toBeGreaterThan()`](https://jestjs.io/docs/expect#tobegreaterthannumber--bigint)✅[`.toBeGreaterThanOrEqual()`](https://jestjs.io/docs/expect#tobegreaterthanorequalnumber--bigint)✅[`.toBeLessThan()`](https://jestjs.io/docs/expect#tobelessthannumber--bigint)✅[`.toBeLessThanOrEqual()`](https://jestjs.io/docs/expect#tobelessthanorequalnumber--bigint)✅[`.toBeInstanceOf()`](https://jestjs.io/docs/expect#tobeinstanceofclass)✅[`.toContainEqual()`](https://jestjs.io/docs/expect#tocontainequalitem)✅[`.toMatch()`](https://jestjs.io/docs/expect#tomatchregexp--string)✅[`.toMatchObject()`](https://jestjs.io/docs/expect#tomatchobjectobject)✅[`.toMatchSnapshot()`](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint)✅[`.toMatchInlineSnapshot()`](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot)✅[`.toThrowErrorMatchingSnapshot()`](https://jestjs.io/docs/expect#tothrowerrormatchingsnapshothint)✅[`.toThrowErrorMatchingInlineSnapshot()`](https://jestjs.io/docs/expect#tothrowerrormatchinginlinesnapshotinlinesnapshot)
```
