# Venus Mock

## 介绍
```Venus Mock``` 是个用来 ```mock api``` 的应用，初衷是拿来练手 ```nodejs``` 和 ```typescript```

## 项目介绍
项目按功能可以分为两个部分，一个是在```src/app```目录下基于```Vue```的前端SPA应用，其他则为基于Koa2的后端。

## 现在能干啥
* 能够mock数据

## 准备干点啥
* 接入Swagger，实现导入并mock
* 测试指定项目下或者域名下的所有api是否有效，且对返回数据进行校验
* 想到再写

## 启动
### 服务端
#### 安装依赖
```npm i```
#### 启动服务
```npm run devServer ```

_注意：如果当前环境自己上了梯子，那么记得关了梯子，不然代理不会生效。_

### 客户端
#### 安装依赖
```npm i```
#### 启动服务
```npm run devClient ```

## 打包
```npm run dist```

*然后自己到```dist```目录用```pm2```跑起来*
