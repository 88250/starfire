## 星火

### 简介

> 星星之火可以燎原

星火是一个去中心化的社交网络。

### 动机

1. 在中心化的服务下，你的数据并不属于你，服务终止或者账号被封意味着你将失去你的数据
2. 中心化服务会通过你的数据进行盈利，但并未从盈利中拿出透明公平的收益回报给你

星火的诞生主要解决第一个问题，即你的数据永远属于你。第二个问题星火会逐步尝试探索。

### 功能

* 发布文章、发布评论
* 固定的个人主页地址
* 无缝嵌入 IPFS 数据

星火可以用于记录你生活的点点滴滴、和其他志同道合的人开展讨论或者推广你的产品等，可以把星火当做个人博客、社区论坛、自媒体平台来使用，并且所有数据都是永久性的。

### 技术

[IPFS](https://ipfs.io) 为星火的实现提供了基础：

* 通过 File 实现帖子、评论内容的存取
* 通过 DAG 实现元数据的存取
* 通过 PubSub 实现节点间的准实时交互
* 通过 IPNS 实现用户个人主页寻址和更新

### 管理

在目前的技术条件下，仍然存在一个无法实现的中心化“节点”，即星火管理员，因为有一些事情需要特定的人来做：

1. 确认代码和版本并进行发布
2. 确认恶意节点并更新黑名单

这两项操作我们会通过管理员（`QmfQUfpYh2J2jaihvfwsR6ACQnf3iQ551N1dNMfcNTmyjr`）进行。所有管理运维操作都是公开透明的，不存在任何“暗箱操作”，用户可以对我们的管理运维操作进行监督。

### FAQ

#### IPFS 是什么？

请看 [IPFS 入门笔记](https://hacpai.com/article/1511015097370)。星火基于 IPFS 技术栈实现，用户可直接使用 IPFS 已有功能和数据。

#### 我的数据存放在哪里？

你的数据在本地磁盘上会存有一份，如果有其他人看过，则在他的节点上会缓存一份；如果有其他人收藏（`ipfs pin`）过，则在他的节点上也会保存一份。

本地磁盘数据路径目录路径默认在 `~/.ipfs/`（可通过环境变量 `IPFS_PATH` 指定该目录路径）。

#### 如何备份数据？

需要完整备份 .ipfs 目录，里面包含了所有数据、账号和相关配置。

#### 忘记密钥怎么办？

.ipfs/config 文件中的 `PrivKey` 项保存了你的密钥对，登录和发布内容时需要填写该项。一定要妥善保管密钥对，不要泄露给任何第三方。如果不慎遗失该密钥对，则你的账号将永远丢失，无法恢复。

#### 会停服吗？

从技术上讲，只要 IPFS 网络能够运行，星火就不会也不可能停服。这意味着：

* 你发布的内容将会得到永久存储
* 星火的代码永远不会消失

#### 匿名程度如何？

虽然星火不需要实名制使用，但你节点所在 IP 是可以被其他人获取到的，而 IP 使用记录在运营商那里是有记录的，所以从技术上而言，其他人是有办法可以查到你实名身份的。

#### 存在封禁机制吗？

我们是通过一个全局的黑名单来进行节点的屏蔽。如果发现存在恶意节点，我们会将其列入黑名单中并进行广播，网络中的节点收到黑名单后会和其中所列出的恶意节点进行断开。这样恶意节点就会变成孤岛节点，防止其对网络的进一步干扰破坏。

#### 使用到区块链吗？

没有使用，星火是完全基于 IPFS 实现的。另外，星火目前也没有使用到 IPFS 激励层 Filecoin。

#### 开源吗？

https://github.com/b3log/starfire

#### 由谁开发，如何实现盈利？

星火由 B3log 开源社区进行开发和维护。目前我们没有盈利计划，因为除了很少的开发工作量和引导节点架设外，我们并没有付出其他成本。将来如果有机会，我们会和大家一起探索`动机`部分提到的问题二。

---

## 安装

1. 下载并初始化 IPFS
   ```shell
   ipfs init
   ```
2. 运行 IPFS 并连接引导节点
   ```shell
   ipfs daemon --enable-pubsub-experiment
   ipfs swarm connect /ip4/47.111.58.76/tcp/4001/ipfs/QmZdWDS3qLbH55knn4hGjH2oq5hGwJz8sUHHz273xzX2rc
   ```
3. 添加引导节点
   ```shell
   ipfs bootstrap add /ip4/47.111.58.76/tcp/4001/ipfs/QmZdWDS3qLbH55knn4hGjH2oq5hGwJz8sUHHz273xzX2rc
   ```   
4. 允许接口跨域
   * Windows: 
     ```shell
     ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  [\"*\"]
     ```
   * Linux/Mac: 
     ```shell
     ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["*"]'
     ```
5. 打开浏览器访问 http://127.0.0.1:8080/ipfs/QmT1qdmakt3g4Lmks6JTC7bEBYy9W5JF5tvZfFjZUdjE5f
6. 通过密钥对登录 ~/.ipfs/config 中的 `PrivKey` 项 

---

## 开发相关

### Production

* update config.ts `development => product`
* pack & publish
  ```
  npm run build
  ipfs add -r dist
  ```
* update version in ipfs

### Dev

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


