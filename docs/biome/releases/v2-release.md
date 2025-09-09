# V2 RELEASE

*Source: <https://biomejs.dev/blog/biome-v2/>*

***

# Biome v2—codename: Biotype

```
          Jun 17, 2025     - 12 min read     [ Emanuele Stoppa   ](https://bsky.app/profile/ematipico.xyz)  Biome Core Team, Biome Maintainers          We are happy to announce that Biome v2 is officially out! 🍾 Biome v2—codename: Biotype, the *first* JavaScript and TypeScript linter that provides
```

**type-aware linting rules that doesn’t rely on the TypeScript compiler**! This means that you can lint your project
without necessarily installing the `typescript` package.
With this release, the [Core Contributors of the project](/internals/people-and-credits#core-contributors) want to show
to the whole community and web ecosystem that Biome is here to stay and deserves to earn its place as the next-generation toolchain for the web.
No other tools have achieved this great milestone in such a short amount of time ([two years](/blog/announcing-biome)) and resources. This has been possible
thanks to the companies and people who believed in the project, with a special shoutout to [Vercel](https://vercel.com/) for sponsoring the type inference work.
Preliminary testing shows that our [`noFloatingPromises` rule](/linter/rules/no-floating-promises/), which is based on our new type inference work, can detect floating promises in about 75% of the cases that would be detected by using `typescript-eslint`, at a fraction of the performance impact. And needless to say, we have plenty of ideas on how to improve this metric even further.

Keep in mind that your mileage may vary, as these early numbers are based on a limited set of use cases. Nevertheless, we look forward to people trying it out and reporting their experiences so that we can quickly reach a level of confidence that would be sufficient for most projects.

## Installation and migration

[Section titled “Installation and migration”](#installation-and-migration)
Install or update the `@biomejs/biome` package. If you upgrade the package, run the `migrate` command.

Terminal window\`\`\`
1npm install --save-dev --save-exact @biomejs/biome2npx @biomejs/biome migrate --write

````

The `migrate` command will take care of all the breaking changes of the configuration, so you don’t have to. However, there are
some other changes that we couldn’t automate. We created a [migration guide](/guides/upgrade-to-biome-v2) that explains them,
together with manual migration paths, if applicable. Please get accustomed to the changes, as some of them fundamentally
change some of the core functionalities of Biome (for the better!).
## Relevant features

[Section titled “Relevant features”](#relevant-features)
Biome is packed with new features, some big and some small. We will focus on the ones that we believe are worth
mentioning. For a complete list of the new features, refer to the [web version of the changelog](/internals/changelog).
### Multi-file analysis and type inference

[Section titled “Multi-file analysis and type inference”](#multi-file-analysis-and-type-inference)
These two features are closely related. You can’t create a type inference engine without the ability to query types imported from
other modules.
Before version 2.0, Biome lint rules could only operate on one file at a time. This brought us far, but many of the more interesting rules require information from other files too.

To accomplish this, we have added a *file scanner* to Biome that scans all the files in your project and indexes them, similar to what an LSP service might do in your IDE.

A file scanner comes with its baggage: slowness. We acknowledge that many users choose Biome for its speed. During the beta period, users raised some concerns about how this could affect their workflow.

As for this release, the file scanner has the following characteristics:

- It’s **opt-in**; which means migrating from v1 to v2 won’t significantly affect the performance of formatting and linting your projects.

- By default, the scanner is only used for discovering nested configuration files. This should be very fast, although a slight increase compared to v1 may be experienced.

- A **full scan** (which scans all your project files **and** `node_modules`) is performed *only* when [project rules](/linter/domains#project) are enabled.

- Users can control the scanned files using `files.includes`, with the exception of `node_modules`.

- Lint rules that need to collect types or query the module graph **will never be recommended** outside the [`project` domain](/linter/domains/#project). We put speed and performance first, and users have control over the rules.

### Monorepo Support

[Section titled “Monorepo Support”](#monorepo-support)
We’ve significantly improved our support for monorepos. This means that lint rules that rely on information from `package.json` files will now use the `package.json` from the right package. But perhaps more importantly: **We now support nested configuration files.**

Every project should still have a single `biome.json` or `biome.jsonc` at its root, similar to Biome v1. But projects are allowed to have any number of nested `biome.json`/`biome.jsonc` files in subdirectories. Nested configuration files must be explicitly marked as such, in one of two ways.

The first looks like this:

biome.jsonc```
1{2    "root": false,3    // ...4}
````

By setting the `root` field to `false`, you tell Biome this is a nested file. This is important, because if you run Biome inside the nested folder, it will know that the configuration is part of a bigger project and continue looking for the root configuration as well.

It is important to stress that the settings within the nested folder **do not** inherit from the root settings by default. Rather, we still want you to use the [`extends` field](https://biomejs.dev/guides/big-projects/#share-the-configuration) that already existed in Biome v1 if you want to extend from another configuration.

Which brings us to the second way a nested configuration can be defined:

biome.jsonc\`\`\`
1{2    "extends": "//",3    // ...4}

```

This is a convenient micro-syntax that sets both the `root` field to `false`, and will tell Biome that this nested configuration extends from the root configuration.

Say goodbye to wonky relative paths such as `"extends": ["../../biome.json"]` 👋

We prepared a [small guide](/guides/big-projects#monorepo) that should help you set everything up.

### Plugins

[Section titled “Plugins”](#plugins)
Biome 2.0 comes with our first iteration of [Linter Plugins](/linter/plugins).

These plugins are still limited in scope: They only allow you to match code snippets and report diagnostics on them.

Here is an example of a plugin that reports on all usages of `Object.assign()`:

```

1`$fn($args)` where {2    $fn <: `Object.assign`,3    register\_diagnostic(4        span = $fn,5        message = "Prefer object spread instead of `Object.assign()`"6    )7}

````

It’s a first step, but we have plenty of ideas for making them more powerful, and we’re eager to hear from our users about what they would like to see prioritised.

As for now, we intentionally left out the distribution method of plugin for different reasons. However, we would like to hear from you. Please [join the discussion](https://github.com/biomejs/biome/discussions/6265) and share your ideas with us.

### Import Organizer Revamp

[Section titled “Import Organizer Revamp”](#import-organizer-revamp)
In Biome 1.x, our Import Organizer had several limitations:

Groups of imports separated by a blank line were considered separate *chunks*, meaning they were sorted independently. This meant the following **didn’t work** as expected:

example.js```
1import { lib2 } from "library2";2
3import { util } from "./utils.js";4import { lib1 } from "library1";
````

It would correctly sort `"library1"` to be placed above `"./utils.js"`, but it wouldn’t be able to
carry it over the blank line to the top. This is what we got:
organizer\_v1.js\`\`\`
1import { lib2 } from "library2";2
3import { lib1 } from "library1";4import { util } from "./utils.js";

````

But instead, what we really wanted was this:

organizer_v2.js```
1import { lib1 } from "library1";2import { lib2 } from "library2";3
4import { util } from "./utils.js";
````

Imports from the same module were not merged. Consider the following example:

example.js\`\`\`
1import { util1 } from "./utils.js";2import { util2 } from "./utils.js";

````

What we wanted was this:

organizer_v2.js```
1import { util1, util2 } from "./utils.js";
````

No custom ordering could be configured. Perhaps you didn’t really like the default approach of ordering by “distance” from the source that you’re importing from. Perhaps you wanted to organise the imports like this:

organizer\_v2.js\`\`\`
1import { open } from "node:fs";2
3import { internalLib1 } from "@company/library1";4import { internalLib2 } from "@company/library2";5
6import { lib1 } from "library1";

```

In Biome 2.0, all these limitations are lifted. In fact, if you look at the examples above, all snippets labeled `organizer_v2.js` can be produced just like that by our new import organizer.

Other improvements include support for organizing `export` statements, support for “detached” comments to explicitly separate import chunks if necessary, and import attribute sorting.

You can find more in the [documentation of the action](/assist/actions/organize-imports).

### Assists

[Section titled “Assists”](#assists)
The Import Organizer has always been a bit of a special case in Biome. It was neither part of the linter, nor of the formatter. This was because we didn’t want it to show diagnostics like the linter does, and its organizing features exceeded what we expect from the formatter.

In Biome 2.0, we have generalised such use cases in the form of Biome Assist. Assist provides **actions**, which are similar to the *fixes* in lint rules, but without the diagnostics.

The Import Organizer has become an assist, but we’ve started using this approach for new assists too: [`useSortedKeys`](https://biomejs.dev/assist/actions/use-sorted-keys/) can sort keys in object literals, while [`useSortedAttributes`](/assist/actions/use-sorted-attributes/) can sort attributes in JSX.

For more information about assists, see [the relative page](/assist/).

### Improved suppressions

[Section titled “Improved suppressions”](#improved-suppressions)
In addition to the `// biome-ignore` comments we already supported, we now support `// biome-ignore-all` for suppressing a lint rule or the formatter in an entire file.

We also added support for suppression ranges using `// biome-ignore-start` and `// biome-ignore-end`. Note that `// biome-ignore-end` is optional in case you want to let a range run until the end of the file.

For more information about suppressions, see [the relative page](/linter/#suppress-lint-rules).

### HTML formatter

[Section titled “HTML formatter”](#html-formatter)
After several months of hard work, we are pleased to announce that the HTML formatter is now ready for users to try out and report bugs! This is a huge step towards Biome fully supporting HTML-ish templating languages used in frameworks such as Vue and Svelte.

For now, the HTML formatter only touches actual `.html` files, so it doesn’t format HTML in `.vue` or `.svelte` files yet. It also won’t format embedded languages like JavaScript or CSS yet. HTML’s options like `attributePosition`, `bracketSameLine`, and `whitespaceSensitivity` have been implemented.

The HTML formatter is still in the experimental stage, so it will remain **disabled by default for the full 2.0 release**. At the time of writing, Biome can parse most of the Prettier’s HTML test suite, and format 46/124 of them correctly. Despite not matching Prettier yet, we’re pretty confident that it *should* output adequately formatted documents without destroying anything. If you find a case where it doesn’t, [please let us know](https://github.com/biomejs/biome/issues)!

You can enable the HTML formatter by adding the following to your config file:

```

1{2  "html": {3    "formatter": {4      "enabled": true5    }6  }7}

```

## Shout-outs

[Section titled “Shout-outs”](#shout-outs)
And now, let’s give credits where credits are due!

Special thanks to Vercel, our platinum sponsor, [for sponsoring the type inference work](/blog/vercel-partners-biome-type-inference), led by  Core Contributor [  @arendjr ](https://github.com/arendjr)  .

[](https://vercel.com)
Special thanks to Depot, our gold sponsor, for providing the project with powerful and fast CI runners. A huge **time saver** and **reliability** booster!

[](https://depot.dev)
Congratulations to  Core Contributor [  @siketyan ](https://github.com/siketyan)  , who recently became a Core Contributor of the project! Thanks to their contributions,
the [JetBrains extension](https://plugins.jetbrains.com/plugin/22761-biome) is now stable and supports multiple workspaces.
Thanks to  Core Contributor [  @conaclos ](https://github.com/conaclos)   for their massive work in implementing many features such as the Import Organizer revamping,
the new glob engine, many new linting rules.
Thanks to  Core Contributor [  @arendjr ](https://github.com/arendjr)   for creating the multi-file architecture, the continuous work on the type inference, plugins, and miscellaneous improvements.

Props to  Core Contributor [  @nhedger ](https://github.com/nhedger)   for authoring the [GitHub Action](https://github.com/biomejs/setup-biome), and [shipping](https://biomejs.dev/blog/2025-05-29-biome-vscode-v3/) the new version of the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome).

Thanks to  Core Contributor [  @dyc3 ](https://github.com/dyc3)   for leading the work on the HTML parser and formatter. They are both very complex pieces of software, especially when it comes to matching Prettier’s formatting experience.

Last but not least, a great thanks to all our other [sponsors](https://github.com/biomejs/biome#sponsors) and [contributors](/internals/people-and-credits#contributors) as well!

## What’s next

[Section titled “What’s next”](#whats-next)
No software is exempt from bugs, so we will ensure that we squash them and release patches.

The [Core Contributors](/internals/people-and-credits#core-contributors) will focus on moving forward the [Roadmap for 2025](/blog/roadmap-2025#-2025-roadmap), and focus on the following features:

- Make HTML support stable.

- Expand HTML to support other frameworks such as Vue, Svelte, and Astro.

- Work on Markdown support, starting from the parser.

- Continue working on the inference infrastructure, so we can cover more cases and add new rules.

- and more!

### I like where this is going, how can I help?

[Section titled “I like where this is going, how can I help?”](#i-like-where-this-is-going-how-can-i-help)
I want to remind you that Biome is a project led by volunteers who like programming, open-source, and embrace the Biome philosophy, so any help is welcome 😁

#### Translations

[Section titled “Translations”](#translations)
If you are familiar with Biome and would like to contribute to its outreach, you can assist us by translating the website into your native language. In this [dashboard](https://biomejs.dev/i18n-dashboard/), you can check the supported languages and if they are up to date.

#### Chat with us

[Section titled “Chat with us”](#chat-with-us)
Join our [Discord server](https://biomejs.dev/chat), and engage with the community. Chatting with the community and being part of the community is a form of contribution.

#### Code contributions

[Section titled “Code contributions”](#code-contributions)
If you like the technical aspects of the project, and you want to make your way into the Rust language, or practice your knowledge around parsers, compilers, analysers, etc., Biome is the project that does for you!

There are numerous aspects to explore; I assure you that you won’t get bored. Here is a small list of the things you can start with:

- Create new lint rules! We have so many rules that we haven’t implemented yet (ESLint, ESLint plugins, Next.js, Solid, etc.). We have a very [extensive technical guide](https://github.com/biomejs/biome/blob/main/crates/biome_analyze/CONTRIBUTING.md).

[Help](https://github.com/biomejs/biome/blob/main/crates/biome_parser/CONTRIBUTING.md) [building](https://github.com/biomejs/biome/tree/main/crates/biome_yaml_parser) [Biome](https://github.com/biomejs/biome/tree/main/crates/biome_html_parser) [parsers](https://github.com/biomejs/biome/tree/main/crates/biome_markdown_parser)!
One interesting fact about Biome parsers is that they are recoverable parsers [error resilient](/internals/architecture/#parser-and-cst) which emit a [CST](https://en.wikipedia.org/wiki/Parse_tree) instead of a classic AST.
- Implement new capabilities in our [LSP (Language Server Protocol)](https://github.com/biomejs/biome/tree/main/crates/biome_lsp), or add new features in one of our editor extensions: [VS Code](https://github.com/biomejs/biome-vscode), [Zed](https://github.com/biomejs/biome-zed) and [JetBrains IntelliJ](https://github.com/biomejs/biome-intellij).

#### Financial help

[Section titled “Financial help”](#financial-help)
If you believe in the future of the project, you can also help with a financial contribution, via [Open Collective](https://opencollective.com/biome) or [GitHub Sponsors](https://github.com/sponsors/biomejs).

Additionally, the project provides an [enterprise support program ](/enterprise) where a company you can employ one of the core contributors to work a specific aspect of the Biome toolchain.

      [ Biome v2.1 ](/blog/biome-v2-1/)       [ VS Code extension V3 ](/blog/2025-05-29-biome-vscode-v3/)             Copyright (c) 2023-present Biome Developers and Contributors.
```
