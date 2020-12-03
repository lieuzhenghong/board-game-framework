# How to build from a new device?

Tested on a fresh installation of Ubuntu 20.04

On a new device, do a `git clone` of this repository,
or a `git pull` if you already have an old copy of the repo.

## Installing NodeJS and TypeScript

First install some (old) version of node from the package manager:

`sudo apt install nodejs`
 
Then, use `nvm` to install a newer version of node
(get the latest version of nvm from `https://github.com/nvm-sh/nvm#install--update-script`):
We install node v14 LTS.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
nvm ls-remote
nvm install v14.15.1/
```


Now we install TypeScript. This should be already in the `package.json` file.

```
cd board-game-framework
npm install 
```

You should now be able to build with `npx tsc` with no errors.

## Appendix

We previously had errors when building using TypeScript:
there was like a "Error TS2304: Cannot find name "global""
and several other "require" errors.

The way I fixed it was to modify the `tsconfig.json`
and have two different `tsconfig` files.

I had thought that we would need to add 
`"module": "commonjs"` in `compilerOptions` 
but it seems like it doesn't require it?

Here's the link:
https://stackoverflow.com/questions/37579969/how-to-use-multiple-tsconfig-files-in-vs-code

We might be able to get away without separate tsconfig files.

So the build now works but I think having two different `import` functions
is going to cause lots of problems down the line.
