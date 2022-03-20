import glob from "glob";
import { writeFileSync, mkdirSync, existsSync, rmdirSync } from "fs";
import path from "path";

import DocParser, { PugDocAst } from "./core/DocParser";
import MarkdownDocWriter from "./core/writers/MarkdownDocWriter";

export type DocumentationTypes = "markdown" | "html" | "ast";
export interface PugDocsOptions {
    /**
     * The pug source file list or / glob
     */
    input: string|string[],

    /**
     * The source directory relative to the input file list / glob.
     * It will be used to generate the source locations.
     * Defaults to the dirname of the input param.
     */
    sourceDir?: string,

    /**
     * The documentation output directory.
     */
    output: string,

    /**
     * If the output directory needs to be cleared before saving anything to it.
     */
    clearOutputDir?: boolean,

    /**
     * The documentation output filename without extension.
     * Defaults to "index"
     */
    outputName?: string,

    /**
     * Formatting options.
     */
    formatting?: {
        /**
         * The header to be included in the documentation file.
         */
        header?: string,

        /**
         * The footer to be included in the documentation file.
         */
        footer?: string
    },

    /**
     * The types of documentations to generate.
     * Defaults to "all".
     */
    types: DocumentationTypes[] | DocumentationTypes | "all"
}

/**
 * The default compiler options
 */
const defaultOptions: PugDocsOptions = {
    input: null,
    output: null,
    outputName: "index",
    types: "all"
};

export default (options: PugDocsOptions = defaultOptions) => {
    // Merge with the default options
    options = { ...defaultOptions, ...options };

    // If defaults to all
    if (options.types === "all") {
        options.types = ["ast", "html", "markdown"];
    } else
    // If it's not an array
    if (!Array.isArray(options.types)) {
        // Convert it to a single item array
        options.types = [options.types];
    }

    /**
     * Prepare the AST data
     */
    const ast: PugDocAst = {
        nodes: []
    };

    // The file list that will be parsed
    let files: string[];

    // If it's an array
    if (Array.isArray(options.input)) {
        // Defaults to it
        files = options.input;
    } else {
        // Assume it's a glob
        files = glob.sync(options.input);
    }

    // Parse all files into the AST
    for(let file of files) {
        const parser = new DocParser(file);
        ast.nodes.push(...parser.parse());
    }

    if (existsSync(options.output)) {
        // If can clear the output directory
        if (options.clearOutputDir) {
            // Clear it and create again
            rmdirSync(options.output, { recursive: true });
            mkdirSync(options.output, { recursive: true });
        }   
    } else {
        // Create the output directory
        mkdirSync(options.output, { recursive: true });
    }

    if (options.types.includes("ast")) {
        // Write the AST to it
        writeFileSync(path.resolve(options.output, options.outputName + ".json"), JSON.stringify(ast, null, "\t"));
    }

    if (options.types.includes("markdown")) {
        // Write the mardown version to it
        new MarkdownDocWriter(ast)
            .writeToFile(
                path.resolve(options.output, options.outputName + ".md")
            );
    }

    return true;
}

module.exports = exports.default;