# Setting up Locally

>[!NOTE] 
> make sure you have SSH set up on github.
> Otherwise, clone the three repoes, `Elhaykal-client`, `Elhaykal-service`, and `Elhaykal-frontend` Separately.

Clone `basic_linux_cluster` recursively, 

```
git clone git@github.com:Distributed-Fall-25/basic_linux_cluster.git --recursive
```

## Elhaykal-frontend

- Make sure you are on `wui` branch
```
git fetch
git checkout wui

```
- Make sure NPM and NodeJS > 22.0 are installed.
- You can use NVM (Node Version Manager) for NodeJS installation


```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm for current session
```

```bash
nvm install 24.11.1
```
> Latest as of writing

- Navigate to `Elhaykal-frontend` and run:

```
npm install
npm run dev
```

You should see the UI at http://localhost:5173/


## Elhaykal-Client & Elhaykal-Service

- Make sure you are on `wui` branch
```
git fetch
git checkout wui

```
- Then just run `cargo run`

## Precaution

>[!WARN]
> There will be some warmup time before the frontend Clients (Elhaykal-frontend) connect to their middleware (Elhaykal-client)

>[!WARN]
> To shutdown a server Terminate the `Elhaykal-client` program for inactivity 