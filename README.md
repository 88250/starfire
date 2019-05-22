## Download and setup IPFS

1. Download IPFS and init it 
   ```
   ipfs init
   ```
2. Config IPFS 
   * Windows: 
     ```
     ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  [\"*\"]
     ```
   * Linux/Mac: 
     ```
     ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["*"]'
     ```
3. Add bootstrap node and connect it
   ```
   ipfs bootstrap add /ip4/47.111.58.76/tcp/4001/ipfs/QmZdWDS3qLbH55knn4hGjH2oq5hGwJz8sUHHz273xzX2rc
   ipfs swarm connect /ip4/47.111.58.76/tcp/4001/ipfs/QmZdWDS3qLbH55knn4hGjH2oq5hGwJz8sUHHz273xzX2rc
   ```   
4. Run IPFS
   ```
   ipfs daemon --enable-pubsub-experiment
   ```
5. Open browser http://localhost:8080/ipfs/QmT1qdmakt3g4Lmks6JTC7bEBYy9W5JF5tvZfFjZUdjE5f
6. Login with your key (`PrivKey`) in IPFS config (~/.ipfs/config)

## Production

* update config.ts `development => product`
* pack & publish
  ```
  npm run build
  ipfs add -r dist
  ```
* update version in ipfs

## Dev

```
ipfs daemon --enable-pubsub-experiment
```
```
npm run start
```
```
npm run scss
```

### TODO

* hotkey
* upload file
* update avatar

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


