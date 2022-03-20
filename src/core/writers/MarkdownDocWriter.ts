import { RecordField } from "doc-tree";
import DocWriter from "../../model/DocWriter";
import { PugAstMixinNode } from "../DocParser";

export default class MarkdownDocWriter extends DocWriter {
    private content = "";
    private identation: number = 0;

    private write(string: string = "") {
        this.writeIdentation();
        this.append(string);
    }

    private append(string: string = "") {
        this.content += string;
    }

    private writeLine(string: string = "", ident: number = 0) {
        this.writeIdentation();
        this.append(string + "\n");

        if (ident !== 0) {
            this.adjustIdentation(ident);
        }
    }

    private writeIdentation() {
        this.append("\t".repeat(this.identation));
    }

    private adjustIdentation(identation: number = 1) {
        this.identation += identation;
        this.identation = Math.max(this.identation, 0);
    }

    private advanceIdentation() {
        this.adjustIdentation(1);
    }

    private retreatIdentation() {
        this.adjustIdentation(-1);
    }

    public writeToString() {
        this.writeLine("## Mixins");
        
        this.ast.nodes
            .filter((node) => node.type === "MixinNode")
            .forEach((mixin: PugAstMixinNode) => {
                this.writeLine(`- **${mixin.name}**`, 1);
                this.writeLine(mixin.description);

                this.write("- **Location:** ");
                this.append(mixin.location.filename + ":" + mixin.location.line);
                this.writeLine();

                this.writeLine("- **Parameters:**", 1);

                // Search for parameter tags
                const params = mixin.tags.filter((tag) => tag.title === "param");

                for(let param of params) {
                    this.writeLine("- *" + param.name + "*", 1);

                    if (param.type.type === "NameExpression") {
                        this.write("- `" + param.type.name + "`");
                        this.writeLine("- " + param.description);
                    } else
                    if (param.type.type === "RecordType") {
                        this.writeLine("```typescript");
                        this.writeRecord(param.type.fields);
                        this.writeLine("```");
                        this.writeLine(param.description);
                    }

                    this.retreatIdentation();
                }

                this.adjustIdentation(-2);
            });

        return this.content;
    }

    private writeRecord(fields: RecordField[]) {
        this.writeLine("{", 1);

        for(let field of fields) {
            this.write(field.key);
            this.append(": ");

            if (field.value.type === "NameExpression") {
                this.append(field.value.name);
            }

            this.append(fields.indexOf(field) !== fields.length - 1 ? "," : "");
            this.writeLine();
        }

        this.retreatIdentation();
        this.writeLine("}");
    }
}