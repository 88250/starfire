## Setup

```
ipfs init
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://localhost:9000"]'
```

## Use

```
ipfs daemon --enable-pubsub-experiment
```

open http://localhost:8080/ipfs/TODO

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