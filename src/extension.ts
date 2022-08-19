// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Proto3Compiler } from "./proto3.compiler";
import { Proto3DefinitionProvider } from './proto3.definitionProvider';
import { Proto3LanguageDiagnosticProvider } from "./protoc.diagnostics";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const PROTO3_MODE: vscode.DocumentFilter = {
			language: 'proto3',
			scheme: 'file'
	};
	// activate definition provider.
	context.subscriptions.push(vscode.languages.registerDefinitionProvider(PROTO3_MODE, new Proto3DefinitionProvider()));

	const diagnosticProvider = new Proto3LanguageDiagnosticProvider();

	vscode.languages.setLanguageConfiguration(PROTO3_MODE.language || 'proto3', {
		indentationRules: {
				// ^(.*\*/)?\s*\}.*$
				decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
				// ^.*\{[^}'']*$
				increaseIndentPattern: /^.*\{[^}'']*$/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)(\.proto){0,1}/g,
		comments: {
				lineComment: '//',
				blockComment: ['/*', '*/']
		},
		brackets: [
				['{', '}'],
				['[', ']'],
				['(', ')'],
				['<', '>'],
		],

		__electricCharacterSupport: {
				brackets: [
						{ tokenType: 'delimiter.curly.ts', open: '{', close: '}', isElectric: true },
						{ tokenType: 'delimiter.square.ts', open: '[', close: ']', isElectric: true },
						{ tokenType: 'delimiter.paren.ts', open: '(', close: ')', isElectric: true }
				]
		},

		__characterPairSupport: {
				autoClosingPairs: [
						{ open: '{', close: '}' },
						{ open: '[', close: ']' },
						{ open: '(', close: ')' },
						{ open: '`', close: '`', notIn: ['string'] },
						{ open: '"', close: '"', notIn: ['string'] },
						{ open: '\'', close: '\'', notIn: ['string', 'comment'] }
				]
		}
});



  console.log('Congratulations, your extension "vscode-proto" is now active!');
  let disposable = vscode.commands.registerCommand(
    "vscode-proto.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from vscode-proto!");
    }
  );

	vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.fileName.split('.')[1] === 'proto') {
			console.log('triggred')
				const compiler = new Proto3Compiler();
				diagnosticProvider.createDiagnostics(event.document, compiler);
		}
});

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
