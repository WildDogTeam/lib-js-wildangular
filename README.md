
# lib-js-wildangular


[![Build Status](https://travis-ci.org/WildDogTeam/lib-js-wildangular.svg?branch=master)](https://travis-ci.org/WildDogTeam/lib-js-wildangular)
[![Coverage Status](https://coveralls.io/repos/WildDogTeam/wild-angular/badge.svg?branch=master&service=github)](https://coveralls.io/github/WildDogTeam/wild-angular?branch=master)
[![Version](https://badge.fury.io/gh/WildDogTeam%2Flib-js-wildangular.svg)](http://badge.fury.io/gh/WildDogTeam%2Flib-js-wildangular)

wild-angular 是Wilddog对angularJS的官方支持库。[Wilddog](http://www.wilddog.com/?utm_medium=web&utm_source=lib-js-wildangular) 是支持数据存储，读写，身份认证的后端服务。

wild-angular 是对Wilddog客户端的补充，提供三个angular service
  * `$wilddogObject` - 同步Object
  * `$wilddogArray` - 同步Array
  * `$wilddogAuth` - 认证


## quickStart

#### 引入依赖


在html中使用wild-angular:

```html
<!-- AngularJS -->
<script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>

<!-- Wilddog -->
<script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>

<!-- Wild-Angular -->
<script src="https://cdn.wilddog.com/libs/wild-angular/0.0.2/wild-angular.min.js"></script>
```
使用npm:

```bash
$ npm install wild-angular --save
```

使用bower:
```bash
$ bower install wild-angular --save
```

#### 注入lib-js-wildangular服务

在我们通过依赖注入使用wild-angular之前，我们需要注册一个`wilddog`模块

```
var app = angular.module("sampleApp",["wilddog"]);

```
现在 `$wilddogObject`,`$wilddogArray`,`$wilddogAuth` Service 可以被注入到任何,controller,service 或factory。

```
app.controller("SampleCtrl",function($scope,$wilddogObject){
  var ref = new Wilddog("https://<appId>.wilddogio.com")

  //将数据下载到一个本地对象
  $scope.data = $wilddogObject(ref);
    
  //在这里打印数据会得到空值

});

```

在上面的例子中，`$scope.data` 将会与服务器同步 。



#### 三向数据对象绑定

Angular被大家熟知的是它的双向数据绑定特性。Wilddog是一个轻量的实时数据库。wild-angular可以将两者完美的结合在一起，DOM，javascript和Wilddog数据库三者之间实时同步。DOM发生改变，相应的model发生改变，与这个model绑定的Wilddog数据节点也发生相应的改变。

如何设置三向数据绑定？我们使用前面介绍的`$wilddogObject`service来创建同步对象，然后调用`$bindTo()`来绑定到`$scope`的一个变量上。

app.js

``` js
var app = angular.module("sampleApp",['wilddog']);
app.controller("SampleCtrl",function($scope,$wilddogObject){
  var ref=new Wilddog("https://<appId>.wilddogio.com/data");
  //将云端数据与本地变量同步
  var syncObject = $wilddogObject(ref);

  //将Wilddog绑定到$scope.data，当本地model发生变化，Wilddog数据库也同步变化。
  syncObject.$bindTo($scope,"data");

})

```
index.html

``` html
<html ng-app="sampleApp">
  <head>
    <script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>
    <script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>
    <script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>
    <script src="app.js"></script>
  </head>
  <body ng-controller="SampleCtrl">
    <!-- 这里输入的任何数据都会同步给Wilddog数据库 -->
    <input type="text" ng-model="data.text"/>
    <!-- Wilddog数据库中的任何内容都会同步到这里 -->
    <h1>You said: {{ data.text }}</h1>
  </body>
</html>

```

#### 同步数组

三向数据绑定对于简单的key-value数据非常好用。但是，很多时候我们需要使用列表。这时我们需要使用`$wilddogArray`service


我们先看看只读的方式，从Wilddog数据库中把一个列表下载到`$scope`的一个对象中

app.js
``` js

var app = angular.module("sampleApp", ["wilddog"]);
app.controller("SampleCtrl", function($scope, $wilddogArray) {
  var ref = new Wilddog("https://<appId>.wilddogio.com/messages");
  // 创建一个同步数组
  $scope.messages = $wilddogArray(ref);
});

```

index.html

``` html
<html ng-app="sampleApp">
  <head>
    <script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>
    <script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>
    <script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>
    <script src="app.js"></script>
  </head>
  <body ng-controller="SampleCtrl">
    <ul>
      <li ng-repeat="message in messages">{{ message.text }}</li>
    </ul>
  </body>
</html>


```

上面的例子只能满足只读的需求，Wilddog数据库修改，页面会保持同步，而如果页面中的数据发生了修改，将不会通知到Wilddog数据库。


那么，wild-angualr提供了一组方法来完成同步数组的需求:`$add()`,`$(save)`,`$(remove)`

app.js

``` js

var app = angular.module("sampleApp", ["wilddog"]);
app.controller("SampleCtrl", function($scope, $wilddogArray) {
  var ref = new Wilddog("https://<appId>.wilddogio.com/messages");
  // 创建一个同步数组
  $scope.messages = $wilddogArray(ref);
  // 把新数据添加到列表中
  // 这条数据会自动同步到wilddog数据库
  $scope.addMessage = function() {
    $scope.messages.$add({
      text: $scope.newMessageText
    });
  };
});

```

index.html

``` html
<html ng-app="sampleApp">
  <head>
    <script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>
    <script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>
    <script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>
  </head>
  <body ng-controller="SampleCtrl">
    <ul>
      <li ng-repeat="message in messages">
        <!-- edit a message -->
        <input ng-model="message.text" ng-change="messages.$save(message)" />
        <!-- delete a message -->
        <button ng-click="messages.$remove(message)">删除消息</button>
      </li>
    </ul>
    <!-- push a new message onto the array -->
    <form ng-submit="addMessage()">
      <input ng-model="newMessageText" />
      <button type="submit">新增消息</button>
    </form>
  </body>
</html>


```
#### 终端用户认证

Wilddog 提供了一列登录认证的方式，支持匿名，email，微博，微信，QQ登录


wild-angular提供了一个service `$wilddogAuth`,封装了Wilddog提供的登录认证的方式。能够注入到任何 controller，service和factory。

```
app.controller("SampleCtrl", function($scope, $wilddogAuth) {
  var ref = new Wilddog("https://<appId>.wilddogio.com");
  var auth = $wilddogAuth(ref);
  // 通过weixin登录
  auth.$authWithOAuthPopup("weixin").then(function(authData) {
    console.log("uid : ", authData.uid);
  }).catch(function(error) {
    console.log("登录失败:", error);
  });
});

```

## API

[API文档](https://github.com/WildDogTeam/lib-js-wildangular/blob/master/API.md)

## Guide

[开发向导](https://github.com/WildDogTeam/lib-js-wildangular/blob/master/GUIDE.md)



## Contributing

TBD

```bash
$ git clone https://github.com/WildDogTeam/lib-js-wildangular.git
$ cd lib-js-wildangular           
$ npm install -g grunt-cli  
$ npm install               
$ grunt install             
$ grunt watch              
```


