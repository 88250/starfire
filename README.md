## How to use

1. Download and setup IPFS
   ```
   ipfs init
   ipfs daemon --enable-pubsub-experiment
   ```
2. Open browser http://localhost:8080/ipfs/TODO
3. Login with your key (`PrivKey`) in IPFS config (~/.ipfs/config)

## Production

* update config.ts `env: "product"`
* pack & publish
  ```
  npm run dist
  ipfs add -r dist
  ```
* update version in ipfs

## Dev

```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://localhost:9000"]'
ipfs daemon --enable-pubsub-experiment
npm run start
```

### TODO

* hotkey

## Doc

### PubSub Topic

* starfire

### File Paths

* /starfire/index
* /starfire/users/id
* /starfire/posts/id
* /starfire/blacklist
* /starfire/version

### Theme

https://material.io/tools/color/#!/?view.left=0&view.right=1&primary.color=24282d&secondary.color=d93025


