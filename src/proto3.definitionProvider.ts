"use strict";

import fs = require("fs");
import path = require("path");
import vscode = require("vscode");
import fg = require("fast-glob");
// import { guessScope, Proto3ScopeKind } from './proto3ScopeGuesser';
import { Proto3Import } from "./proto3.imports";
import { PrimitiveTypes } from './proto3.primitiveTypes';

export class Proto3DefinitionProvider implements vscode.DefinitionProvider {
  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | undefined> {
    // todo: handle comments

    const targetRange = document.getWordRangeAtPosition(
      position
    ) as vscode.Range;
    const targetDefinition = document.getText(targetRange);

    // no definition for primitive types
    if (PrimitiveTypes.isPrimitiveType(targetDefinition)) {
        return;
    }

    const lineText = document.lineAt(position).text;

    const importRegExp = new RegExp(`.*import\\s+\"${targetDefinition}";`, "i");
    if (importRegExp.test(lineText)) {
      const importFileName = targetDefinition;

      const location = await this.findImportDefinition(importFileName);

      if (location) {
        return location;
      }
      vscode.window.showErrorMessage(
        `Could not find ${targetDefinition} definition.`
      );
      return undefined;
    }
    const messageOrEnumPattern = `\\s*(\\w+\\.)*\\w+\\s*`;
    const messageFieldPattern = `\\s+\\w+\\s*=\\s*\\d+;.*`;
    const rpcReqOrRspPattern = `\\s*\\(\\s*(stream\\s+)?${messageOrEnumPattern}\\s*\\)\\s*`;

    const messageRegExp = new RegExp(
      `^\\s*(repeated){0,1}(${messageOrEnumPattern})${messageFieldPattern}$`,
      "i"
    );
    const messageInMap = new RegExp(
      `^\\s*map\\s*<${messageOrEnumPattern},${messageOrEnumPattern}>${messageFieldPattern}$`,
      "i"
    );
    const messageInRpcRegExp = new RegExp(
      `^\\s*rpc\\s*\\w+${rpcReqOrRspPattern}returns${rpcReqOrRspPattern}[;{].*$`,
      "i"
    );

    if (
      messageRegExp.test(lineText) ||
      messageInRpcRegExp.test(lineText) ||
      messageInMap.test(lineText)
    ) {
      const location = await this.findEnumOrMessageDefinition(
        document,
        targetDefinition
      );
      if (location) {
        return location;
      }
      vscode.window.showErrorMessage(
        `Could not find ${targetDefinition} definition.`
      );
    }

    return undefined;
  }

  private async findEnumOrMessageDefinition(
    document: vscode.TextDocument,
    target: string
  ): Promise<vscode.Location> {
    const searchPaths = Proto3Import.getImportedFilePathsOnDocument(document);

    const files = [document.uri.fsPath, ...(await fg(searchPaths))];

    for (const file of files) {
      const uri = vscode.Uri.file(file.toString());
      const data = fs.readFileSync(file.toString());
      const lines = data.toString().split("\n");
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const messageDefinitionRegexMatch = new RegExp(
          `\\s*(message|enum)\\s*${target}\\s*{`
        ).exec(line);
        if (messageDefinitionRegexMatch && messageDefinitionRegexMatch.length) {
          const range = this.getTargetLocationInline(
            lineIndex,
            line,
            target,
            messageDefinitionRegexMatch
          );
          return new vscode.Location(uri, range);
        }
      }
    }
    return new vscode.Location(
      vscode.Uri.file("."),
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0))
    );
  }

  private async findImportDefinition(
    importFileName: string
  ): Promise<vscode.Location | undefined> {
    const importPath = path.join(
      path.resolve(
        vscode.window.activeTextEditor?.document.fileName || ".",
        ".."
      ),
      importFileName
    );
    const uri = vscode.Uri.file(importPath);
    const definitionStartPosition = new vscode.Position(0, 0);
    const definitionEndPosition = new vscode.Position(0, 0);
    const range = new vscode.Range(
      definitionStartPosition,
      definitionEndPosition
    );
    return new vscode.Location(uri, range);
  }

  private getTargetLocationInline(
    lineIndex: number,
    line: string,
    target: string,
    definitionRegexMatch: RegExpExecArray
  ): vscode.Range {
    const matchedStr = definitionRegexMatch[0];
    const index = line.indexOf(matchedStr) + matchedStr.indexOf(target);
    const definitionStartPosition = new vscode.Position(lineIndex, index);
    const definitionEndPosition = new vscode.Position(
      lineIndex,
      index + target.length
    );
    return new vscode.Range(definitionStartPosition, definitionEndPosition);
  }
}
