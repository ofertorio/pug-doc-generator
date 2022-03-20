import glob from "glob";
import { writeFileSync, mkdirSync } from "fs";

import DocParser, { PugDocAst } from "./core/DocParser";
import MarkdownDocWriter from "./core/writers/MarkdownDocWriter";
export interface PugDocsOptions {
    /**
     * The pug source file list or / glob
     */
    input: string|string[],

    /**
     * The documentation output directory
     */
    output: string
}

export default (options: PugDocsOptions) => {
    /**
     * Prepare the AST data
     */
    const ast: PugDocAst = {
        nodes: []
    };

    let files: string[];

    if (Array.isArray(options.input)) {
        files = options.input;
    } else {
        files = glob.sync(options.input);
    }

    // Parse all files into the AST
    for(let file of files) {
        const parser = new DocParser(file);
        ast.nodes.push(...parser.parse());
    }

    // Create the output directory
    mkdirSync(options.output, { recursive: true });

    // Write the AST to it
    writeFileSync(options.output + "/ast.json", JSON.stringify(ast, null, "\t"));

    // Write the mardown version to it
    new MarkdownDocWriter(ast).writeToFile(options.output + "/index.md");

    return true;
}

module.exports = exports.default;