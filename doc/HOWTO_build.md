# How to build from a new device?

Tested on a fresh installation of Ubuntu 20.04

On a new device, do a `git clone` of this repository,
or a `git pull` if you already have an old copy of the repo.

## Installing NodeJS and TypeScript

First install some (old) version of node from the package manager:

`sudo apt install nodejs`
 
Then, use `nvm` to install a newer version of node:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
nvm ls-remote
nvm install v14.15.1/
```

We install node v14 LTS.

Now we install TypeScript. This should be already in the `package.json` file.

```
cd board-game-framework
npm install 
```

You should now be able to build with `npx tsc` with no errors.
