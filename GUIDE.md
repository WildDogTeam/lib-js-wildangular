开发向导
----

## 什么是 Wild-Angular

对于Angular应用来说，Wilddog提供了一系列优势：

* 轻量快速的数据同步：Wilddog可以作为你全部的后端服务，快速同步多客户端。
* 无后端服务：只需要开发客户端，配合[Wilddog灵活的安全规则](https://z.wilddog.com/rule/quickstart)，你可以进行无后端开发。
* 内置登录认证：Wilddog提供了一套[终端用户认证](https://z.wilddog.com/web/guide/7)和用户管理机制，可以方便的使用多种登录认证方法。
* 数据绑定：Wild-Nngular就像胶水一样，连接Angular的双向数据绑定和Wilddog的数据同步平台


假设你已经熟悉了 [AngularJS](https://www.angularjs.org)。

#### Wild-Angular的角色

Wild-Angular是WildDogTeam维护的开源软件，提供DOM,JavaScript和Wilddog数据库的三向数据绑定。


如果你不熟悉Wilddog，我们建议你先阅读 [Wilddog web 开发向导](https://z.wilddog.com/web/guide/1)，请在使用Wild-Angular之前理解Wilddog如何存储数据，如何读数据和写数据。Wild-Angular的作用是补充Wilddog 客户端，而不是取代它。


Wild-Angular并不适合同步层级很深的数据，在Angular中使用Wilddog并非只有 Wild-Angular 一种方式。

#### 创建账号

在开始之前，你应该已经有一个Wilddog账号，如何没有，可以先[创建一个账号](https://www.wilddog.com/my-account/signup),之后创建一个Wilddog的app，你将获得一个唯一的以`wilddogio.com`结尾的URL，我们使用这个url进行数据读写同步，和用户认证

#### 安装Wild-Angular

从CDN中引入Wild-Angular,需要先引入AngularJS和Wilddog:

```html

<!-- AngularJS -->
<script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>

<!-- Wilddog -->
<script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>

<!-- Wild-Angular -->
<script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>


```
现在我们可以把需要依赖wilddog的模块中引入依赖。

``` js

var app = angular.module("sampleApp", ["wilddog"]);

```

我们可以在这些模块中使用Wild-Angular提供的三个Service `$wilddogObject` `$wilddogArray` `$wilddogAuth`。需要使用的时候我们需要把他们注入到 controller,factory或service。

```js

app.controller("SampleController", ["$scope", "$wilddogArray",
  function($scope, $wilddogArray) {
    // ...
  }
]);

```
Wild-Angular 的首要目标是管理和同步数据，这个目标是通过 $wilddogObject 和$wilddogArray 来完成的。


#### 处理异步操作

TBD



## 同步对象

TBD


## 同步数组

TBD

## 登录认证

TBD

## 扩展Services

TBD

## 其他

TBD
