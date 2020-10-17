# How to set up a local server that others can remotely access

**Prerequisites**:

- You must register with ngrok and install it
- Also you must install localtunnel: `sudo npm install -g localtunnel`

1. Run `ngrok http 4005` to set up port forwarding
2. That will give you a url like the following:

```
Forwarding                    http://852ba6e17b59.ngrok.io -> http://localhost:4005
Forwarding                    https://852ba6e17b59.ngrok.io -> http://localhost:4005
```

3. Go to `ClientMain.ts` and edit the URL in line 102
4. Then type `lt --port 4004` which will give you a URL like the following:

```
your url is: https://good-bulldog-27.loca.lt
```

5. You'll now be able to access the server with that url.
