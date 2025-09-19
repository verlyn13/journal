# CHANGELOG

*Source: <https://biomejs.dev/internals/changelog/>*

***

# Version History

```
        Find a version              ##  [2.2.2](/internals/changelog/version/2-2-2/) Latest
```

### Patch Changes

[#7266](https://github.com/biomejs/biome/pull/7266) [`b270bb5`](https://github.com/biomejs/biome/commit/b270bb59978efafeef48e0b7d834c9b3958bae51) Thanks [@ematipico](https://github.com/ematipico)! - Fixed an issue where Biome got stuck when analyzing some files. This is usually caused by a bug in the inference engine. Now Biome has some guards in place in case the number of types grows too much, and if that happens, a diagnostic is emitted and the inference is halted.

[#7281](https://github.com/biomejs/biome/pull/7281) [`6436180`](https://github.com/biomejs/biome/commit/6436180f4a3b257e2de018bac45c99a76eff58be) Thanks [@ematipico](https://github.com/ematipico)! - Fixed an issue where the function `scanProject` wouldn’t work as expected.

[#7285](https://github.com/biomejs/biome/pull/7285) [`1511d0c`](https://github.com/biomejs/biome/commit/1511d0c1fdbab576701f12e9dbfca11141b60e3f) Thanks [@rriski](https://github.com/rriski)! - Partially fixed [#6782](https://github.com/biomejs/biome/issues/6782): JSX node kinds are now supported in GritQL AST nodes.

[#7249](https://github.com/biomejs/biome/pull/7249) [`dff85c0`](https://github.com/biomejs/biome/commit/dff85c05ec1ecfd252028476828d63d15b0ed60f) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#748](https://github.com/biomejs/biome-vscode/issues/748), where Biome Language Server didn’t show the unsafe fixes when requesting the quick fixes. Now all LSP editors will show also opt-in, unsafe fixes.

[#7266](https://github.com/biomejs/biome/pull/7266) [`b270bb5`](https://github.com/biomejs/biome/commit/b270bb59978efafeef48e0b7d834c9b3958bae51) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#7020](https://github.com/biomejs/biome/issues/7020): Resolved an issue with analysing types of static member expressions involving unions. If the object type was a union that referenced nested unions, it would trigger an infinite loop as it tried to keep expanding nested unions, and the set of types would grow indefinitely.

[#7209](https://github.com/biomejs/biome/pull/7209) [`679b70e`](https://github.com/biomejs/biome/commit/679b70e8a5141250f74a11ce7e615b15fc711914) Thanks [@patrickshipe](https://github.com/patrickshipe)! - Resolved an overcorrection in [`useImportExtensions`](https://biomejs.dev/linter/rules/use-import-extensions/) when importing explicit index files.

Imports that explicitly reference an index file are now preserved and no longer rewritten to nested index paths.

#### Example

```
1// Before2      import "./sub/index";3      import "./sub/index/index.js";4
5// After6      import "./sub/index";7      import "./sub/index.js";
```

[#7270](https://github.com/biomejs/biome/pull/7270) [`953f9c6`](https://github.com/biomejs/biome/commit/953f9c6f019412caf14f983d5abb4c331605eb57) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6172](https://github.com/biomejs/biome/issues/6172): Resolved an issue with inferring types for rest parameters. This issue caused rest-parameter types to be incorrect, and in some cases caused extreme performance regressions in files that contained many methods with rest-parameter definitions.

[#7234](https://github.com/biomejs/biome/pull/7234) [`b7aa111`](https://github.com/biomejs/biome/commit/b7aa111c1c88c33d9c1a35d391b23e79e11dfd43) Thanks [@JeetuSuthar](https://github.com/JeetuSuthar)! - Fixed [#7233](https://github.com/biomejs/biome/issues/7233): The useIndexOf rule now correctly suggests using indexOf() instead of findIndex().

The diagnostic message was incorrectly recommending Array#findIndex() over Array#indexOf(), when it should recommend the opposite for simple equality checks.

[#7283](https://github.com/biomejs/biome/pull/7283) [`0b07f45`](https://github.com/biomejs/biome/commit/0b07f4574581d9189c1386c2255caca7338c15e9) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#7236](https://github.com/biomejs/biome/issues/7236). Now Biome correctly migrates JSONC configuration files when they are passed using `--config-path`.

[#7239](https://github.com/biomejs/biome/pull/7239) [`1d643d8`](https://github.com/biomejs/biome/commit/1d643d850120663e16663574ca3457184cdd4c27) Thanks [@minht11](https://github.com/minht11)! - Fixed an issue where Svelte globals ($state and so on) were not properly recognized inside `.svelte.test.ts/js` and `.svelte.spec.ts/js` files.

[#7264](https://github.com/biomejs/biome/pull/7264) [`62fdbc8`](https://github.com/biomejs/biome/commit/62fdbc80154f5a92d54af861c31dd334f25c16fc) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a regression where when using `--log-kind-pretty` wasn’t working anymore as expected.

[#7244](https://github.com/biomejs/biome/pull/7244) [`660031b`](https://github.com/biomejs/biome/commit/660031b6707ddeae29388f1d0b4089b64c048e40) Thanks [@JeetuSuthar](https://github.com/JeetuSuthar)! - Fixed [#7225](https://github.com/biomejs/biome/issues/7225): The `noExtraBooleanCast` rule now preserves parentheses when removing `Boolean` calls inside negations.

```
1// Before2!Boolean(b0 &#x26;&#x26; b1);3// After4!(b0 &#x26;&#x26; b1); // instead of !b0 &#x26;&#x26; b1
```

[#7298](https://github.com/biomejs/biome/pull/7298) [`46a8e93`](https://github.com/biomejs/biome/commit/46a8e93a65310df566526e6b3fb778455aee2d0b) Thanks [@unvalley](https://github.com/unvalley)! - Fixed [#6695](https://github.com/biomejs/biome/issues/6695): [`useNamingConvention`](https://biomejs.dev/linter/rules/use-naming-convention/) now correctly reports TypeScript parameter properties with modifiers.

Previously, constructor parameter properties with modifiers like `private` or `readonly` were not checked against naming conventions. These properties are now treated consistently with regular class properties.

## [2.2.0](/internals/changelog/version/2-2-0/)

### Minor Changes

[#5506](https://github.com/biomejs/biome/pull/5506) [`1f8755b`](https://github.com/biomejs/biome/commit/1f8755bfcbcd913be9fc1961b45b5c7ade8695c3) Thanks [@sakai-ast](https://github.com/sakai-ast)! - The `noRestrictedImports` rule has been enhanced with a new `patterns` option. This option allows for more flexible and powerful import restrictions using gitignore-style patterns.

You can now define patterns to restrict entire groups of modules. For example, you can disallow imports from any path under `import-foo/` except for `import-foo/baz`.

```
1{2  "options": {3    "patterns": [4      {5        "group": ["import-foo/*", "!import-foo/baz"],6        "message": "import-foo is deprecated, except for modules in import-foo/baz."7      }8    ]9  }10}
```

**Invalid examples**

```
1import foo from "import-foo/foo";2import bar from "import-foo/bar";
```

**Valid examples**

```
1import baz from "import-foo/baz";
```

Additionally, the `patterns` option introduces `importNamePattern` to restrict specific import names using regular expressions.
The following example restricts the import names that match `x` , `y` or `z` letters from modules under `import-foo/`.

```
1{2  "options": {3    "patterns": [4      {5        "group": ["import-foo/*"],6        "importNamePattern": "[xyz]"7      }8    ]9  }10}
```

**Invalid examples**

```
1import { x } from "import-foo/foo";
```

**Valid examples**

```
1import { foo } from "import-foo/foo";
```

Furthermore, you can use the `invertImportNamePattern` boolean option to reverse this logic. When set to true, only the import names that match the `importNamePattern` will be allowed. The following configuration only allows the import names that match `x` , `y` or `z` letters from modules under `import-foo/`.

```
1{2  "options": {3    "patterns": [4      {5        "group": ["import-foo/*"],6        "importNamePattern": "[xyz]",7        "invertImportNamePattern": true8      }9    ]10  }11}
```

**Invalid examples**

```
1import { foo } from "import-foo/foo";
```

**Valid examples**

```
1import { x } from "import-foo/foo";
```

[#6506](https://github.com/biomejs/biome/pull/6506) [`90c5d6b`](https://github.com/biomejs/biome/commit/90c5d6b857f9fb985f919d601872b3650f1e1e5e) Thanks [@nazarhussain](https://github.com/nazarhussain)! - Allow customization of the sort order for different sorting actions. These actions now support a sort option:

- [`assist/source/useSortedKeys`](https://biomejs.dev/assist/actions/use-sorted-keys/) now has a `sortOrder` option

- [`assist/source/useSortedAttributes`](https://biomejs.dev/assist/actions/use-sorted-attributes/) now has a `sortOrder` option

- [`assist/source/organizeImports`](https://biomejs.dev/assist/actions/organize-imports/) now has an `identifierOrder` option

For each of these options, the supported values are the same:

1. $1

2. $1

[#7159](https://github.com/biomejs/biome/pull/7159) [`df3afdf`](https://github.com/biomejs/biome/commit/df3afdf0e29ebb1db6ec4cf6f54ec822c82e38ab) Thanks [@ematipico](https://github.com/ematipico)! - Added the new rule `useBiomeIgnoreFolder`. Since v2.2, Biome correctly prevents the indexing and crawling of folders.

However, the correct pattern has changed. This rule attempts to detect incorrect usage, and promote the new pattern:

biome.json\`\`\`
1{2  "files": {3    "includes": \[4      "!dist/**",5      "!**/fixtures/**",6      "!dist",7      "!**/fixtures",8    ]9  }10}

```

[#6989](https://github.com/biomejs/biome/pull/6989) [`85b1128`](https://github.com/biomejs/biome/commit/85b11289efbda3061438dfb52ceb186d2142a646) Thanks [@arendjr](https://github.com/arendjr)! - Fixed minor inconsistencies in how `files.includes` was being handled.

Previously, Biome sometimes failed to properly ignore the contents of a folder if you didn’t specify the `/**` at the end of a glob pattern. This was unfortunate, because it meant we still had to traverse the folder and then apply the glob to every entry inside it.

This is no longer an issue and we now recommend to ignore folders without using the `/**` suffix.

[#7118](https://github.com/biomejs/biome/pull/7118) [`a78e878`](https://github.com/biomejs/biome/commit/a78e8781411d151cddec9425763df18ccd2e669b) Thanks [@avshalomt2](https://github.com/avshalomt2)! - Added support for `.graphqls` files. Biome can now format and lint GraphQL files that have the extension `.graphqls`

[#6159](https://github.com/biomejs/biome/pull/6159) [`f02a296`](https://github.com/biomejs/biome/commit/f02a296eae7e3a8dfeddbf1a034e2bb67e8c9c2d) Thanks [@bavalpey](https://github.com/bavalpey)! - Added a new option to Biome’s JavaScript formatter, `javascript.formatter.operatorLinebreak`, to configure whether long lines should be broken before or after binary operators.

For example, the following configuration:

```

1{2  formatter: {3    javascript: {4      operatorLinebreak: "before", // defaults to "after"5    },6  },7}

```

Will cause this JavaScript file:

```

1const VERY\_LONG\_CONDITION\_1234123412341234123412341234 = false;2
3if (4  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&5  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&6  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&7  VERY\_LONG\_CONDITION\_12341234123412341234123412348) {9  console.log("DONE");10}

```

to be formatted like this:

```

1const VERY\_LONG\_CONDITION\_1234123412341234123412341234 = false;2
3if (4  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&5  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&6  VERY\_LONG\_CONDITION\_1234123412341234123412341234 &&7  VERY\_LONG\_CONDITION\_12341234123412341234123412348) {9  console.log("DONE");10}

````

[#7137](https://github.com/biomejs/biome/pull/7137) [`a653a0f`](https://github.com/biomejs/biome/commit/a653a0fb3fa8c6777c9d03829cd88adcfc6b6877) Thanks [@ematipico](https://github.com/ematipico)! - Promoted multiple lint rules from nursery to stable groups and renamed several rules for consistency.

#### Promoted rules

The following rules have been promoted from nursery to stable groups:

##### CSS

- Promoted [`noImportantStyles`](https://biomejs.dev/linter/rules/no-important-styles) to the `complexity` group.

- Promoted [`noUnknownAtRules`](https://biomejs.dev/linter/rules/no-unknown-at-rules) to the `suspicious` group.

##### GraphQL

- Promoted [`useGraphqlNamedOperations`](https://biomejs.dev/linter/rules/use-graphql-named-operations) to the `correctness` group.

- Promoted [`useGraphqlNamingConvention`](https://biomejs.dev/linter/rules/use-graphql-naming-convention) to the `style` group.

##### JavaScript/TypeScript

- Promoted [`noExcessiveLinesPerFunction`](https://biomejs.dev/linter/rules/no-excessive-lines-per-function) to the `complexity` group.

- Promoted [`noImplicitCoercions`](https://biomejs.dev/linter/rules/no-implicit-coercions) to the `complexity` group.

- Promoted [`useIndexOf`](https://biomejs.dev/linter/rules/use-index-of) to the `complexity` group.

- Promoted [`noGlobalDirnameFilename`](https://biomejs.dev/linter/rules/no-global-dirname-filename) to the `correctness` group.

- Promoted [`noNestedComponentDefinitions`](https://biomejs.dev/linter/rules/no-nested-component-definitions) to the `correctness` group.

- Promoted [`noProcessGlobal`](https://biomejs.dev/linter/rules/no-process-global) to the `correctness` group.

- Promoted [`noReactPropAssignments`](https://biomejs.dev/linter/rules/no-react-prop-assignments) to the `correctness` group.

- Promoted [`noRestrictedElements`](https://biomejs.dev/linter/rules/no-restricted-elements) to the `correctness` group.

- Promoted [`noSolidDestructuredProps`](https://biomejs.dev/linter/rules/no-solid-destructured-props) to the `correctness` group.

- Promoted [`useJsonImportAttributes`](https://biomejs.dev/linter/rules/use-json-import-attributes) to the `correctness` group.

- Promoted [`useParseIntRadix`](https://biomejs.dev/linter/rules/use-parse-int-radix) to the `correctness` group.

- Promoted [`useSingleJsDocAsterisk`](https://biomejs.dev/linter/rules/use-single-js-doc-asterisk) to the `correctness` group.

- Promoted [`useUniqueElementIds`](https://biomejs.dev/linter/rules/use-unique-element-ids) to the `correctness` group.

- Promoted [`noAwaitInLoops`](https://biomejs.dev/linter/rules/no-await-in-loops) to the `performance` group.

- Promoted [`noUnwantedPolyfillio`](https://biomejs.dev/linter/rules/no-unwanted-polyfillio) to the `performance` group.

- Promoted [`useGoogleFontPreconnect`](https://biomejs.dev/linter/rules/use-google-font-preconnect) to the `performance` group.

- Promoted [`useSolidForComponent`](https://biomejs.dev/linter/rules/use-solid-for-component) to the `performance` group.

- Promoted [`noMagicNumbers`](https://biomejs.dev/linter/rules/no-magic-numbers) to the `style` group.

- Promoted [`useConsistentObjectDefinitions`](https://biomejs.dev/linter/rules/use-consistent-object-definitions) to the `style` group.

- Promoted [`useExportsLast`](https://biomejs.dev/linter/rules/use-exports-last) to the `style` group.

- Promoted [`useGroupedAccessorPairs`](https://biomejs.dev/linter/rules/use-grouped-accessor-pairs) to the `style` group.

- Promoted [`useNumericSeparators`](https://biomejs.dev/linter/rules/use-numeric-separators) to the `style` group.

- Promoted [`useObjectSpread`](https://biomejs.dev/linter/rules/use-object-spread) to the `style` group.

- Promoted [`useReadonlyClassProperties`](https://biomejs.dev/linter/rules/use-readonly-class-properties) to the `style` group.

- Promoted [`useSymbolDescription`](https://biomejs.dev/linter/rules/use-symbol-description) to the `style` group.

- Promoted [`useUnifiedTypeSignatures`](https://biomejs.dev/linter/rules/use-unified-type-signatures) to the `style` group.

- Promoted [`noBitwiseOperators`](https://biomejs.dev/linter/rules/no-bitwise-operators) to the `suspicious` group.

- Promoted [`noConstantBinaryExpressions`](https://biomejs.dev/linter/rules/no-constant-binary-expressions) to the `suspicious` group.

- Promoted [`noTsIgnore`](https://biomejs.dev/linter/rules/no-ts-ignore) to the `suspicious` group.

- Promoted [`noUnassignedVariables`](https://biomejs.dev/linter/rules/no-unassigned-variables) to the `suspicious` group.

- Promoted [`noUselessRegexBackrefs`](https://biomejs.dev/linter/rules/no-useless-regex-backrefs) to the `suspicious` group.

- Promoted [`noUselessEscapeInString`](https://biomejs.dev/linter/rules/no-useless-escape-in-string/) to the `suspicious` group.

- Promoted [`useIterableCallbackReturn`](https://biomejs.dev/linter/rules/use-iterable-callback-return/) to the `suspicious` group.

- Promoted [`useStaticResponseMethods`](https://biomejs.dev/linter/rules/use-static-response-methods) to the `suspicious` group.

#### Renamed rules

The following rules have been renamed during promotion. The migration tool will automatically update your configuration:

- Renamed `noAwaitInLoop` to [`noAwaitInLoops`](https://biomejs.dev/linter/rules/no-await-in-loops).

- Renamed `noConstantBinaryExpression` to [`noConstantBinaryExpressions`](https://biomejs.dev/linter/rules/no-constant-binary-expressions).

- Renamed `noDestructuredProps` to [`noSolidDestructuredProps`](https://biomejs.dev/linter/rules/no-solid-destructured-props).

- Renamed `noImplicitCoercion` to [`noImplicitCoercions`](https://biomejs.dev/linter/rules/no-implicit-coercions).

- Renamed `noReactPropAssign` to [`noReactPropAssignments`](https://biomejs.dev/linter/rules/no-react-prop-assignments).

- Renamed `noUnknownAtRule` to [`noUnknownAtRules`](https://biomejs.dev/linter/rules/no-unknown-at-rules).

- Renamed `noUselessBackrefInRegex` to [`noUselessRegexBackrefs`](https://biomejs.dev/linter/rules/no-useless-regex-backrefs).

- Renamed `useAdjacentGetterSetter` to [`useGroupedAccessorPairs`](https://biomejs.dev/linter/rules/use-grouped-accessor-pairs).

- Renamed `useConsistentObjectDefinition` to [`useConsistentObjectDefinitions`](https://biomejs.dev/linter/rules/use-consistent-object-definitions).

- Renamed `useConsistentResponse` to [`useStaticResponseMethods`](https://biomejs.dev/linter/rules/use-static-response-methods).

- Renamed `useForComponent` to [`useSolidForComponent`](https://biomejs.dev/linter/rules/use-solid-for-component).

- Renamed `useJsonImportAttribute` to [`useJsonImportAttributes`](https://biomejs.dev/linter/rules/use-json-import-attributes).

- Renamed `useNamedOperation` to [`useGraphqlNamedOperations`](https://biomejs.dev/linter/rules/use-graphql-named-operations).

- Renamed `useNamingConvention` to [`useGraphqlNamingConvention`](https://biomejs.dev/linter/rules/use-graphql-naming-convention).

- Renamed `useUnifiedTypeSignature` to [`useUnifiedTypeSignatures`](https://biomejs.dev/linter/rules/use-unified-type-signatures).

Configuration files using the old rule names will need to be updated. Use the migration tool to automatically update your configuration:

Terminal window```
1biome migrate --write
````

[#7159](https://github.com/biomejs/biome/pull/7159) [`df3afdf`](https://github.com/biomejs/biome/commit/df3afdf0e29ebb1db6ec4cf6f54ec822c82e38ab) Thanks [@ematipico](https://github.com/ematipico)! - Added the new rule `noBiomeFirstException`. This rule prevents the incorrect usage of patterns inside `files.includes`.

This rule catches if the first element of the array contains `!`. This mistake will cause Biome to analyze no files:

biome.json\`\`\`
1{2  files: {3    includes: \["!dist/\*\*"], // this is an error4  },5}

```

[#6923](https://github.com/biomejs/biome/pull/6923) [`0589f08`](https://github.com/biomejs/biome/commit/0589f085ee444418c742f5e5eb7fae0522d83ea0) Thanks [@ptkagori](https://github.com/ptkagori)! - Added Qwik Domain to Biome

This release introduces **Qwik domain support** in Biome, enabling Qwik developers to use Biome as a linter and formatter for their projects.

- Added the Qwik domain infrastructure to Biome.

Enabled the following rules for Qwik:

- [`useJsxKeyInIterable`](https://biomejs.dev/linter/rules/use-jsx-key-in-iterable)

- [`noReactSpecificProps`](https://biomejs.dev/linter/rules/no-react-specific-props)

[#6989](https://github.com/biomejs/biome/pull/6989) [`85b1128`](https://github.com/biomejs/biome/commit/85b11289efbda3061438dfb52ceb186d2142a646) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6965](https://github.com/biomejs/biome/issues/6965): Implemented smarter scanner for project rules.

Previously, if project rules were enabled, Biome’s scanner would scan all dependencies regardless of whether they were used by/reachable from source files or not. While this worked for a first version, it was far from optimal.

The new scanner first scans everything listed under the `files.includes` setting, and then descends into the dependencies that were discovered there, including transitive dependencies. This has three main advantages:

- Dependencies that are not reachable from your source files don’t get indexed.

- Dependencies that have multiple type definitions, such as those with separate definitions for CommonJS and ESM imports, only have the relevant definitions indexed.

- If `vcs.useIgnoreFile` is enabled, `.gitignore` gets respected as well. Assuming you have folders such as `build/` or `dist/` configured there, those will be automatically ignored by the scanner.

The change in the scanner also has a more nuanced impact: Previously, if you used `files.includes` to ignore a file in an included folder, the scanner would still index this file. Now the file is fully ignored, *unless you import it*.

As a user you should notice better scanner performance (if you have project rules enabled), and hopefully you need to worry less about configuring [`files.experimentalScannerIgnores`](https://biomejs.dev/reference/configuration/#filesexperimentalscannerignores). Eventually our goal is still to deprecate that setting, so if you’re using it today, we encourage you to see which ignores are still necessary there, and whether you can achieve the same effect by ignoring paths using `files.includes` instead.

None of these changes affect the scanner if no project rules are enabled.

[#6731](https://github.com/biomejs/biome/pull/6731) [`d6a05b5`](https://github.com/biomejs/biome/commit/d6a05b5fa9358a5b1689b326724eaa7e2a86468d) Thanks [@ematipico](https://github.com/ematipico)! - The `--reporter=summary` has been greatly enhanced. It now shows the list of files that contains violations, the files shown are clickable and can be opened from the editor.

Below an example of the new version:

```

1reporter/parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━2
3  i The following files have parsing errors.4
5  - index.css6
7reporter/format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━8
9  i The following files needs to be formatted.10
11  - index.css12  - index.ts13  - main.ts14
15reporter/violations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━16
17  i Some lint rules or assist actions reported some violations.18
19  Rule Name                                        Diagnostics20
21  lint/correctness/noUnknownFunction               14 (2 error(s), 12 warning(s), 0 info(s))22  lint/suspicious/noImplicitAnyLet                 16 (12 error(s), 4 warning(s), 0 info(s))23  lint/suspicious/noDoubleEquals                   8 (8 error(s), 0 warning(s), 0 info(s))24  assist/source/organizeImports                    2 (2 error(s), 0 warning(s), 0 info(s))25  lint/suspicious/noRedeclare                      12 (12 error(s), 0 warning(s), 0 info(s))26  lint/suspicious/noDebugger                       8 (8 error(s), 0 warning(s), 0 info(s))

````

[#6896](https://github.com/biomejs/biome/pull/6896) [`527db7f`](https://github.com/biomejs/biome/commit/527db7f7c142f8c95c6d4513603530220a4cc95c) Thanks [@ematipico](https://github.com/ematipico)! - Added new functions to the `@biomejs/wasm-*` packages:

- `fileExists`: returns whether the input file exists in the workspace.

- `isPathIgnored`: returns whether the input path is ignored.

- `updateModuleGraph`: updates the internal module graph of the input path.

- `getModuleGraph`: it returns a serialized version of the internal module graph.

- `scanProject`: scans the files and directories in the project to build the internal module graph.

[#6398](https://github.com/biomejs/biome/pull/6398) [`d1a315d`](https://github.com/biomejs/biome/commit/d1a315d19e970341c8e6582c1f6f80b42c77ecb5) Thanks [@josh-](https://github.com/josh-)! - Added support for tracking stable results in user-provided React hooks that return objects to [`useExhaustiveDependencies`](https://biomejs.dev/linter/rules/use-exhaustive-dependencies/) to compliment existing support for array return values. For example:

biome.json```
1{2  // rule options3  useExhaustiveDependencies: {4    level: "error",5    options: {6      hooks: [7        {8          name: "useCustomHook",9          stableResult: ["setMyState"],10        },11      ],12    },13  },14}
````

This will allow the following to be validated:

```
1const { myState, setMyState } = useCustomHook();2const toggleMyState = useCallback(() => {3  setMyState(!myState);4}, [myState]); // Only `myState` needs to be specified here.
```

{  setMyState(!myState);}, \[myState]); // Only \`myState\` needs to be specified here.">

[#7201](https://github.com/biomejs/biome/pull/7201) [`2afaa49`](https://github.com/biomejs/biome/commit/2afaa49b814b12b52a1ffa06ed6c67d21ea57e1a) Thanks [@Conaclos](https://github.com/Conaclos)! - Implemented [#7174](https://github.com/biomejs/biome/issues/7174). [`useConst`](https://biomejs.dev/linter/rules/use-const/) no longer reports variables that are read before being written.

Previously, `useConst` reported uninitialised variables that were read in an inner function before being written, as shown in the following example:

```
1let v;2function f() {3  return v;4}5v = 0;
```

This can produce false positives in the case where `f` is called before `v` has been written, as in the following code:

```
1let v;2function f() {3  return v;4}5console.log(f()); // print `undefined`6v = 0;
```

Although this is an expected behavior of the original implementation, we consider it problematic since the rule’s fix is marked as safe.
To avoid false positives like this, the rule now ignores the previous examples.
However, this has the disadvantage of resulting in false negatives, such as not reporting the first example.

### Patch Changes

[#7156](https://github.com/biomejs/biome/pull/7156) [`137d111`](https://github.com/biomejs/biome/commit/137d1118e4598a0ef2c0104e45cb00a8bf179199) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#7152](https://github.com/biomejs/biome/issues/7152). Now the rule `noDuplicateFontNames` correctly detects font names with spaces e.g. `Liberation Mono`. The diagnostic of the rule now points to the first instances of the repeated font.

The following example doesn’t trigger the rule anymore:

```
1c {2  font-family:3    SF Mono,4    Liberation Mono,5    sans-serif;6}7d {8  font:9    1em SF Mono,10    Liberation Mono,11    sans-serif;12}
```

[#6907](https://github.com/biomejs/biome/pull/6907) [`7331bb9`](https://github.com/biomejs/biome/commit/7331bb9979143c355d861eadcde4f075e6b70910) Thanks [@ematipico](https://github.com/ematipico)! - Added a new **experimental option** that allows parsing of `.html` files that contain interpolation syntax.

biome.json\`\`\`
1{2  html: {3    // This is the new, experimental option.4    parser: {5      interpolation: true,6    },7  },8}

```
```

1\<h1>{{ $title }}\</h1>

```

[#7124](https://github.com/biomejs/biome/pull/7124) [`3f436b8`](https://github.com/biomejs/biome/commit/3f436b84bb62320c16c1ca1ac5b419e4d9abefb3) Thanks [@Jayllyz](https://github.com/Jayllyz)! - Added the rule [`useMaxParams`](https://biomejs.dev/linter/rules/use-max-params).

This rule enforces a maximum number of parameters for functions to improve code readability and maintainability. Functions with many parameters are difficult to read, understand, and maintain because they require memorizing parameter order and types.

```

1// Invalid - too many parameters (default max: 4)2function processData(3  name,4  age,5  email,6  phone,7  address,8  city,9  country,10  zipCode,11) {12  // ...13}14
15// Valid - within parameter limit16function processData(userData) {17  const { name, age, email, phone, address, city, country, zipCode } =18    userData;19  // ...20}21
22function calculateSum(a, b, c) {23  return a + b + c;24}

```

[#7161](https://github.com/biomejs/biome/pull/7161) [`1a14a59`](https://github.com/biomejs/biome/commit/1a14a59c52f9389220e7682de5632b7d7291a4e4) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#7160](https://github.com/biomejs/biome/issues/7160). Now Biome correctly computes ignored files when using `formatter.includes`, `linter.includes` and `assist.includes` inside nested configurations that use `"extends": "//"`.

[#7081](https://github.com/biomejs/biome/pull/7081) [`a081bbe`](https://github.com/biomejs/biome/commit/a081bbef37a4b329ace1cb0eb88c36f6c6162af1) Thanks [@Jayllyz](https://github.com/Jayllyz)! - Added the rule [`noNextAsyncClientComponent`](https://biomejs.dev/linter/rules/no-next-async-client-component).

This rule prevents the use of async functions for client components in Next.js applications. Client components marked with “use client” directive should not be async as this can cause hydration mismatches, break component rendering lifecycle, and lead to unexpected behavior with React’s concurrent features.

```

1"use client";2
3// Invalid - async client component4export default async function MyComponent() {5  return \<div>Hello\</div>;6}7
8// Valid - synchronous client component9export default function MyComponent() {10  return \<div>Hello\</div>;11}

```

Hello;}// Valid - synchronous client componentexport default function MyComponent() {  return Hello;}">

[#7171](https://github.com/biomejs/biome/pull/7171) [`5241690`](https://github.com/biomejs/biome/commit/5241690265c584cfb4e6827e82a496801f039197) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#7162](https://github.com/biomejs/biome/issues/7162): The `noUndeclaredDependencies` rule now considers a type-only import as a dev dependency.

For example, the following code is no longer reported:

**`package.json`**:

```

1{2  "devDependencies": {3    "type-fest": "\*"4  }5}

```

**`foo.ts`**:

```

1import type { SetRequired } from "type-fest";

```

Note that you still need to declare the package in the `devDependencies` section in `package.json`.

  ##  [2.1.4](/internals/changelog/version/2-1-4/)

   ### Patch Changes

[#7121](https://github.com/biomejs/biome/pull/7121) [`b9642ab`](https://github.com/biomejs/biome/commit/b9642abc6d05135180f4243df30524cf40ba12df) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#7111](https://github.com/biomejs/biome/issues/7111): Imported symbols using aliases are now correctly recognised.

[#7103](https://github.com/biomejs/biome/pull/7103) [`80515ec`](https://github.com/biomejs/biome/commit/80515ecad8cc272feeae4c17762d3b150acd88e7) Thanks [@omasakun](https://github.com/omasakun)! - Fixed [#6933](https://github.com/biomejs/biome/issues/6933) and [#6994](https://github.com/biomejs/biome/issues/6994).

When the values of private member assignment expressions, increment expressions, etc. are used, those private members are no longer marked as unused.

[#6887](https://github.com/biomejs/biome/pull/6887) [`0cc38f5`](https://github.com/biomejs/biome/commit/0cc38f59cd9ddf0fdcd12d6f8cb3642743cc4406) Thanks [@ptkagori](https://github.com/ptkagori)! - Added the [`noQwikUseVisibleTask`](https://biomejs.dev/linter/rules/no-qwik-use-visible-task) rule to Qwik.

This rule is intended for use in Qwik applications to warn about the use of `useVisibleTask$()` functions which require careful consideration before use.

**Invalid:**

```

1useVisibleTask$(() => {2  console.log("Component is visible");3});

```

 {  console.log(&#x22;Component is visible&#x22;);});">
**Valid:**

```

1useTask$(() => {2  console.log("Task executed");3});

```

 {  console.log(&#x22;Task executed&#x22;);});">

[#7084](https://github.com/biomejs/biome/pull/7084) [`50ca155`](https://github.com/biomejs/biome/commit/50ca1553f08348ab1e92dc7cf04013c85ff743a4) Thanks [@ematipico](https://github.com/ematipico)! - Added the new nursery rule `noUnnecessararyConditions`, which detects whenever some conditions don’t
change during the life cycle of the program, and truthy or false, hence deemed redundant.
For example, the following snippets will trigger the rule:

```

1// Always truthy literal conditions2if (true) {3  console.log("always runs");4}

```
```

1// Unnecessary condition on constrained string type2function foo(arg: "bar" | "baz") {3  if (arg) {4    // This check is unnecessary5  }6}

```

[#6887](https://github.com/biomejs/biome/pull/6887) [`0cc38f5`](https://github.com/biomejs/biome/commit/0cc38f59cd9ddf0fdcd12d6f8cb3642743cc4406) Thanks [@ptkagori](https://github.com/ptkagori)! - Added the [`useImageSize`](https://biomejs.dev/linter/rules/use-image-size) rule to Biome.

The `useImageSize` rule enforces the use of width and height attributes on `&#x3C;img>` elements for performance reasons. This rule is intended to prevent layout shifts and improve Core Web Vitals by ensuring images have explicit dimensions.

**Invalid:**

```

1\<img src="/image.png" />2\<img src="<https://example.com/image.png>" />3\<img src="/image.png" width="200" />4\<img src="/image.png" height="200" />

```

">
**Valid:**

```

1\<img width="200" height="600" src="/static/images/portrait-01.webp" />2\<img width="100" height="100" src="<https://example.com/image.png>" />

```

">

[#6887](https://github.com/biomejs/biome/pull/6887) [`0cc38f5`](https://github.com/biomejs/biome/commit/0cc38f59cd9ddf0fdcd12d6f8cb3642743cc4406) Thanks [@ptkagori](https://github.com/ptkagori)! - Added the [`useAnchorHref`](https://biomejs.dev/linter/rules/use-anchor-href) rule to Biome.

The `useAnchorHref` rule enforces the presence of an `href` attribute on `&#x3C;a>` elements in JSX. This rule is intended to ensure that anchor elements are always valid and accessible.

**Invalid:**

```

1\<a>Link\</a>

```

Link">
```

1\<a target="\_blank">External\</a>

```

External">
**Valid:**

```

1\<a href="/home">Home\</a>

```

Home">
```

1\<a href="<https://example.com>" target="\_blank">2  External3\</a>

```

  External">

[#7100](https://github.com/biomejs/biome/pull/7100) [`29fcb05`](https://github.com/biomejs/biome/commit/29fcb0540ed817d92a3f663132b658541706765b) Thanks [@Jayllyz](https://github.com/Jayllyz)! - Added the rule [`noNonNullAssertedOptionalChain`](https://biomejs.dev/linter/rules/no-non-null-asserted-optional-chain).

This rule prevents the use of non-null assertions (`!`) immediately after optional chaining expressions (`?.`). Optional chaining is designed to safely handle nullable values by returning `undefined` when the chain encounters `null` or `undefined`. Using a non-null assertion defeats this purpose and can lead to runtime errors.

```

1// Invalid - non-null assertion after optional chaining2obj?.prop!;3obj?.method()!;4obj?.\[key]!;5obj?.prop!;6
7// Valid - proper optional chaining usage8obj?.prop;9obj?.method();10obj?.prop ?? defaultValue;11obj!.prop?.method();

```

[#7129](https://github.com/biomejs/biome/pull/7129) [`9f4538a`](https://github.com/biomejs/biome/commit/9f4538ab8bad8a974b8e408641b1fd4770d26c79) Thanks [@drwpow](https://github.com/drwpow)! - Removed option, combobox, listbox roles from [useSemanticElements](https://biomejs.dev/linter/rules/use-semantic-elements/) suggestions

[#7106](https://github.com/biomejs/biome/pull/7106) [`236deaa`](https://github.com/biomejs/biome/commit/236deaadca077051f6e2ef01cfdbbc55cc1c3d78) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6985](https://github.com/biomejs/biome/issues/6985): Inference of return types no longer mistakenly picks up return types of nested functions.

[#7102](https://github.com/biomejs/biome/pull/7102) [`d3118c6`](https://github.com/biomejs/biome/commit/d3118c6ac3bba0ca29251fa7fc5ba36a9e4456b0) Thanks [@omasakun](https://github.com/omasakun)! - Fixed [#7101](https://github.com/biomejs/biome/issues/7101): [`noUnusedPrivateClassMembers`](https://biomejs.dev/linter/rules/no-unused-private-class-members/) now handles members declared as part of constructor arguments:

- If a class member defined in a constructor argument is only used within the constructor, it removes the `private` modifier and makes it a plain method argument.

- If it is not used at all, it will prefix it with an underscore, similar to `noUnusedFunctionParameter`.

[#7104](https://github.com/biomejs/biome/pull/7104) [`5395297`](https://github.com/biomejs/biome/commit/53952972cd5786cfdcc3deda0c226d6488ef1aee) Thanks [@harxki](https://github.com/harxki)! - Reverting to prevent regressions around ref handling

[#7143](https://github.com/biomejs/biome/pull/7143) [`1a6933a`](https://github.com/biomejs/biome/commit/1a6933aaf2c5b57d70a60d607b5cab68d532eeb4) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#6799](https://github.com/biomejs/biome/issues/6799): The [`noImportCycles`](https://biomejs.dev/linter/rules/no-import-cycles/) rule now ignores type-only imports if the new `ignoreTypes` option is enabled (enabled by default).

[!WARNING]
**Breaking Change**: The `noImportCycles` rule no longer detects import cycles that include one or more type-only imports by default.
To keep the old behaviour, you can turn off the `ignoreTypes` option explicitly:
```

1{2  "linter": {3    "rules": {4      "nursery": {5        "noImportCycles": {6          "options": {7            "ignoreTypes": false8          }9        }10      }11    }12  }13}

```

[#7099](https://github.com/biomejs/biome/pull/7099) [`6cc84cb`](https://github.com/biomejs/biome/commit/6cc84cb547480f83119d2cba5542e2d2afc65b4d) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#7062](https://github.com/biomejs/biome/issues/7062): Biome now correctly considers extended configs when determining the mode for the scanner.

[#6887](https://github.com/biomejs/biome/pull/6887) [`0cc38f5`](https://github.com/biomejs/biome/commit/0cc38f59cd9ddf0fdcd12d6f8cb3642743cc4406) Thanks [@ptkagori](https://github.com/ptkagori)! - Added the [`useQwikClasslist`](https://biomejs.dev/linter/rules/use-qwik-classlist) rule to Biome.

This rule is intended for use in Qwik applications to encourage the use of the built-in `class` prop (which accepts a string, object, or array) instead of the `classnames` utility library.

**Invalid:**

```

1\<div class={classnames({ active: true, disabled: false })} />

```

">
**Valid:**

```

1\<div classlist={{ active: true, disabled: false }} />

```

">

[#7019](https://github.com/biomejs/biome/pull/7019) [`57c15e6`](https://github.com/biomejs/biome/commit/57c15e6df5b6257ffb9f69d7614c3455a1f5c870) Thanks [@fireairforce](https://github.com/fireairforce)! - Added support in the JS parser for `import source`(a [stage3 proposal](https://github.com/tc39/proposal-source-phase-imports)). The syntax looks like:

```

1import source foo from "\<specifier>";

```

&#x22;;">

[#7053](https://github.com/biomejs/biome/pull/7053) [`655049e`](https://github.com/biomejs/biome/commit/655049e9e38f536b33fff6d7b160299f0b446908) Thanks [@jakeleventhal](https://github.com/jakeleventhal)! - Added the [`useConsistentTypeDefinitions`](https://biomejs.dev/linter/rules/use-consistent-type-definitions) rule.

This rule enforces consistent usage of either `interface` or `type` for object type definitions in TypeScript.

The rule accepts an option to specify the preferred style:

- `interface` (default): Prefer using `interface` for object type definitions

- `type`: Prefer using `type` for object type definitions

Examples:

```

1// With default option (interface)2// ❌ Invalid3type Point = { x: number; y: number };4
5// ✅ Valid6interface Point {7  x: number;8  y: number;9}10
11// With option { style: "type" }12// ❌ Invalid13interface Point {14  x: number;15  y: number;16}17
18// ✅ Valid19type Point = { x: number; y: number };

```

The rule will automatically fix simple cases where conversion is straightforward.

  ##  [2.1.3](/internals/changelog/version/2-1-3/)

   ### Patch Changes

[#7057](https://github.com/biomejs/biome/pull/7057) [`634a667`](https://github.com/biomejs/biome/commit/634a667ac8e9f74a4633895eab4bd4695ffffa1d) Thanks [@mdevils](https://github.com/mdevils)! - Added the rule [`noVueReservedKeys`](https://biomejs.dev/linter/rules/no-vue-reserved-keys/), which prevents the use of reserved Vue keys.

It prevents the use of Vue reserved keys such as those starting with like `$el`, `$data`, `$props`) and keys starting with `\_` in data properties, which can cause conflicts and unexpected behavior in Vue components.

##### Invalid example

```

1\<script>2export default {3  data: {4    $el: "",5    \_foo: "bar",6  },7};8\</script>

```
```

1\<script>2export default {3  computed: {4    $data() {5      return this.someData;6    },7  },8};9\</script>

```

##### Valid examples

```

1\<script>2export default {3  data() {4    return {5      message: "Hello Vue!",6      count: 0,7    };8  },9};10\</script>

```
```

1\<script>2export default {3  computed: {4    displayMessage() {5      return this.message;6    },7  },8};9\</script>

```

[#6941](https://github.com/biomejs/biome/pull/6941) [`734d708`](https://github.com/biomejs/biome/commit/734d708bd84f32d72e5972cc27c194d5da46a3c0) Thanks [@JamBalaya56562](https://github.com/JamBalaya56562)! - Added `@eslint-react/no-nested-component-definitions` as a rule source for `noNestedComponentDefinitions`. Now it will get picked up by `biome migrate --eslint`.

[#6463](https://github.com/biomejs/biome/pull/6463) [`0a16d54`](https://github.com/biomejs/biome/commit/0a16d54c2cffbf13c5144b53021923734f1c234e) Thanks [@JamBalaya56562](https://github.com/JamBalaya56562)! - Fixed a website link for the `useComponentExportOnlyModules` linter rule to point to the correct URL.

[#6944](https://github.com/biomejs/biome/pull/6944) [`e53f2fe`](https://github.com/biomejs/biome/commit/e53f2fe03827a8dcad2184178ecfaee0e35af992) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6910](https://github.com/biomejs/biome/issues/6910): Biome now ignores type casts and assertions when evaluating numbers for `noMagicNumbers` rule.

[#6991](https://github.com/biomejs/biome/pull/6991) [`476cd55`](https://github.com/biomejs/biome/commit/476cd55e4e5b1b03335e14c65ad01b2bbb4b8d42) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Fixed [#6973](https://github.com/biomejs/biome/issues/6973): Add support for parsing the :active-view-transition-type() pseudo-class

```

1:active-view-transition-type(first second) {2}

```

[#6992](https://github.com/biomejs/biome/pull/6992) [`0b1e194`](https://github.com/biomejs/biome/commit/0b1e19474e323c7354fccff0c5654d47024c7b91) Thanks [@ematipico](https://github.com/ematipico)! - Added a new JSON rule called `noQuickfixBiome`, which disallow the use of code action `quickfix.biome` inside code editor settings.

[#6943](https://github.com/biomejs/biome/pull/6943) [`249306d`](https://github.com/biomejs/biome/commit/249306db32b6a912f39d2c88a1b0d702b8b97a9b) Thanks [@JamBalaya56562](https://github.com/JamBalaya56562)! - Fixed `@vitest/eslint-plugin` source url.

[#6947](https://github.com/biomejs/biome/pull/6947) [`4c7ed0f`](https://github.com/biomejs/biome/commit/4c7ed0fda858424a21fb1766270aaa74838a46a1) Thanks [@JamBalaya56562](https://github.com/JamBalaya56562)! - Fixed ESLint migration for the rule `prefer-for` from `eslint-plugin-solid` to Biome’s `useForComponent`.

[#6976](https://github.com/biomejs/biome/pull/6976) [`72ebadc`](https://github.com/biomejs/biome/commit/72ebadce0e192932d237d9a31c45cb230c8bbd91) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#6692](https://github.com/biomejs/biome/issues/6692): The rules `noUnusedVariables` and `noUnusedFunctionParameters` no longer cause an infinite loop when the suggested name is not applicable (e.g. the suggested name is already declared in the scope).

[#6990](https://github.com/biomejs/biome/pull/6990) [`333f5d0`](https://github.com/biomejs/biome/commit/333f5d0a11dc1b2c029c657905bc73d3daf72477) Thanks [@rvanlaarhoven](https://github.com/rvanlaarhoven)! - Fixed the documentation URL for `lint/correctness/noUnknownPseudoClass`

[#7000](https://github.com/biomejs/biome/pull/7000) [`4021165`](https://github.com/biomejs/biome/commit/402116575ef570da02ccbce521645a3975b3e8ce) Thanks [@harxki](https://github.com/harxki)! - Fixed [#6795](https://github.com/biomejs/biome/issues/6795): `noUnassignedVariables` now correctly recognizes variables used in JSX `ref` attributes.

[#7044](https://github.com/biomejs/biome/pull/7044) [`b091ddf`](https://github.com/biomejs/biome/commit/b091ddf73d323a6929b9601f05ede7e91e4d4cbb) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6622](https://github.com/biomejs/biome/issues/6622), now the rule `useSemanticElements` works for JSX self-closing elements too.

[#7014](https://github.com/biomejs/biome/pull/7014) [`c4864e8`](https://github.com/biomejs/biome/commit/c4864e85ebbb1bbfbb8274c59bb6af9413d8f157) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#6516](https://github.com/biomejs/biome/issues/6516): The `biome migrate` command no longer break the member list with trailing comments.

[#6979](https://github.com/biomejs/biome/pull/6979) [`29cb6da`](https://github.com/biomejs/biome/commit/29cb6da9a1e8f20af59f5e681b9d2aa1a23e8b27) Thanks [@unvalley](https://github.com/unvalley)! - Fixed [#6767](https://github.com/biomejs/biome/issues/6767): `useSortedClasses` now correctly removes leading and trailing whitespace in className.

Previously, trailing spaces in className were not fully removed.

```

1// Think we have this code:2\<div className="text-sm font-bold            " />3
4// Before: applied fix, but a trailing space was preserved5\<div className="font-bold text-sm " />6
7// After: applied fix, trailing spaces removed8\<div className="font-bold text-sm" />

```

// Before: applied fix, but a trailing space was preserved// After: applied fix, trailing spaces removed">

[#7055](https://github.com/biomejs/biome/pull/7055) [`ee4828d`](https://github.com/biomejs/biome/commit/ee4828da9be5898c67b7feabfaaa296ad172109f) Thanks [@dyc3](https://github.com/dyc3)! - Added the nursery rule [`useReactFunctionComponents`](https://biomejs.dev/linter/rules/use-react-function-components/). This rule enforces the preference to use function components instead of class components.

Valid:

```

1function Foo() {2  return \<div>Hello, world!\</div>;3}

```

Hello, world!;}">
Invalid:

```

1class Foo extends React.Component {2  render() {3    return \<div>Hello, world!\</div>;4  }5}

```

Hello, world!;  }}">

[#6924](https://github.com/biomejs/biome/pull/6924) [`2d21be9`](https://github.com/biomejs/biome/commit/2d21be9437fd77a1c534a1ea156d9a9421c17d30) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#113](https://github.com/biomejs/biome-zed/issues/113), where the Biome Language Server didn’t correctly update the diagnostics when the configuration file is modified in the editor. Now the diagnostics are correctly updated every time the configuration file is modified and saved.

[#6931](https://github.com/biomejs/biome/pull/6931) [`e6b2380`](https://github.com/biomejs/biome/commit/e6b238063f92bc95d951e3a78dac42408d0814c0) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6915](https://github.com/biomejs/biome/issues/6915): `useHookAtTopLevel` no longer hangs when rules call themselves recursively.

[#7012](https://github.com/biomejs/biome/pull/7012) [`01c0ab4`](https://github.com/biomejs/biome/commit/01c0ab43ad7785e093e5069dda1d5e6969958bf8) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#5837](https://github.com/biomejs/biome/issues/5837): Invalid suppression comments such as `biome-ignore-all-start` or `biome-ignore-all-end` no longer causes a panic.

[#6949](https://github.com/biomejs/biome/pull/6949) [`48462f8`](https://github.com/biomejs/biome/commit/48462f81ba4e98a95236365a5f9759fc41c045d7) Thanks [@fireairforce](https://github.com/fireairforce)! - Support parse `import defer`(which is a [stage3 proposal](https://github.com/tc39/proposal-defer-import-eval)). The syntax look like this:

```

1import defer \* as foo from "\<specifier>";

```

&#x22;;">

[#6938](https://github.com/biomejs/biome/pull/6938) [`5feb5a6`](https://github.com/biomejs/biome/commit/5feb5a675adb246b04b1540cba16ff1c5fd49cb1) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6919](https://github.com/biomejs/biome/issues/6919) and [#6920](https://github.com/biomejs/biome/issues/6920):
`useReadonlyClassProperties` now does checks for mutations in async class methods.
Example:

```

1class Counter3 {2  private counter: number;3  async count() {4    this.counter = 1;5    const counterString = `${this.counter++}`;6  }7}

```

[#6942](https://github.com/biomejs/biome/pull/6942) [`cfda528`](https://github.com/biomejs/biome/commit/cfda528169dcceb8422a0488b39a3b1b27a24645) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6939](https://github.com/biomejs/biome/issues/6939). Biome now understands `this` binding in classes outside of methods.

  ##  [2.1.2](/internals/changelog/version/2-1-2/)

   ### Patch Changes

[#6865](https://github.com/biomejs/biome/pull/6865) [`b35bf64`](https://github.com/biomejs/biome/commit/b35bf6448fb1950c922e627254588e96748e287f) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Fix [#6485](https://github.com/biomejs/biome/issues/6485): Handle multiple semicolons correctly in blocks (#6485)

```

1div {2  box-sizing: border-box;3  color: red;4}

```

[#6798](https://github.com/biomejs/biome/pull/6798) [`3579ffa`](https://github.com/biomejs/biome/commit/3579ffaae4e86835b001fee4ab7dd8aabb03ae54) Thanks [@dyc3](https://github.com/dyc3)! - Fixed [#6762](https://github.com/biomejs/biome/issues/6762), Biome now knows that `~/.config/zed/settings.json` and `~/.config/Code/User/settings.json` allows comments by default.

[#6839](https://github.com/biomejs/biome/pull/6839) [`4cd62d8`](https://github.com/biomejs/biome/commit/4cd62d8ae2e5cb24d6f308e05b38003486294548) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6838](https://github.com/biomejs/biome/issues/6838), where the Biome File Watcher incorrectly watched and stored ignored files, causing possible memory leaks when those files were dynamically created (e.g. built files).

[#6879](https://github.com/biomejs/biome/pull/6879) [`0059cd9`](https://github.com/biomejs/biome/commit/0059cd9b5e6ba33cabb5e153bd03e2041effb0cd) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Refactor: remove one level of indirection for CSS declarations with semicolon
Previously, accessing a declaration from a list required an extra step:
```

1item2.as\_any\_css\_declaration\_with\_semicolon()3.as\_css\_declaration\_with\_semicolon()

```

Now, it can be done directly with:

```

1item.as\_css\_declaration\_with\_semicolon()

```

[#6839](https://github.com/biomejs/biome/pull/6839) [`4cd62d8`](https://github.com/biomejs/biome/commit/4cd62d8ae2e5cb24d6f308e05b38003486294548) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a bug where the Biome Language Server didn’t correctly ignore specific files when `vcs.useIgnoreFile` is set to `true`.

[#6884](https://github.com/biomejs/biome/pull/6884) [`5ff50f8`](https://github.com/biomejs/biome/commit/5ff50f8291ca6f8f59fccfc326c8f0bdc3127842) Thanks [@arendjr](https://github.com/arendjr)! - Improved the performance of `noImportCycles` by ~30%.

[#6903](https://github.com/biomejs/biome/pull/6903) [`241dd9e`](https://github.com/biomejs/biome/commit/241dd9e487226fc58b4ceceaf3164e36d8e22d3b) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6829](https://github.com/biomejs/biome/issues/6829): Fixed a false positive reported by `useImportExtensions` when importing a `.js` file that had a matching `.d.ts` file in the same folder.

[#6846](https://github.com/biomejs/biome/pull/6846) [`446112e`](https://github.com/biomejs/biome/commit/446112e79d695c50ca9cc9f2d25c91cf03115f50) Thanks [@darricheng](https://github.com/darricheng)! - Fixed an issue where biome was using the wrong string quotes when the classes string has quotes, resulting in invalid code after applying the fix.

[#6823](https://github.com/biomejs/biome/pull/6823) [`eebc48e`](https://github.com/biomejs/biome/commit/eebc48e0120958a39186f510278e1e5eacad3f1c) Thanks [@arendjr](https://github.com/arendjr)! - Improved [#6172](https://github.com/biomejs/biome/issues/6172): Optimised the way function arguments are stored in Biome’s type inference. This led to about 10% performance improvement in `RedisCommander.d.ts` and about 2% on `@next/font` type definitions.

[#6878](https://github.com/biomejs/biome/pull/6878) [`3402976`](https://github.com/biomejs/biome/commit/340297602c1162928735d1c073d7a409c22e90bd) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a bug where the Biome Language Server would apply an unsafe fix when using the code action `quickfix.biome`.

Now Biome no longer applies an unsafe code fix when using the code action `quickfix.biome`.

[#6794](https://github.com/biomejs/biome/pull/6794) [`4d5fc0e`](https://github.com/biomejs/biome/commit/4d5fc0ef38f8c4ad820e297749efc83e983b5a91) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6719](https://github.com/biomejs/biome/issues/6719): The `noInvalidUseBeforeDeclaration` rule covers additional use cases.

Examples:

```

1type Bar = { \[BAR]: true };2const BAR = "bar";

```
```

1interface Bar {2  child: { grandChild: { \[BAR]: typeof BAR; enumFoo: EnumFoo } };3}4const BAR = "bar";5enum EnumFoo {6  BAR = "bar",7}

```

[#6863](https://github.com/biomejs/biome/pull/6863) [`531e97e`](https://github.com/biomejs/biome/commit/531e97e3f691e3ff34d2382fab414072ecb68e8b) Thanks [@dyc3](https://github.com/dyc3)! - Biome now considers whether the linter is enabled when figuring out how the project should be scanned. Resolves [#6815](https://github.com/biomejs/biome/issues/6815).

[#6832](https://github.com/biomejs/biome/pull/6832) [`bdbc2b1`](https://github.com/biomejs/biome/commit/bdbc2b10ac21dcb35b41e93b17e712ba80f421ca) Thanks [@togami2864](https://github.com/togami2864)! - Fixed [#6165](https://github.com/biomejs/biome/issues/6165): Fixed false negative in [`noUnusedPrivateClassMembers`](https://biomejs.dev/linter/rules/no-unused-private-class-members/) rule when checking member usage in classes

[#6839](https://github.com/biomejs/biome/pull/6839) [`4cd62d8`](https://github.com/biomejs/biome/commit/4cd62d8ae2e5cb24d6f308e05b38003486294548) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a bug where the root ignore file wasn’t correctly loaded during the scanning phase, causing false positives and incorrect expectations among users.

Now, when using `vcs.useIgnoreFile`, the **the globs specified in the ignore file from the project root** will have the same semantics as the `files.includes` setting of the root configuration.

Refer to the [relative web page](https://biomejs.dev/internals/architecture/#configuring-the-scanner) to understand how they work.

[#6898](https://github.com/biomejs/biome/pull/6898) [`5beb024`](https://github.com/biomejs/biome/commit/5beb024d8e9af8733bc115ba4b07d20036fe336e) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6891](https://github.com/biomejs/biome/issues/6891): Improved type inference for array indices.

**Example:**

```

1const numbers: number\[];2numbers\[42]; // This now infers to `number | undefined`.

```

[#6809](https://github.com/biomejs/biome/pull/6809) [`8192451`](https://github.com/biomejs/biome/commit/819245188e587d0a5ede53aa07899a2cb9fcce4f) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6796](https://github.com/biomejs/biome/issues/6796): Fixed a false positive that happened in `noFloatingPromises` when calling functions that were declared as part of `for ... of` syntax inside `async` functions.

Instead, the variables declared inside `for ... of` loops are now correctly
inferred if the expression being iterated evaluates to an `Array` (support for other iterables will follow later).
**Invalid example**

```

1const txStatements: Array<(tx) => Promise\<any>> = \[];2
3db.transaction((tx: any) => {4  for (const stmt of txStatements) {5    // We correctly flag this resolves to a `Promise`:6    stmt(tx);7  }8});

```

 Promise> = [];db.transaction((tx: any) => {  for (const stmt of txStatements) {    // We correctly flag this resolves to a &#x60;Promise&#x60;:    stmt(tx);  }});">
**Valid example**

```

1async function valid(db) {2  const txStatements: Array<(tx: any) => void> = \[(tx) => tx.insert().run()];3
4  db.transaction((tx: any) => {5    for (const stmt of txStatements) {6      // We don't flag a false positive here anymore:7      stmt(tx);8    }9  });10}

```

 void> = [(tx) => tx.insert().run()];  db.transaction((tx: any) => {    for (const stmt of txStatements) {      // We don&#x27;t flag a false positive here anymore:      stmt(tx);    }  });}">

[#6757](https://github.com/biomejs/biome/pull/6757) [`13a0818`](https://github.com/biomejs/biome/commit/13a0818be8cc08efd303829252cbc3e64bcbca3a) Thanks [@mdevils](https://github.com/mdevils)! - Added the rule [`noVueReservedProps`](https://biomejs.dev/linter/rules/no-vue-reserved-props/), resolves [#6309](https://github.com/biomejs/biome/issues/6309).

It prevents the use of reserved Vue prop names such as `key` and `ref` which can cause conflicts and unexpected behavior in Vue components.

##### Invalid example

```

1import { defineComponent } from "vue";2
3export default defineComponent({4  props: \["ref", "key", "foo"],5});

```
```

1\<script setup>2defineProps({3  ref: String,4  key: String,5  foo: String,6});7\</script>

```

##### Valid examples

```

1import { defineComponent } from "vue";2
3export default defineComponent({4  props: \["foo"],5});

```
```

1\<script setup>2defineProps({ foo: String });3\</script>

```

[#6840](https://github.com/biomejs/biome/pull/6840) [`1a57b51`](https://github.com/biomejs/biome/commit/1a57b51097c7bf4faeb0dcc5330d49e17f86789b) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Allow multiple identifiers in ::part() pseudo-element selector.

```

1::part(first second) {2}

```

[#6845](https://github.com/biomejs/biome/pull/6845) [`4fd44ec`](https://github.com/biomejs/biome/commit/4fd44ec17a3ac6a5486ac94f01e85e62310b8061) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6510](https://github.com/biomejs/biome/issues/6510): The scanner no longer shows diagnostics on inaccessible files unless `--verbose` is used.

[#6844](https://github.com/biomejs/biome/pull/6844) [`b7e2d4d`](https://github.com/biomejs/biome/commit/b7e2d4d3a8b2654278596eaecdccc30405457fc8) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6837](https://github.com/biomejs/biome/issues/6837): Fixed regression with multiple consecutive line suppression comments using instances (like `// biome-ignore lint/correctness/useExhaustiveDependencies(depName): reason`).

[#6818](https://github.com/biomejs/biome/pull/6818) [`5f3f5a6`](https://github.com/biomejs/biome/commit/5f3f5a6e8c12b56dc36bcfb4f8d5077eb33ccf08) Thanks [@siketyan](https://github.com/siketyan)! - Fixed an issue where `textDocument/codeAction` in the LSP could respond with outdated text edits after the workspace watcher observed outdated changes to the file.

[#6804](https://github.com/biomejs/biome/pull/6804) [`3e6ab16`](https://github.com/biomejs/biome/commit/3e6ab1663ab15f9f00ae069ee790e5fd90327082) Thanks [@arendjr](https://github.com/arendjr)! - `noFloatingPromises` will no longer suggest to add `await` keyword inside synchronous callbacks nested inside `async` functions.

[#6901](https://github.com/biomejs/biome/pull/6901) [`c9e969a`](https://github.com/biomejs/biome/commit/c9e969a84158b29d175cd04ea8b921c737b7ed8f) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6777](https://github.com/biomejs/biome/issues/6777): Fixed type inference handling of `this` to avoid infinite recursion.

Thanks to @sterliakov for the thorough investigation!

[#6855](https://github.com/biomejs/biome/pull/6855) [`d1581c7`](https://github.com/biomejs/biome/commit/d1581c7c874b2917132a864d1c65df041ad9181b) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6775](https://github.com/biomejs/biome/issues/6775): `useReadonlyClassProperties` now also captures mutations inside function arguments.

Example:

```

1class Counter {2  private counter: number;3  count() {4    console.log(this.counter++);5    const counterString = `${this.counter++}`;6  }7}

```

[#6839](https://github.com/biomejs/biome/pull/6839) [`4cd62d8`](https://github.com/biomejs/biome/commit/4cd62d8ae2e5cb24d6f308e05b38003486294548) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a bug where Biome didn’t throw any error when `vcs.useIgnoreFile` is set to `true`, and there wasn’t any ignore file read. Now Biome correctly throws an error if no ignore files are found.

[#6911](https://github.com/biomejs/biome/pull/6911) [`6d68074`](https://github.com/biomejs/biome/commit/6d68074bf2a2ca4bc514398a180524394690fafe) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6838](https://github.com/biomejs/biome/issues/6838): Reduce resource consumption in the Biome Language Server by using non-recursive filesystem watchers instead of recursive ones.

Watchers are responsible for notifying Biome of changes to files in the filesystem. We used to set up a single recursive watcher, but that meant that Biome would receive filesystem notifications for *all* files in your project, even for ignored folders such as `build/` or `dist/` folders.

With this patch, we set up non-recursive watchers only for the folders that are relevant to a project.

Related to this, we also solved an issue where incoming notifications were incorrectly filtered, causing ignored files to be processed and stored in our module graph anyway.

  ##  [2.1.1](/internals/changelog/version/2-1-1/)

   ### Patch Changes

[#6781](https://github.com/biomejs/biome/pull/6781) [`9bbd34f`](https://github.com/biomejs/biome/commit/9bbd34f8d4be3dd4ba4c63746a5b2915e578e339) Thanks [@siketyan](https://github.com/siketyan)! - Fixed the `FileFeaturesResult` interface in the WASM API was defined as a mapped object but the actual value was a `Map` object.

[#6761](https://github.com/biomejs/biome/pull/6761) [`cf3c2ce`](https://github.com/biomejs/biome/commit/cf3c2ce3ac28a36eee948ad689794783b0ba23ef) Thanks [@dyc3](https://github.com/dyc3)! - Fixed [#6759](https://github.com/biomejs/biome/issues/6759), a false positive for `noFocusedTests` that was triggered by calling any function with the name `fit` on any object.

The following code will now pass the `noFocusedTests` rule:

```

1import foo from "foo";2foo.fit();

```

  ##  [2.1.0](/internals/changelog/version/2-1-0/)

   ### Minor Changes

[#6512](https://github.com/biomejs/biome/pull/6512) [`0c0bf82`](https://github.com/biomejs/biome/commit/0c0bf82c92ee4e853172f44e38af57afde6de2ce) Thanks [@arendjr](https://github.com/arendjr)! - The rule [`noFloatingPromises`](https://biomejs.dev/linter/rules/no-misused-promises/) can now detect floating arrays of `Promise`s.

**Invalid examples**

```

1// This gets flagged because the Promises are not handled.2\[1, 2, 3].map(async (x) => x + 1);

```

 x + 1);">
**Valid examples**

```

1await Promise.all(\[1, 2, 3].map(async (x) => x + 1));

```

 x + 1));">

[#6637](https://github.com/biomejs/biome/pull/6637) [`6918085`](https://github.com/biomejs/biome/commit/6918085e14b8e34bfd0adc472acce22c31484ab3) Thanks [@arendjr](https://github.com/arendjr)! - Type inference is now able to handle the sequence operator (`,`), as well as post- and pre-update operators: `++`.

**Example**

```

1let x = 5;2
3// We now infer that `x++` resolves to a number, while the expression as a whole4// becomes a Promise:5(x++, new Promise((resolve) => resolve("comma")));

```

 resolve(&#x22;comma&#x22;)));">

[#6752](https://github.com/biomejs/biome/pull/6752) [`c9eaca4`](https://github.com/biomejs/biome/commit/c9eaca4b944acfd18b700c65c904806b11c318d5) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6646](https://github.com/biomejs/biome/issues/6646): `.gitignore` files are now picked up even when running Biome from a nested directory, or when the ignore file itself is ignored through `files.includes`.

[#6746](https://github.com/biomejs/biome/pull/6746) [`90aeead`](https://github.com/biomejs/biome/commit/90aeeadf80700aee9f29121511d0c4c9019a49d6) Thanks [@arendjr](https://github.com/arendjr)! - `biome migrate` no longer enables style rules that were recommended in v1, because that would be undesirable for users upgrading from 2.0.

Users who are upgrading from Biome 1.x are therefore advised to first upgrade to Biome 2.0, and run the migration, before continuing to Biome 2.1 or later.

[#6583](https://github.com/biomejs/biome/pull/6583) [`d415a3f`](https://github.com/biomejs/biome/commit/d415a3f6f204cc7b109dc08f6117fe97ef07b216) Thanks [@arendjr](https://github.com/arendjr)! - Added the nursery rule [`noMisusedPromises`](https://biomejs.dev/linter/rules/no-misused-promises/).

It signals `Promise`s in places where conditionals or iterables are expected.

**Invalid examples**

```

1const promise = Promise.resolve("value");2
3// Using a `Promise` as conditional is always truthy:4if (promise) {5  /\* ... \*/6}7
8// Spreading a `Promise` has no effect:9console.log({ foo: 42, ...promise });10
11// This does not `await` the `Promise`s from the callbacks,12// so it does not behave as you may expect:13\[1, 2, 3].forEach(async (value) => {14  await fetch(`/${value}`);15});

```

 {  await fetch(&#x60;/${value}&#x60;);});">
**Valid examples**

```

1const promise = Promise.resolve("value");2
3if (await promise) {4  /\* ... \*/5}6
7console.log({ foo: 42, ...(await promise) });

```

[#6405](https://github.com/biomejs/biome/pull/6405) [`cd4a9bb`](https://github.com/biomejs/biome/commit/cd4a9bbdcbc176fa2294fd5a2a2565a13b12a51d) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Added the `ignoreRestSiblings` option to the `noUnusedFunctionParameters` rule.

This option is used to ignore unused function parameters that are siblings of the rest parameter.

The default is `false`, which means that unused function parameters that are siblings of the rest parameter will be reported.

**Example**

```

1{2  "rules": {3    "noUnusedFunctionParameters": \["error", { "ignoreRestSiblings": true }]4  }5}

```

[#6614](https://github.com/biomejs/biome/pull/6614) [`0840021`](https://github.com/biomejs/biome/commit/0840021860fcc5e9055f781dce84e80353f9f5ce) Thanks [@arendjr](https://github.com/arendjr)! - We have implemented a more targeted version of the scanner, which ensures that if you provide file paths to handle on the CLI, the scanner will exclude directories that are not relevant to those paths.

Note that for many commands, such as `biome check` and `biome format`, the file paths to handle are implicitly set to the current working directory if you do not provide any path explicitly. The targeted scanner also works with such implicit paths, which means that if you run Biome from a subfolder, other folders that are part of the project are automatically exempted.

Use cases where you invoke Biome from the root of the project without providing a path, as well as those where project rules are enabled, are not expected to see performance benefits from this.

Implemented [#6234](https://github.com/biomejs/biome/issues/6234), and fixed [#6483](https://github.com/biomejs/biome/issues/6483) and [#6563](https://github.com/biomejs/biome/issues/6563).

[#6488](https://github.com/biomejs/biome/pull/6488) [`c5ee385`](https://github.com/biomejs/biome/commit/c5ee38569fc0b91ea9411da25560d3a1076870c6) Thanks [@ianzone](https://github.com/ianzone)! - `nx.json` and `project.json` have been added to the list of well-known files.

[#6720](https://github.com/biomejs/biome/pull/6720) [`52e36ae`](https://github.com/biomejs/biome/commit/52e36ae827d2c9f02520298d6518a00b22db38b8) Thanks [@minht11](https://github.com/minht11)! - Added `$` symbol to [organizeImports](https://biomejs.dev/assist/actions/organize-imports) `:ALIAS:` group.

`import { action } from '$lib'` will be treated as alias import.

### Patch Changes

[#6712](https://github.com/biomejs/biome/pull/6712) [`2649ac6`](https://github.com/biomejs/biome/commit/2649ac625de963bf7411368cdd06142bda362322) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6595](https://github.com/biomejs/biome/issues/6595): Biome now supports `// biome-ignore-all` file-level suppressions in files that start with a shebang (`#!`).

[#6758](https://github.com/biomejs/biome/pull/6758) [`28dc49e`](https://github.com/biomejs/biome/commit/28dc49eacb9da1073d56070eb70b10ed636a1799) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6573](https://github.com/biomejs/biome/issues/6573): Grit plugins can now match bare imports.

**Example**

The following snippet:

```

1`import $source`

```

will now match:

```

1import "main.css";

```

[#6550](https://github.com/biomejs/biome/pull/6550) [`b424f46`](https://github.com/biomejs/biome/commit/b424f4682cdcba5bf4cd6eb4b34486b631ddfbdc) Thanks [@arendjr](https://github.com/arendjr)! - Type inference is now able to handle logical expressions: `&#x26;&#x26;`, `||`, and `??`.

**Examples**

```

1// We can now infer that because `true` is truthy, the entire expression2// evaluates to a `Promise`.3true && Promise.reject("logical operator bypass");4
5// And we know that this doesn't:6false && Promise.reject("logical operator bypass");7
8// Truthiness, falsiness, and non-nullishness can all be determined on more9// complex expressions as well. So the following also works:10type Nullish = null | undefined;11
12type Params = {13  booleanOption: boolean | Nullish;14  falsyOption: false | Nullish;15};16
17function foo({ booleanOption, falsyOption }: Params) {18  // This may be a Promise:19  booleanOption ?? Promise.reject("logical operator bypass");20
21  // But this never is:22  falsyOption && Promise.reject("logical operator bypass");23}

```

[#6413](https://github.com/biomejs/biome/pull/6413) [`4aa0e50`](https://github.com/biomejs/biome/commit/4aa0e50a91f457a059b225f140d9fa44ea08a8fb) Thanks [@wojtekmaj](https://github.com/wojtekmaj)! - Improved error message in [`useDateNow`](https://biomejs.dev/linter/rules/use-date-now/) rule.

[#6673](https://github.com/biomejs/biome/pull/6673) [`341e062`](https://github.com/biomejs/biome/commit/341e062bc28f32adc2ee44c26ab4fb0574750319) Thanks [@dyc3](https://github.com/dyc3)! - Fixed a case where the HTML formatter would mangle embedded language tags if `whitespaceSensitivity` was set to `strict`

[#6642](https://github.com/biomejs/biome/pull/6642) [`a991229`](https://github.com/biomejs/biome/commit/a99122902eb01907f03565d2c7e56186d01764d3) Thanks [@unvalley](https://github.com/unvalley)! - Fixed [#4494](https://github.com/biomejs/biome/issues/4494): The `noSecrets` rule now correctly uses the `entropyThreshold` option to detect secret like strings.

[#6520](https://github.com/biomejs/biome/pull/6520) [`0c43545`](https://github.com/biomejs/biome/commit/0c43545934ba50ca0dbb0581f274e0e41a7e26e7) Thanks [@arendjr](https://github.com/arendjr)! - Type inference is now able to handle ternary conditions in type aliases.

Note that we don’t attempt to evaluate the condition itself. The resulting type is simply a union of both conditional outcomes.

**Example**

```

1type MaybeResult\<T> = T extends Function ? Promise\<string> : undefined;2
3// We can now detect this function *might* return a `Promise`:4function doStuff\<T>(input: T): MaybeResult\<T> {5  /\* ... \*/6}

```

 = T extends Function ? Promise : undefined;// We can now detect this function _might_ return a &#x60;Promise&#x60;:function doStuff(input: T): MaybeResult {  /* ... */}">

[#6711](https://github.com/biomejs/biome/pull/6711) [`1937691`](https://github.com/biomejs/biome/commit/1937691bb7041026475e2f9fc88a2841c5bfacc4) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6654](https://github.com/biomejs/biome/issues/6654): Fixed range highlighting of `&#x3C;explanation>` placeholder in inline suppression block comments.

[#6756](https://github.com/biomejs/biome/pull/6756) [`d12b26f`](https://github.com/biomejs/biome/commit/d12b26f60865e910a3d300e04f216a36ffc63f8e) Thanks [@dyc3](https://github.com/dyc3)! - Fixed [#6669](https://github.com/biomejs/biome/issues/6669): Added an exception to `noUnusedImports` to allow type augmentation imports.

```

1import type {} from "@mui/lab/themeAugmentation";

```

[#6643](https://github.com/biomejs/biome/pull/6643) [`df15ad6`](https://github.com/biomejs/biome/commit/df15ad6e9a99ec3dba17cc4e6e4081736c93b3a7) Thanks [@skewb1k](https://github.com/skewb1k)!

Fixed [#4994](https://github.com/biomejs/biome/discussions/4994): LSP server registered some capabilities even when the client did not support dynamic registration.

[#6599](https://github.com/biomejs/biome/pull/6599) [`5e611fa`](https://github.com/biomejs/biome/commit/5e611fae93c794cdbd290f88cc1676bc6aea090d) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6380](https://github.com/biomejs/biome/issues/6380): The `noFocusedTests` rule now correctly displays the function name in the diagnostic message when a test is focused.

Every instance of a focused test function (like `fdescribe`, `fit`, `ftest` and `only`) had the word ‘only’ hardcoded. This has been updated to use the actual function name, so the message is now more accurate and specific.

Example for `fdescribe`:

```

1  i The 'fdescribe' method is often used for debugging or during implementation.2
3  i Consider removing 'f' prefix from 'fdescribe' to ensure all tests are executed.

```

[#6671](https://github.com/biomejs/biome/pull/6671) [`0c9ab43`](https://github.com/biomejs/biome/commit/0c9ab43bea6ed4005c96ac6e4e7c5553cae16192) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6634](https://github.com/biomejs/biome/issues/6634): The `useReadonlyClassProperties` rule now correctly flags mutations in class getters and in arrow functions within class properties.

Examples:

```

1class GetterWithMutationValue {2  #value: string;3
4  get value() {5    if (!this.#value) {6      this.#value = "defaultValue";7    }8
9    return this.#value;10  }11}

```
```

1class ClassPropertyArrowFunctionWithMutation {2  private bar: string | null = null;3
4  readonly action = () => {5    this.bar = "init";6  };7}

```

 {    this.bar = &#x22;init&#x22;;  };}">

[#6682](https://github.com/biomejs/biome/pull/6682) [`ca04cea`](https://github.com/biomejs/biome/commit/ca04ceab45ceb445522ebf95fdb90a6117995ea5) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6668](https://github.com/biomejs/biome/issues/6668): Biome Assist is now enabled by default for CSS files.

[#6525](https://github.com/biomejs/biome/pull/6525) [`66b089c`](https://github.com/biomejs/biome/commit/66b089c9031bf02808426c1cd67b53d75663cca7) Thanks [@arendjr](https://github.com/arendjr)! - Type inference can now infer the return types of functions and methods without annotations.

**Examples**

```

1const sneakyObject = {2  doSomething() {3    return Promise.resolve("This is a floating promise!");4  },5};6
7// We can now detect that `doSomething()` returns a `Promise`.8sneakyObject.doSomething();

```

[#6531](https://github.com/biomejs/biome/pull/6531) [`c06df79`](https://github.com/biomejs/biome/commit/c06df798908d7e624b03edc3be2a06ca249ad520) Thanks [@arendjr](https://github.com/arendjr)! - Biome’s type inference now detects the type of properties with getters.

**Examples**

```

1const sneakyObject2 = {2  get something() {3    return new Promise((\_, reject) => reject("This is a floating promise!"));4  },5};6// We now detect this is a Promise:7sneakyObject2.something;

```

 reject(&#x22;This is a floating promise!&#x22;));  },};// We now detect this is a Promise:sneakyObject2.something;">

[#6587](https://github.com/biomejs/biome/pull/6587) [`a330fcc`](https://github.com/biomejs/biome/commit/a330fcc9ad6901d82b6f460d4bf50d7bdca7efbd) Thanks [@Conaclos](https://github.com/Conaclos)! - `organizeImports` is now able to sort named specifiers and import attributes with bogus nodes.

[#6618](https://github.com/biomejs/biome/pull/6618) [`6174869`](https://github.com/biomejs/biome/commit/6174869dc0b6df82cda3fc5c1b7603157371a069) Thanks [@Shinyaigeek](https://github.com/Shinyaigeek)! - Fixed [#6610](https://github.com/biomejs/biome/issues/6610): JSON import attributes are now correctly detected when they contain extra whitespace.

[#6753](https://github.com/biomejs/biome/pull/6753) [`fce5d2c`](https://github.com/biomejs/biome/commit/fce5d2cd3708e3010e0a9acdef184c01a79929bb) Thanks [@dyc3](https://github.com/dyc3)! - Improved the error messages when Biome is provided incompatible arguments on the CLI.

[#6587](https://github.com/biomejs/biome/pull/6587) [`a330fcc`](https://github.com/biomejs/biome/commit/a330fcc9ad6901d82b6f460d4bf50d7bdca7efbd) Thanks [@Conaclos](https://github.com/Conaclos)! - Fixed [#6491](https://github.com/biomejs/biome/issues/6491): The action of `useSortedKeys` removed comments or wrongly transferred them to distinct nodes.

[#6696](https://github.com/biomejs/biome/pull/6696) [`92964a7`](https://github.com/biomejs/biome/commit/92964a7ae076b9b08b83da329e2b8a5825e30da9) Thanks [@unvalley](https://github.com/unvalley)! - Fixed [#6633](https://github.com/biomejs/biome/6633): The `noImplicitCoercion` rule no longer reports diagnostics for `1 / value` expressions.

```

11 / value; // no error

```

[#6683](https://github.com/biomejs/biome/pull/6683) [`43d871e`](https://github.com/biomejs/biome/commit/43d871e0f8b331dfece2b1671152e6336e673ec8) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6537](https://github.com/biomejs/biome/issues/6537): Biome no longer removes the trailing comma from JSON files when `formatter.json.trailingCommas` is explicitly set to `"all"`.

[#6693](https://github.com/biomejs/biome/pull/6693) [`bfdce0b`](https://github.com/biomejs/biome/commit/bfdce0be416db38ab18e68a41ddd0ab82177c14b) Thanks [@dyc3](https://github.com/dyc3)! - Fixed [#6691](https://github.com/biomejs/biome/issues/6691): The HTML parser will now consider `.` to be a valid character for tag names.

[#6716](https://github.com/biomejs/biome/pull/6716) [`ead03d1`](https://github.com/biomejs/biome/commit/ead03d1089dd2e7a11a926008fd2b66b12e1f36c) Thanks [@siketyan](https://github.com/siketyan)! - The Biome LSP server no longer responds with an error for a `textDocument/codeActions` request when Biome doesn’t support a feature for the file (e.g. Code actions aren’t supported in GritQL files).

[#6679](https://github.com/biomejs/biome/pull/6679) [`7bf9a60`](https://github.com/biomejs/biome/commit/7bf9a608e1592fd595f658f5f800e12d51835d34) Thanks [@marko-hologram](https://github.com/marko-hologram)! - Fixed [#6638](https://github.com/biomejs/biome/issues/6638): JavaScript formatter `overrides` options now correctly override `expand` option. JSON formatter `overrides` options now correctly override `bracketSpacing` and `expand` options.

[#6717](https://github.com/biomejs/biome/pull/6717) [`7f5b541`](https://github.com/biomejs/biome/commit/7f5b5410613c5f1e0b26fdca5fa7c67b70f1fdb9) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#6688](https://github.com/biomejs/biome/issues/6688): the `noUselessFragments` no longer reports `&#x3C;Fragment />` elements that includes HTML character entities.

[#6600](https://github.com/biomejs/biome/pull/6600) [`853e1b5`](https://github.com/biomejs/biome/commit/853e1b54c365c18d8065499797ba172596b614cb) Thanks [@daivinhtran](https://github.com/daivinhtran)! - Fixed [#4677](https://github.com/biomejs/biome/issues/4677): The `noUnusedImports` rule won’t produce diagnostics for types used in comments of static members anymore.

[#6662](https://github.com/biomejs/biome/pull/6662) [`3afc804`](https://github.com/biomejs/biome/commit/3afc8040e6fa3f60addb0ad06ea86babbdd712e9) Thanks [@arendjr](https://github.com/arendjr)! - If a nested configuration file is ignored by the root configuration, it will now actually be ignored.

Biome has an exception in place for configuration files so they cannot be ignored, because the configuration files are vital to Biome itself. But this exception was incorrectly applied to nested configurations as well. Now only the root configuration is exempt from being ignored.

[#6596](https://github.com/biomejs/biome/pull/6596) [`c0718ca`](https://github.com/biomejs/biome/commit/c0718ca610a655e675182ac6c0424301aa64c325) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6566](https://github.com/biomejs/biome/issues/6566): Biome no longer errors when using the option `--files-ignore-unknown=true` in `stdin` mode.

Biome has also become less strict when using `--stdin-file-path` in `stdin` mode. It will no longer error if the file path doesn’t contain an extension, but instead it will return the original content.

[#6562](https://github.com/biomejs/biome/pull/6562) [`153eda7`](https://github.com/biomejs/biome/commit/153eda75003d01e1b1c4c120b9516eee47e5692e) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Added the nursery rule [noMagicNumbers](https://github.com/biomejs/biome/issues/4333). The rule detects and reports the use of “magic numbers” — numeric literals that are used directly in code without being assigned to a named constant.

**Example**

```

1let total = price \* 1.23; // Magic number for tax rate will highlight 1.23 as magic number

```

[#6663](https://github.com/biomejs/biome/pull/6663) [`af78d6d`](https://github.com/biomejs/biome/commit/af78d6d00f61a118d6b178bc2238c63bd83a0299) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6656](https://github.com/biomejs/biome/issues/6656): Biome now correctly formats HTML void elements such as `&#x3C;meta>` when they contain a self-closing slash.

```

1\<meta foo="bar" />2\<meta foo="bar">

```

">

[#6732](https://github.com/biomejs/biome/pull/6732) [`31e4396`](https://github.com/biomejs/biome/commit/31e439674493da76e0ce213e5660be3d903efbef) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Resolved [#6281](https://github.com/biomejs/biome/issues/6281): Improved performance of handling `package.json` files in the scanner.

[#6625](https://github.com/biomejs/biome/pull/6625) [`19cb475`](https://github.com/biomejs/biome/commit/19cb4750a1181f1e5c6c58fa169a94e812f10d25) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6616](https://github.com/biomejs/biome/issues/6616): Fixed an issue with extending configurations that contained an explicit `root` field while the configuration in the project did not.

[#6650](https://github.com/biomejs/biome/pull/6650) [`19aab18`](https://github.com/biomejs/biome/commit/19aab181dc6405ff48a1010d0a82aa731fb588b3) Thanks [@sterliakov](https://github.com/sterliakov)! - Fixed [#6621](https://github.com/biomejs/biome/issues/6621): Improved handling of multiple adjacent line suppressions. Biome now handles such suppressions separately, tracking whether each one is used.

[#6700](https://github.com/biomejs/biome/pull/6700) [`cdd6e17`](https://github.com/biomejs/biome/commit/cdd6e179b0d90f27cfdd73da1e56157bf3dd9d73) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Fixed [#6680](https://github.com/biomejs/biome/issues/6680): Biome incorrectly formatted container-style queries by inserting misplaced spaces.

```

1\@container style (--responsive: true) {}2\@container style(--responsive: true) {}

```

[#6709](https://github.com/biomejs/biome/pull/6709) [`ecf3954`](https://github.com/biomejs/biome/commit/ecf39549cd7c72c1811ba4dda6051e8622a19cf2) Thanks [@dyc3](https://github.com/dyc3)! - Fixed [#6038](https://github.com/biomejs/biome/issues/6038): Fixed a false positive in `noShadow` where a function parameter in a type definition was erroneously flagged as a violation.

[#6593](https://github.com/biomejs/biome/pull/6593) [`a4acbb7`](https://github.com/biomejs/biome/commit/a4acbb7d02eab2b1d1d7de5ff67c131b92388540) Thanks [@arendjr](https://github.com/arendjr)! - Type inference is now able to handle ternary conditions in expressions.

**Examples**

```

1const condition = Math.random() > -1; // Always true, but dynamic to linter2
3// We now detect that this may return a `Promise`.4condition ? Promise.reject("ternary bypass") : null;5
6// On the other hand, we know the following is never a `Promise`:7const alwaysFalsy = 0;8alwaysFalsy ? Promise.reject("ternary bypass") : null;

```

 -1; // Always true, but dynamic to linter// We now detect that this may return a &#x60;Promise&#x60;.condition ? Promise.reject(&#x22;ternary bypass&#x22;) : null;// On the other hand, we know the following is never a &#x60;Promise&#x60;:const alwaysFalsy = 0;alwaysFalsy ? Promise.reject(&#x22;ternary bypass&#x22;) : null;">

[#6428](https://github.com/biomejs/biome/pull/6428) [`4b501d3`](https://github.com/biomejs/biome/commit/4b501d3ac6214fd1331548260ccaf9db83e18de4) Thanks [@siketyan](https://github.com/siketyan)! - Added `MemoryFileSystem` to the WASM API.

You can now insert a file from your JS code:

```

1import { MemoryFileSystem, Workspace } from "@biomejs/wasm-web";2
3const fs = new MemoryFileSystem();4const workspace = Workspace.withFileSystem(fs);5
6fs.insert("/index.js", new TextEncoder().encode("let foo = 1;"));7fs.remove("/index.js");

```

[#6594](https://github.com/biomejs/biome/pull/6594) [`626d4a1`](https://github.com/biomejs/biome/commit/626d4a1462794dbd67e2f503812f62c6d40b3aa6) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6528](https://github.com/biomejs/biome/issues/6528): Biome didn’t return the correct output when applying `source.fixAll.biome` inside Astro/Vue/Svelte files that contained safe fixed.

  ##  [2.0.6](/internals/changelog/version/2-0-6/)

   ### Patch Changes

[#6557](https://github.com/biomejs/biome/pull/6557) [`fd68458`](https://github.com/biomejs/biome/commit/fd68458f40767cb1aeb9eb444a03c5dd6f3f7c0d) Thanks [@ematipico](https://github.com/ematipico)! - Fixed a bug where Biome didn’t provide all the available code actions when requested by the editor.

[#6511](https://github.com/biomejs/biome/pull/6511) [`72623fa`](https://github.com/biomejs/biome/commit/72623fa30470bbb97bae24514233d4d8a39507ec) Thanks [@Conaclos](https://github.com/Conaclos)! - Fixed [#6492](https://github.com/biomejs/biome/issues/6492). The
`organizeImports` assist action no longer duplicates a comment at the start of
the file when `:BLANK_LINE:` precedes the first import group.

[#6557](https://github.com/biomejs/biome/pull/6557) [`fd68458`](https://github.com/biomejs/biome/commit/fd68458f40767cb1aeb9eb444a03c5dd6f3f7c0d) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6287](https://github.com/biomejs/biome/issues/6287) where Biome Language Server didn’t adhere to the `settings.requireConfiguration` option when pulling diagnostics and code actions.
Note that for this configuration be correctly applied, your editor must support dynamic registration capabilities.

[#6551](https://github.com/biomejs/biome/pull/6551) [`0b63b1d`](https://github.com/biomejs/biome/commit/0b63b1d95c32ba61b2dcda4195d860397de3b589) Thanks [@Conaclos](https://github.com/Conaclos)! - Fixed [#6536](https://github.com/biomejs/biome/issues/6536). `useSortedKeys` no longer panics in some edge cases where object spreads are involved.

[#6503](https://github.com/biomejs/biome/pull/6503) [`9a8fe0f`](https://github.com/biomejs/biome/commit/9a8fe0f9313b2df93df56b3446340cc04a0e1958) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6482](https://github.com/biomejs/biome/issues/6482) where nursery rules that belonged to a domain were incorrectly enabled.

[#6565](https://github.com/biomejs/biome/pull/6565) [`e85761c`](https://github.com/biomejs/biome/commit/e85761c72058e2c039ff16707781f7e0aa19d2a9) Thanks [@daivinhtran](https://github.com/daivinhtran)! - Fixed [#4677](https://github.com/biomejs/biome/issues/4677): Now the `noUnusedImports` rule won’t produce diagnostics for types used in JSDoc comment of exports.

[#6166](https://github.com/biomejs/biome/pull/6166) [`b8cbd83`](https://github.com/biomejs/biome/commit/b8cbd839935fd0e672cb0fc2051df0e2fb9e5d1a) Thanks [@mehm8128](https://github.com/mehm8128)! - Added the nursery rule [noExcessiveLinesPerFunction](https://biomejs.dev/linter/rules/no-excessive-lines-per-function/).
This rule restrict a maximum number of lines of code in a function body.
The following code is now reported as invalid when the limit of maximum lines is set to 2:

```

1function foo() {2  const x = 0;3  const y = 1;4  const z = 2;5}

```

The following code is now reported as valid when the limit of maximum lines is set to 3:

```

1const bar = () => {2  const x = 0;3  const z = 2;4};

```

 {  const x = 0;  const z = 2;};">

[#6553](https://github.com/biomejs/biome/pull/6553) [`5f42630`](https://github.com/biomejs/biome/commit/5f42630f7b457070c7c1ad17cee28eae2e9951cc) Thanks [@denbezrukov](https://github.com/denbezrukov)! - Fixed [#6547](https://github.com/biomejs/biome/issues/6547). Now the Biome CSS parser correctly parses `@starting-style` when it’s used inside other at-rules. The following example doesn’t raise an error anymore:

```

1\@layer my-demo-layer {2  @starting-style {3    div.showing {4      background-color: red;5    }6  }7}

```

[#6458](https://github.com/biomejs/biome/pull/6458) [`05402e3`](https://github.com/biomejs/biome/commit/05402e395f6e356b690e1cad740294183fafeb84) Thanks [@ematipico](https://github.com/ematipico)! - Fixed an issue where the rule `useSemanticElements` used the incorrect range when positioning suppression comments.

[#6560](https://github.com/biomejs/biome/pull/6560) [`6d8a6b9`](https://github.com/biomejs/biome/commit/6d8a6b9a31788565455d6a6138ef6c1fe67421d5) Thanks [@siketyan](https://github.com/siketyan)! - Fixed [#6559](https://github.com/biomejs/biome/issues/6559): the error message on detected a large file was outdated and referred a removed configuration option `files.ignore`.

[#6458](https://github.com/biomejs/biome/pull/6458) [`05402e3`](https://github.com/biomejs/biome/commit/05402e395f6e356b690e1cad740294183fafeb84) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6384](https://github.com/biomejs/biome/issues/6384). The rule [`useAltText`](https://biomejs/dev/linter/rules/no-alt-text) now emits a diagnostic with a correct range, so suppression comments can work correctly.

[#6518](https://github.com/biomejs/biome/pull/6518) [`7a56288`](https://github.com/biomejs/biome/commit/7a56288e0c7f366d6aa30100432227f3501afb61) Thanks [@wojtekmaj](https://github.com/wojtekmaj)! - Fixed #6508, where the rule `noUselessFragments` incorrectly flagged Fragments containing HTML entities as unnecessary.

[#6517](https://github.com/biomejs/biome/pull/6517) [`c5217cf`](https://github.com/biomejs/biome/commit/c5217cfb21653add3d3add930102bea8fb7b5833) Thanks [@arendjr](https://github.com/arendjr)! - Fixed [#6515](https://github.com/biomejs/biome/issues/6515). When using the
`extends` field to extend a configuration from an NPM package, we now accept the
*condition names* `"biome"` and `"default"` for exporting the configuration in
the `package.json`.
This means that where previously your `package.json` had to contain an export
declaration similar to this:
```

1{2  "exports": {3    ".": "./biome.json"4  }5}

```

You may now use one of these as well:

```

1{2  "exports": {3    ".": {4      "biome": "./biome.json"5    }6  }7}

```

Or:

```

1{2  "exports": {3    ".": {4      "default": "./biome.json"5    }6  }7}

```

[#6219](https://github.com/biomejs/biome/pull/6219) [`a3a3715`](https://github.com/biomejs/biome/commit/a3a371552a84eaaf24ce1bd8e63e3c1243b285a9) Thanks [@huangtiandi1999](https://github.com/huangtiandi1999)! - Added new nursery rule [`noUnassignedVariables`](https://biomejs.dev/linter/rules/no-unassigned-variables/), which disallows `let` or `var` variables that are read but never assigned.

The following code is now reported as invalid:

```

1let x;2if (x) {3  console.log(1);4}

```

The following code is now reported as valid:

```

1let x = 1;2if (x) {3  console.log(1);4}

```

[#6395](https://github.com/biomejs/biome/pull/6395) [`f62e748`](https://github.com/biomejs/biome/commit/f62e7481c2a94271869651d2b32bde5d54adbc73) Thanks [@mdevils](https://github.com/mdevils)! - Added the new nursery rule [`noImplicitCoercion`](https://biomejs.dev/linter/rules/no-implicit-coercion), which disallows shorthand type conversions in favor of explicit type conversion functions.

**Example (Invalid): Boolean conversion using double negation:**

```

1!!foo;2!!(foo + bar);

```

**Example (Invalid): Number conversion using unary operators:**

```

1+foo;2-(-foo);3foo - 0;4foo \* 1;5foo / 1;

```

**Example (Invalid): String conversion using concatenation:**

```

1"" + foo;2foo + "";3\`\` + foo;4foo += "";

```

**Example (Invalid): Index checking using bitwise NOT:**

```

1~~foo.indexOf(1);2~~foo.bar.indexOf(2);

```

**Example (Valid): Using explicit type conversion functions:**

```

1Boolean(foo);2Number(foo);3String(foo);4foo.indexOf(1) !== -1;

```

[#6544](https://github.com/biomejs/biome/pull/6544) [`f28b075`](https://github.com/biomejs/biome/commit/f28b075b4fd28e49f18ae131878f67ce9a831c5a) Thanks [@daivinhtran](https://github.com/daivinhtran)! - Fixed [#6536](https://github.com/biomejs/biome/issues/6530). Now the rule `noUselessFragments` produces diagnostics for a top-level useless fragment that is in a return statement.

[#6320](https://github.com/biomejs/biome/pull/6320) [`5705f1a`](https://github.com/biomejs/biome/commit/5705f1aa9e41bfaea53edf255a18167b52a5fd9b) Thanks [@mdevils](https://github.com/mdevils)! - Added the new nursery rule [`useUnifiedTypeSignature`](https://biomejs.dev/linter/rules/use-unified-type-signature), which disallows overload signatures that can be unified into a single signature.

Overload signatures that can be merged into a single signature are redundant and should be avoided. This rule helps simplify function signatures by combining overloads by making parameters optional and/or using type unions.

**Example (Invalid): Overload signatures that can be unified:**

```

1function f(a: number): void;2function f(a: string): void;

```
```

1interface I {2  a(): void;3  a(x: number): void;4}

```

**Example (Valid): Unified signatures:**

```

1function f(a: number | string): void {}

```
```

1interface I {2  a(x?: number): void;3}

```

**Example (Valid): Different return types cannot be merged:**

```

1interface I {2  f(): void;3  f(x: number): number;4}

```

[#6545](https://github.com/biomejs/biome/pull/6545) [`2782175`](https://github.com/biomejs/biome/commit/2782175c445d4e5f979497ea76beda0276783909) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6529](https://github.com/biomejs/biome/issues/6529), where the Biome Language Server would emit an error when the user would open a file that isn’t part of its workspace (`node_modules` or external files).
Now the language server doesn’t emit any errors and it exits gracefully.

[#6524](https://github.com/biomejs/biome/pull/6524) [`a27b825`](https://github.com/biomejs/biome/commit/a27b8253b2f0d5e5618e9b26eebaaa5da55ed69a) Thanks [@vladimir-ivanov](https://github.com/vladimir-ivanov)! - Fixed [#6500](https://github.com/biomejs/biome/issues/6500): The `useReadonlyClassProperties` rule now correctly marks class properties as `readonly` when they are assigned in a constructor, setter or method,
even if the assignment occurs inside an if or else block.
The following code is now correctly detected by the rule:

```

1class Price {2  #price: string;3
4  @Input()5  set some(value: string | number) {6    if (7      value === undefined ||8      value === null ||9      value === "undefined" ||10      value === "null" ||11      Number.isNaN(value)12    ) {13      this.#price = "";14    } else {15      this.#price = "" + value;16    }17  }18}

```

[#6355](https://github.com/biomejs/biome/pull/6355) [`e128ea9`](https://github.com/biomejs/biome/commit/e128ea9eb44bcf5558ab6b08214884d1c087686d) Thanks [@anthonyshew](https://github.com/anthonyshew)! - Added a new nursery rule `noAlert` that disallows the use of `alert`, `confirm` and `prompt`.

The following code is deemed incorrect:

```

1alert("here!");

```

[#6548](https://github.com/biomejs/biome/pull/6548) [`37e9799`](https://github.com/biomejs/biome/commit/37e979978b406c3e132fd5093bfb21e811c93d2d) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6459](https://github.com/biomejs/biome/issues/6459), where the Biome LSP was not taking into account the correct settings when applying `source.fixAll.biome` code action.

  ##  [2.0.5](/internals/changelog/version/2-0-5/)

   ### Patch Changes

[#6461](https://github.com/biomejs/biome/pull/6461) [`38862e6`](https://github.com/biomejs/biome/commit/38862e645c07935f2daf52799dce38656d589d40) Thanks [@ematipico](https://github.com/ematipico)! - Fixed [#6419](https://github.com/biomejs/biome/issues/6419), a regression where stdin mode would create a temporary new file instead of using the one provided by the user. This was an intended regression.

Now Biome will use the file path passed via `--std-file-path`, and apply the configuration that matches it.

[#6480](https://github.com/biomejs/biome/pull/6480) [`050047f`](https://github.com/biomejs/biome/commit/050047f4a3c1379abcf3cf57f1bfecd20bb7d8c1) Thanks [@Conaclos](https://github.com/Conaclos)! - Fixed [#6371](https://github.com/biomejs/biome/issues/6371).
[useNamingConvention](https://biomejs.dev/linter/rules/use-naming-convention/) now checks the string case of objects’ property shorthand.

[#6477](https://github.com/biomejs/biome/pull/6477) [`b98379d`](https://github.com/biomejs/biome/commit/b98379d42d97540c3bd911263a0af1eb7bc4803e) Thanks [@ematipico](https://github.com/ematipico)! - Fixed an issue where Biome formatter didn’t format consistently CSS value separated by commas.

```

1.font-heading {2 font-feature-settings: var(--heading-salt), var(--heading-ss06),3   var(--heading-ss11), var(--heading-cv09), var(--heading-liga),4   var(--heading-calt);5
6  font-feature-settings:7    var(--heading-salt), var(--heading-ss06), var(--heading-ss11),8    var(--heading-cv09), var(--heading-liga), var(--heading-calt);9}

```

[#6248](https://github.com/biomejs/biome/pull/6248) [`ec7126c`](https://github.com/biomejs/biome/commit/ec7126ca3d6777344191f3463b430a44fce02489) Thanks [@fireairforce](https://github.com/fireairforce)! - Fixed grit pattern matching for different kinds of import statements.

The grit pattern `import $imports from "foo"` will match the following code:

```

1import bar from "foo";2import { bar } from "foo";3import { bar, baz } from "foo";

```

  ##  [2.0.4](/internals/changelog/version/2-0-4/)

   ### Patch Changes

- [#6450](https://github.com/biomejs/biome/pull/6450) [`7472d9e`](https://github.com/biomejs/biome/commit/7472d9e07fd6e8afab385276678f3d39c7497bab) Thanks [@ematipico](https://github.com/ematipico)! - Fixed an issue where the binary wasn’t correctly mapped.

      Copyright (c) 2023-present Biome Developers and Contributors.
```
