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

数据与Wilddog数据库的同步是通过异步的方式完成的。这意味着你通知远程远程服务器执行的同时，本地的代码仍在运行，所以我们应该小心，等服务器返回之后再读取数据。

```js

var ref = new Wilddog("https://<APPID>.wilddogio.com");
$scope.data = $wilddogObject(ref);
// 目前$scope.data 是空的
console.log($scope.data);

```

最简单的办法是在view中使用Angular的`json`filter打印日志。当数据正常载入的时候Wild-Angular会通知Angular compiler。

```html
<pre>{{data | json }}</pre>
```

直接在controller里打印也是可以的，只需要使用`$loaded()`方法。但是，这个方法只会在数据加载完后被调用一次，因此我们并不推荐用来做debug。

```js
var ref = new Wilddog("https://<APPID>.wilddogio.com");
$scope.data = $wilddogObject(ref);
// then里面的代码会等待数据完全加载完再执行，因此服务端的数据会在这里打印出来
$scope.data.$loaded()
  .then(function() {
    console.log($scope.data);
  })
  .catch(function(err) {
    console.error(err);
  });


```

如果你直接使用SDK，而不使用Wild-Angular,数据加载完后通知Angular的compiler非常重要。

```js
var ref = new Wilddog("https://<APPID>.wilddogio.com");
ref.on("value", function(snapshot) {
  // 数据不会立刻展现，因为我们只是在内存里做了修改，而没有通知Angular
  // $scope.data = snapshot.val();

  // 修复真个问题，当数据发生变化时我们用 $scope.$apply() 通知Angular
  $scope.$apply(function() {
    $scope.data = snapshot.val();
  });
});


现在我们了解了AngularJS和Wilddog结合的基本知识，下一节我们深入介绍下`$wilddogObject`
```

## 同步对象

对象对存储key-value型数据非常有用。比如如下数据

```json
{
  "profiles": {
     "physicsmarie": {
        name: "Marie Curie",
        dob: "November 7, 1867"
     }
  }
}


```
我们可以通过`$wilddogObject`来拉取这些数据。使用一系列我们提供的以`$`开头的辅助方法，我们能够遍历所有的子节点。

```js

var app = angular.module("sampleApp", ["wilddog"]);
// 注入$wilddogObject
app.controller("ProfileCtrl", ["$wilddogObject",
  function($wilddogObject) {
    var ref = new Wilddog("https://<APPID>.wilddogio.com");
    // 把physicsmarie的profile 下载到本地。
    // 服务端的改变将实时同步到本地
    $scope.profile = $wilddogObject(ref.child('profiles').child('phsyicsmarie'));
  }
]);


```
数据将会被从Wilddog服务端请求，当数据返回，Wild-Angular会通知Angular的compiler去更新页面。所以我们可以直接使用在view中。比如，下面的代码会使用json格式打印数据。

```html
<pre>{{ profile | json }}</pre>

```

同样，本地的改变也可保存到服务端，只需要调用`$save()`。我们通常会在 ng-click 或 ng-change 事件中触发`$save()`。

```html
<input ng-model="profile.name" ng-change="profile.$save()" type="text" />

```

#### API 概览

|$save() | 把本地数据同步到服务端 |
|$remove() |将此`wilddogObje`置空，删除所有的key ,并且把这个对象的value设置成null，这个对象仍在存在|
|$loaded() |后返回一个promise，当初始数据被下载的时候执行|
|$bindTo() |创建一个三向数据绑定|

#### 元数据

|$id |这条记录的key|
|$priority|这条数据的优先级|
|$value|如果数据是基本数据类型（number,string,boolean）,`$wilddogObject()`依然会返回object，基本数据类型存储在$value 属性中|


#### 完整例子

index.html
```html
<script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>
<script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>
<script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>
<script src="app.js"></script>


<div ng-app="sampleApp" ng-controller="ProfileCtrl">
  <!-- $id 是包含对象的key,在个例子中，应该是 "physicsmarie" -->
  <h3>Edit: {{ profile.$id }}</h3>

  <!-- 我们能够像修改其他JS对象一样修改$wilddogObject -->
  <form ng-submit="saveProfile()">
    <label>Name:</label>
    <input type="text" ng-model="profile.name">

    <label>Email:</label>
    <input type="text" ng-model="profile.email">

    <button type="submit">保存修改</button>
  </form>
</div>

```

app.js

```js

var app = angular.module("sampleApp", ["wilddog"]);

// factory 创建一个可服用$wilddogObject单例。
app.factory("Profile", ["$wilddogObject",
  function($wilddogObject) {
    return function(username) {
      var ref = new Wilddog("https://<APPID>.wilddogio.com/");
      var profileRef = ref.child(username);
      // 返回一个同步的对象
      return $wilddogObject(profileRef);
    }
  }
]);

app.controller("ProfileCtrl", ["$scope", "Profile",
  function($scope, Profile) {

    $scope.profile = Profile("physicsmarie");

    $scope.saveProfile = function() {
      $scope.profile.$save().then(function() {
        alert('Profile saved!');
      }).catch(function(error) {
        alert('Error!');
      });
    };
  }
]);


```


#### 三向数据绑定


TBD






## 同步数组

TBD

## 登录认证

TBD

## 扩展Services

TBD

## 其他

TBD
