import { writeFileSync } from "fs";
import { PugDocAst } from "../core/DocParser";

export default abstract class DocWriter {
    constructor(
        protected ast: PugDocAst
    ) {

    }

    /**
     * Writes the documentation to a string
     */
    abstract writeToString(): string;

    /**
     * Writes the filename to a string
     * @param filename The filename to be written
     * @returns 
     */
    public writeToFile(filename: string) {
        return writeFileSync(filename, this.writeToString());
    }
}