import DocWriter from "../../model/DocWriter";

import IndexTemplate from "../../templates/html/index.pug";

export default class HTMLDocWriter extends DocWriter {
    public writeToString(): string {
        return IndexTemplate({
            options: this.options,
            ast: this.ast
        });
    }
}