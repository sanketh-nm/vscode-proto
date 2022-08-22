import path = require('path');
import vscode = require('vscode');

export module Proto3Import {

    export const importStatementRegex = new RegExp(/^\s*import\s+('|")(.+\.proto)('|")\s*;\s*$/gim);

    export const getImportedFilePathsOnDocument = (document: vscode.TextDocument) => {
        const fullDocument = document.getText();
        let importStatement: RegExpExecArray | null;
        let importPaths = [];
        while (importStatement = importStatementRegex.exec(fullDocument)) {
            const protoFileName = importStatement[2];
            const searchPath  = path.join(path.resolve(vscode.window.activeTextEditor?.document.fileName || '.', '..') , protoFileName);
            importPaths.push(searchPath);
        }
        return importPaths;
    }

}
