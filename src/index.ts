import glob from "glob";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

import getCodeBlock from "pug-code-block";

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

interface MixinParam {
    name?: string,
    type?: string,
    description?: string
}

interface Mixin {
    name?: string,
    description?: string,
    params?: MixinParam[]
}

const DOC_REGEX = /^\s*\/\/-\s+?\@pugdoc\s*$/;

export default (options: PugDocsOptions) => {
    const finalDocs: {
        mixins: Mixin[]
    } = {
        mixins: []
    };

    let files: string[];

    if (Array.isArray(options.input)) {
        files = options.input;
    } else {
        files = glob.sync(options.input);
    }

    for(let file of files) {
        const contents = readFileSync(file, "utf8");
        const lines = contents.replace(/\r/g, "").split("\n");

        // Iterate over all lines
        lines.forEach((line, lineIndex) => {
            // Check if it's a pugdoc comment
            if (!line.match(DOC_REGEX)) {
                return;
            }

            // Retrieve the entire comment and the next block
            const captures: string[] = getCodeBlock.byLine(contents, lineIndex + 1, 2);
            const [comment, nextBlock] = captures;

            const blockType = nextBlock.split(" ")[0];
            let blockName = null;

            switch(blockType) {
                case "mixin":
                    blockName = nextBlock.split(" ")[1].split(/(\(| )/)[0]
                break;
            }

            /**
             * Startup the variable that will receive the mixin
             */
            const mixin: Mixin = {
                name: blockName.split("(")[0],
                description: "",
                params: []
            };

            const commentLines = comment
                // Split the lines
                .split("\n")
                // Ignore the first one (@pugdoc)
                .splice(1)
                    // Trim the comment contents and append "*" to the start
                    .map((c) => c.trim());

            // Parse the comment lines
            for(let commentLine = 0; commentLine < commentLines.length; commentLine++) {
                let lineContents = commentLines[commentLine];

                // If it's declaring a param
                if (lineContents.startsWith("@param")) {
                    let param: MixinParam = {
                        name: null,
                        description: "",
                        type: ""
                    };
                    
                    let paramContents = "";
                    let character = lineContents.match(/\@param\s+{/)[0].length;
                    let skipping = 0;
                    let char;

                    while(true) {
                        // If has surpassed the current line
                        if (character >= lineContents.length) {
                            // Go to the next line then
                            commentLine++;

                            // If surpassed the line limit
                            if (commentLine > commentLines.length) {
                                throw new Error("Unable to parse parameter");
                            }

                            // Read the next line contents
                            lineContents = commentLines[commentLine];

                            // Reset the character
                            character = 0;

                            // Add a line to the param contents
                            paramContents += "\n" + "\t".repeat(skipping);
                        }

                        // Read the next character
                        char = lineContents[character++];

                        // If it's a opening bracket
                        if (char === "{") {
                            // Increase the number of skipping brackets
                            skipping++;
                        } else
                        // If it's a closing bracket
                        if (char === "}") {
                            if (skipping > 0) {
                                skipping--;
                            } else {
                                // Cancel the last line identation if any
                                paramContents = paramContents.replace(/\t+(.+?)$/, "$1");
                                break;
                            }
                        }

                        paramContents += char;
                    }

                    const rest = lineContents.substring(character).trim().split(" ");

                    param.name = rest.shift();
                    param.type = paramContents;
                    param.description = rest.join(" ");

                    mixin.params.push(param);
                } else {
                    // Read it as the description
                    mixin.description += lineContents;
                }
            }

            finalDocs.mixins.push(mixin);
        });
    }

    let finalDoc = "";

    finalDoc += "## Mixins";
    finalDoc += "\n\n";
    
    finalDoc += finalDocs.mixins.map((mixin) => {
        let doc = `- **${mixin.name}**\n    ${mixin.description}\n`;
            doc += "    - Parameters\n";

            for(let param of mixin.params) {
                doc += `        - ${param.name}`;

                if (param.type.includes("\n")) {
                    doc += "\n";
                    doc += "            ```typescript\n";
                    doc += `            ${param.type.split("\n").join("\n            ")}\n`;
                    doc += "            ```\n";
                    doc += `            ${param.description}\n`;
                } else {
                    doc += " `" + param.type + "` ";
                    doc += `${param.description}\n`;
                }
            }

        return doc + "\n";
    }).join("\n");

    mkdirSync(options.output, { recursive: true });
    writeFileSync(options.output + "/index.json", JSON.stringify(finalDocs, null, "\t"));
    writeFileSync(options.output + "/index.md", finalDoc);

    return true;
}

module.exports = exports.default;