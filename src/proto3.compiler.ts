"use strict";

import vscode = require("vscode");
import path = require("path");
import cp = require("child_process");

export class Proto3Compiler {

  public compileProtoToTmp(
    fileName: string,
    callback?: (stderr: string) => void
  ) {
    let activeProtoPath = "";
    if (!vscode.workspace.workspaceFolders ||  !vscode.window.activeTextEditor ) {
      vscode.window.showInformationMessage("Open a folder/workspace first");
      return;
    } else {
      activeProtoPath = path.relative(
        vscode.workspace.workspaceFolders[0].uri.fsPath,
        path.resolve(
          vscode.window.activeTextEditor.document.fileName 
        ),
      );
    }

    let args = [
      "--node_out=/var/folders/qd/xtmwbqy966n1nhl7702_3qcc0000gn/T", // This is just temp out path
      activeProtoPath,
    ];

    this.runProtoc(args, undefined, (stdout, stderr) => {
      if (callback) {
        callback(stderr);
      }
    });
  }

  // compiles the proto file using protoc command((Must be installed) using cp.execFile
  // calls back with errors.
  private runProtoc(
    args: string[],
    opts?: cp.ExecFileOptions,
    callback?: (stdout: string, stderr: string) => void
  ) {
    if (!opts) {
      opts = {};
    }
    opts = Object.assign(opts, { cwd: vscode.workspace.rootPath });
    cp.execFile("protoc", args, opts, (err, stdout, stderr) => {
      if (err && stdout.length === 0 && stderr.length == 0) {
        // Assume the OS error if no messages to buffers because
        // "err" does not provide error type info.
        vscode.window.showErrorMessage(err.message);
        return;
      }
      if (callback) {
        callback(stdout, stderr);
      }
    });
  }
}
