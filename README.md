# pug-doc-generator
Generates documentation files for pug.js mixins, blocks and more.

### How to use
All mixins with comments starting with the `@pugdoc` markup will be documented.
The documentation follows the JSDoc / TSDoc standards.

At the moment, the following tags are supported:
- **@param**
    - Normal typed parameters
        ```typescript
        @param {string} paramName Parameter description
        ```

    - Interface params:
        ```typescript
        @param {{
            interfaceProperty: string
        }} interfaceParamName Interface parameter are also supported
        ```

### Configuration

First of all, install it using your favorite package manager.
```bash
yarn install pug-doc-generator
```

or

```bash
npm i pug-doc-generator
```

---

Then, you can integrate it in your project:

*src/index.pug*
```pug
//- @pugdoc
    This mixin will be documented
    @param {string} param A string parameter
mixin documented_mixin(param)
    ="Hello world!"
```

*index.js*
```javascript
const pugDocGen = require("pug-doc-generator");
pugDocGen({
    input: "./src/**/*.pug",
    output: "./out"
});
```

You can also run it via command line:

```bash
pug-doc-generator --input="./src/**/*.pug" --output="./out" --types="html"
```

or

```bash
yarn pug-doc-generator --input="./src/**/*.pug" --output="./out" --types="html"
```

For more information about command line parameters, run `pug-doc-generator --help`