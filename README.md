## How to use

1. Download and setup IPFS
   ```
   ipfs init
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://localhost:9000"]'
   ipfs daemon --enable-pubsub-experiment
   ```
2. Open browser http://localhost:8080/ipfs/TODO
3. Login with your key (`PrivKey`) in IPFS config (~/.ipfs/config)

## Production

TODO

## Dev

```
ipfs daemon --enable-pubsub-experiment
npm run start
```

### Doc

#### PubSub Topic

* starfire

#### File Paths

* /starfire/index
* /starfire/users/id
* /starfire/posts/id
* /starfire/blacklist