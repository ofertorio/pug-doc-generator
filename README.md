# pug-doc-generator
Generates documentation files for pug.js mixins, blocks and more.

### Usage
First of all, install it using your favorite package manager.
```bash
yarn install pug-doc-generator
```

```bash
npm i pug-doc-generator
```

Then, you can integrate it in you project:

```javascript
const pugDocGen = require("pug-doc-generator");
pugDocGen({
    input: "./src/**/*.pug",
    output: "./out"
});
```

You can also run it via command line:

```bash
pug-doc-generator --input ./src/**/*.pug --output ./out
```