import glob from "glob";
import { writeFileSync, mkdirSync, existsSync, rmdirSync } from "fs";
import path from "path";

import DocParser, { PugDocAst } from "./core/DocParser";
import MarkdownDocWriter from "./core/writers/MarkdownDocWriter";
import HTMLDocWriter from "./core/writers/HTMLDocWriter";
import { PugDocsOptions } from "./types/Configuration";

/**
 * The default compiler options
 */
const defaultOptions: PugDocsOptions = {
    input: null,
    output: null,
    outputName: "index",
    types: "all",
    formatting: {
        html: {
            theme: "cosmo"
        }
    }
};

export = (options: PugDocsOptions = defaultOptions) => {
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

    // If no title has been set
    if (!options?.formatting?.title) {
        options.formatting = options.formatting || {};
        options.formatting.title = "Documentation";
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
        new MarkdownDocWriter(ast, options)
            .writeToFile(
                path.resolve(options.output, options.outputName + ".md")
            );
    }

    if (options.types.includes("html")) {
        // Write the mardown version to it
        new HTMLDocWriter(ast, options)
            .writeToFile(
                path.resolve(options.output, options.outputName + ".html")
            );
    }

    return true;
}