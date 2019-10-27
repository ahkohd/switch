# Switch Service

[![Build Status](https://travis-ci.org/ahkohd/switch.svg?branch=master)](https://travis-ci.org/ahkohd/switch) [![Build status](https://ci.appveyor.com/api/projects/status/gbm5k5qc2l32s8iv?svg=true)](https://ci.appveyor.com/project/ahkohd/switch)

Switch's crossplatform stand-alone service for switching apps. Uses IPC (Inter Process Communication) to communicate (two-way) with [Switch Desktop.](https://github.com/ahkohd/switch-desktop)

# Running

> Before running Switch Service in development mode, please ensure you have Node.js installed on your machine.

Clone this repo, and cd into it, Then:

```bash
$npm i
$npm run dev
```

# Building

Switch uses`pkg` to ship executables for Windows, MacOS (Under development) that will be spwaned at [Switch Desktop](http://ahkohd.github.com/switch-desktop) start up.

> Before building Switch Service, please ensure you have Node.js installed on your machine.

Clone this repo, and cd into it, Then:

```bash
$npm i
$npm run build
```

# License

[Read LICENSE.md](./LICENSE.md)
