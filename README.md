# Switch Service
Switch's crossplatform stand-alone service for switching apps. Uses IPC (Inter Process Communication) to communicate (two-way) with [Switch Desktop.](http://ahkohd.github.com/switch-desktop)

# Running
> Before running Switch Service in development mode, please ensure you have Node.js installed on your machine.

Clone this repo, and cd into it, Then:
```bash
$npm i
$npm run dev
```

# Building
Switch uses`pkg` to ship executables (Windows, MacOS, Linux) that will be spwaned at [Switch Desktop](http://ahkohd.github.com/switch-desktop) start up.

> Before building Switch Service, please ensure you have Node.js installed on your machine.

Clone this repo, and cd into it, Then:
```bash
$npm i
$npm run build
```

# License
[Read  LICENSE.md](./LICENSE.md)
