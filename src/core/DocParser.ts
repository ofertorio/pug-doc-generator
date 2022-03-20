import getCodeBlock from "pug-code-block";
import docTree, { OutputComment } from "doc-tree";
import { readFileSync } from "fs";
import path from "path";

const DOC_REGEX = /^\s*\/\/-\s+?\@pugdoc\s*$/;

export interface PugDocAst {
    nodes: PugAstNodes[]
}

export interface PugAstNode {
    nodes?: PugAstNode[],
    location?: {
        line?: number,
        filename?: string
    }
}

export interface PugAstMixinNode extends PugAstNode, OutputComment {
    type: "MixinNode",
    name: string,
    description?: string
}

export interface PugAstBlockNode extends PugAstNode, OutputComment {
    type: "BlockNode"
}

export type PugAstNodes = PugAstMixinNode | PugAstBlockNode;

export default class DocParser {
    /**
     * The current line number
     */
    private lineNumber: number = 0;

    /**
     * The file contents
     */
    private fileContent: string = "";

    /**
     * All the file lines
     */
    private lines: string[] = [];

    /**
     * The current comment contents
     */
    private commentContents: string;

    constructor(
        private filename: string,
        private options: {
            /**
             * The source directory
             */
            sourceDir?: string
        } = {}
    ) {
        this.options.sourceDir = options.sourceDir || path.dirname(filename);
    }

    /**
     * Retrieves the source filename
     * @returns 
     */
    private getSourceFilename() {
        return path.relative(this.options.sourceDir, this.filename);
    }

    /**
     * Parses the current line
     * @returns 
     */
    private parseLine() {
        // Check if it's a pugdoc comment
        if (!this.lines[this.lineNumber].match(DOC_REGEX)) {
            return null;
        }

        const node: PugAstNodes = {
            type: null
        };

        // Retrieve the entire comment and the next block
        const captures: string[] = getCodeBlock.byLine(this.fileContent, this.lineNumber + 1, 2);
        const [comment, nextBlock] = captures;

        this.commentContents = comment;

        const blockType = nextBlock.split(" ")[0];

        switch(blockType) {
            case "mixin":
            case "block":                
                (node as unknown as PugAstMixinNode).name = nextBlock.split(" ")[1].split(/(\(| )/)[0];

            case "mixin":
                (node as unknown as PugAstMixinNode).type = "MixinNode";
            break;

            case "block":
                (node as PugAstBlockNode).type = "BlockNode";
            break;
        }

        // Increase the line number to the number of lines that the comment has
        this.lineNumber += comment.split("\n").length;

        return node;
    }

    private parseNodeComment(node: PugAstNodes) {
        const commentLines = this.commentContents
            // Split the lines
            .split("\n")
            // Ignore the first one (@pugdoc)
            .splice(1)
                // Trim the comment contents and append "*" to the start
                .map((c) => c.trim());

        const commentAsJsComment =  "/**" +
                                    commentLines.join("\n * ") +
                                    " */";

        // Retrieve only the first comment
        const parsedComment = docTree.parse(commentAsJsComment).output().shift().comment;

        // Set the mixin data
        node = { ...node, ...parsedComment };

        return node;
    }

    /**
     * Parses the file and returns a list of nodes
     */
    public parse(): PugAstNodes[] {
        const nodes: PugAstNodes[] = [];

        this.fileContent = readFileSync(this.filename, "utf8");
        this.lines = this.fileContent.replace(/\r/g, "").split("\n");

        let node: PugAstNodes;

        // Iterate over all lines
        for(this.lineNumber = 0; this.lineNumber < this.lines.length; this.lineNumber++) {
            const startingLine = this.lineNumber;

            node = this.parseLine();

            if (node === null) {
                continue;
            }

            node = this.parseNodeComment(node);

            node.location = {
                line: startingLine + 1,
                filename: this.getSourceFilename()
            };

            nodes.push(node);
        }

        return nodes;
    }
}