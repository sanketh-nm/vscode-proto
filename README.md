# vscode-proto README

Proto3 support for VSCode

## Features

![name](images/extention-show.mov)

- syntax highlighting.
- syntax validation.
- compiling

## Other notes

Some of the logic has been extracted from [vscode-proto3](https://github.com/zxh0/vscode-proto3/blob/master/package.json)

I have made an effort fix some issues and improve where I can. I have also removed some features such as auto complete in an attempt speed up the extention. I have also fixed the issue where imports were behaving weird.

Make a bug report by creating a Github issue or by opening a PR.

# Known issues
Import errors are only compiled on save. The errors are generated by running the `protoc` command and this time, the command only accepts saved files.