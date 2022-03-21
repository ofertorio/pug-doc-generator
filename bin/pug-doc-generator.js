const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const args = yargs(hideBin(process.argv))
    .option("input", {
        alias: "i",
        type: "string",
        description: "Sets the input path directory or glob pattern.",
        default: "./**/*.pug"
    })
    .option("output", {
        alias: "o",
        type: "string",
        description: "Sets the output path directory.",
        default: "./docs"
    })
    .option("types", {
        type: "string",
        alias: "t",
        choices: ["all", "html", "markdown"],
        description: "A comma separated list contaning the documentation output types that will be generated.",
        default: "all"
    })
    .option("outputName", {
        type: "string",
        alias: "on",
        description: "Sets the name of the output files (without extension).",
        default: "index"
    })
    .option("title", {
        type: "string",
        description: "Sets the documentation title.",
        default: "Documentation"   
    })
    .help("help")
    .alias("help", "h")
    .epilogue("Made with ♥ by Matheus Giovani.")
    .strictCommands()
    .argv;

const compiler = require("../");
compiler(args);