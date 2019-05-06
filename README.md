### Download IPFS and init

```
ipfs init
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://localhost:9000"]'
```


### Use

```
ipfs daemon 
```

open http://localhost:8080/ipfs/TODO

### Dev

```
ipfs daemon 
npm run start
```

### Production

TODO