开发向导
----

## 什么是 lib-js-wildangular

对于Angular应用来说，Wilddog提供了一系列优势：

* 轻量快速的数据同步：Wilddog可以作为你全部的后端服务，快速同步多客户端。
* 无后端服务：只需要开发客户端，配合[Wilddog灵活的安全规则](https://z.wilddog.com/rule/quickstart)，你可以进行无后端开发。
* 内置登录认证：Wilddog提供了一套[终端用户认证](https://z.wilddog.com/web/guide/7)和用户管理机制，可以方便的使用多种登录认证方法。
* 数据绑定：Wild-Angular就像胶水一样，连接Angular的双向数据绑定和Wilddog的数据同步平台


假设你已经熟悉了 [AngularJS](https://www.angularjs.org)。

#### lib-js-wildangular的角色

lib-js-wildangular是WildDogTeam维护的开源软件，提供DOM,JavaScript和Wilddog数据库的三向数据绑定。


如果你不熟悉Wilddog，我们建议你先阅读 [Wilddog web 开发向导](https://z.wilddog.com/web/guide/1)，请在使用lib-js-wildangular之前理解Wilddog如何存储数据，如何读数据和写数据。lib-js-wildangular的作用是补充Wilddog 客户端，而不是取代它。


lib-js-wildangular并不适合同步层级很深的数据，在Angular中使用Wilddog并非只有 lib-js-wildangular 一种方式。

#### 创建账号

在开始之前，你应该已经有一个Wilddog账号，如何没有，可以先[创建一个账号](https://www.wilddog.com/my-account/signup),之后创建一个Wilddog的app，你将获得一个唯一的以`wilddogio.com`结尾的URL，我们使用这个url进行数据读写同步，和用户认证

#### 安装lib-js-wildangular

从CDN中引入lib-js-wildangular,需要先引入AngularJS和Wilddog:

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

我们可以在这些模块中使用lib-js-wildangular提供的三个Service `$wilddogObject` `$wilddogArray` `$wilddogAuth`。需要使用的时候我们需要把他们注入到 controller,factory或service。

```js

app.controller("SampleController", ["$scope", "$wilddogArray",
  function($scope, $wilddogArray) {
    // ...
  }
]);

```
lib-js-wildangular 的首要目标是管理和同步数据，这个目标是通过 $wilddogObject 和$wilddogArray 来完成的。


#### 处理异步操作

数据与Wilddog数据库的同步是通过异步的方式完成的。这意味着你通知远程远程服务器执行的同时，本地的代码仍在运行，所以我们应该小心，等服务器返回之后再读取数据。

```js

var ref = new Wilddog("https://<APPID>.wilddogio.com");
$scope.data = $wilddogObject(ref);
// 目前$scope.data 是空的
console.log($scope.data);

```

最简单的办法是在view中使用Angular的`json`filter打印日志。当数据正常载入的时候lib-js-wildangular会通知Angular compiler。

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

如果你直接使用SDK，而不使用lib-js-wildangular,数据加载完后通知Angular的compiler非常重要。

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
        "name": "Marie Curie",
        "dob": "November 7, 1867"
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
数据将会被从Wilddog服务端请求，当数据返回，lib-js-wildangular会通知Angular的compiler去更新页面。所以我们可以直接使用在view中。比如，下面的代码会使用json格式打印数据。

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

从服务端同步变化的特性已经非常赞了，但lib-js-wildangular提供更酷的特性--三向数据绑定。

只需要在同步对象上简单的调用 `$bindTo`，DOM中产生的任何变化都会推送给Angular，然后自动同步到Wilddog数据库。另一方面，Wilddog数据库中的任何变化都会推送给Angular，并展示在DOM中。

我们来看看如何用三向数据绑定改变上面的例子，把`$sava()` 去掉。


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
    <label>Name:</label>
    <input type="text" ng-model="profile.name">

    <label>Email:</label>
    <input type="text" ng-model="profile.email">

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
  function($scope, Profile){
    Profile("physicsmarie").$bindTo($scope,"profile");
  }
]);

```
在这个例子中，我们只需要使用`$bindTo`自动将wilddog数据库和 `$scope.profile`，我们不再需要 `ng-submit`来调用`$save()`，Wild-Angular来做剩下的所有事情。

> **维持三向数据绑定简洁**
> 因为三向数据绑定非常简单，在深度嵌套的数据结构中使用要非常小心。因为性能的原因，在实际中，数据在不同客户端的改变并不是一齐进行的。不要使用`$bindTo`同步list

#### 处理基本数据类型

考虑下面的数据结构：

```js
{
  "foo": "bar"
}

```
如果你尝试将`foo/`同步到`wilddogObject`,一个特殊的键 `$value`将被创建，用来储存基本数据类型。这个键只有在当前节点没有子节点的情况下才存在。如果一个路径不存在，`$value`将被设置为null。

```js
var ref = new Wilddog("https://<APPID>.wilddogio.com/foo");
  var obj = new $wilddogObject(ref);
  obj.$loaded().then(function() {
    console.log(obj.$value); // "bar"
  });
  // change the value at path foo/ to "baz"
  obj.$value = "baz";
  obj.$save();
  // delete the value and see what is returned
  obj.$remove().then(function() {
  console.log(obj.$value); // null!
});

```

查看 `$wilddogObject`的API来了解更多细节。然而并不是所有的数据都可以完美的同步到 `$wildObject`中。如果你需要同步一个列表，这时你需要使用`$wilddogArray`,下节讨论。
 

## 同步数组

同步数组，可以用于任何需要排序、迭代并且具有唯一id的列表对象，如果一个同步数据调用 $add()方法来添加成员，那么此项也会使用Wilddog的push操作同步数据库。

我可以使用 $wilddogArray 服务来创建一个同步数据，这个Array对象的排序方式与数据库的排序方式是一致的，换句话来说，我们可以给同步数组定义一个查询条件，那么我们获取到的数据将会根据查询条件排序。

当然数组不是只读的，在用于修改结构（删除和添加项目）上它还有一些特殊要求，我们在下面将会介绍，在操作同步数组之前，请完整地阅读本节。

```js
// 定义我们的app，注入依赖
var app = angular.module("sampleApp", ["wilddog"]);
// 在 controller 中注入 $wilddogArray 服务
app.controller("ProfileCtrl", ["$scope", $wilddogArray",
  function($scope, $wilddogArray) {
    var messagesRef = new Wilddog("https://<YOUR-WILDDOG-APP>.wilddogio.com/messages");
    // 从一个 Wilddog 引用下载数据（伪只读）到本地数组
    // 所有服务端的变化将会实时绑定
    $scope.messages = $wilddogArray(messagesRef);
    // 创建一个查询服务端最新的25条数据的排序规则
    var query = messagesRef.orderByChild("timestamp").limitToLast(25);
    // $wilddogArray服务能够很好地处理数据库查询
    $scope.filteredMessages = $wilddogArray(query);
  }
]);
```

现在，我们可以结合angular的指令来使用这个数组了。
```html
<ul>
  <li ng-repeat="message in messages">{{ message.user }}: {{ message.text }}</li>
</ul>
```

我们可以 $remove() 方法来添加一个删除消息的按钮,通过它，我们来删除需要删除的信息：
```html
<ul>
  <li ng-repeat="message in messages">
    {{ message.user }}: {{ message.text }}
    <button ng-click="messages.$remove(message)">x</button>
  </li>
</ul>
```

我们还可以通过 $id 来访问每条信息在节点中的位置：
```html
<ul>
  <li ng-repeat="message in messages">
    Message data located at node /messages/{{ message.$id }}
  </li>
</ul>
```


#### API 概览

$add(data)：创建数组总的新成员，可以用于替代push()和splice()。

$remove(recordOrIndex)：删除一项数组中现有的数据，可以用于替换 pop()和splice()。

$save(recordOrIndex)：保存在数组中的现有数据。

$getRecord(key)：给 Wilddog 数据库一个 key，从数组中返回相应的项，也可以用 $indexFor(key) 扎到key的索引。

$loaded()：返回一个promise对象，从数据库下载当前数据，但此方法只能调用一次，使用时需要注意，请参阅扩展服务了解更多接入到服务器的事件。


#### 对象的元字段

类似于同步对象，每个同步数组中的项都会拥有一下特殊属性：

$id:每条数据的key，等同于数据库中每条数据的路径，它会通过 ref.key()返回。

$priority:每个子节点的优先级都被存储在这里，更改此值谈后调用 $save() 也会更改服务器上的优先级，并记录到数组中。

$value：如果此节点的数据是一个基本数据类型（number,string,or boolean），则该数据仍然是一个对象，原始值江北存储在 $value ，并可以修改和保存任何其他字段。

#### 修改同步数组

同步数组的内容会与远程服务器同步， wild-angular 处理对元素的添加、删除和排序，对此，wild-angular提供 $add()、$remove()和$save()方法来安全地更改数组及其元素。

使用 splice() , pop() , push() , shift()和unshift()可以更改本地的内容，但是这些方法不受 wild-angular 的监视，并且数据的改变不能同步到远程数据库，因此，先要更改远程数据，应使用安全并发的方法来代替。

```js
var messages = $wilddogArray(ref);
// 添加一条新数据到数组
messages.$add({
  user: "physicsmarie",
  text: "Hello world"
});
// 从数组中删除一条数据
messages.$remove(someRecordKey);
// 更改一条数据并保存
var item = messages.$getRecord(someRecordKey);
item.user = "alanisawesome";
messages.$save(item).then(function() {
  // data has been saved to our database
});
```


## 登录认证

Wilddog 的托管认证服务以供一个完全客户端解决方案用来进行账户管理和认证，它支持匿名身份登录、 email/password 登录，还有通过不同的OAuth提供商登录，包括微博、微信、QQ。

每个供应商都必须单独配置，并从你的用户登录面板启用。

wild-angular 提供了 $wilddogAuth 方法，此方法封装了wilddog客户端身份验证的服务，它可以被注入到任何的 controller , service , factory。

```js
//定义app和依赖
var app = angular.module("sampleApp", ["wilddog"]);
// 注入 $wilddogAuth 到 controller
app.controller("SampleCtrl", ["$scope", "$wilddogAuth",
  function($scope, $wilddogAuth) {
    var ref = new Wilddog("https://<YOUR-WILDDOG-APP>.wilddogio.com");
    var auth = $wilddogAuth(ref);
  }
]);
```

#### 用户登录

$wilddogAuth 服务对每个验证类型都有操作的方法。例如，要验证匿名用户，你可以用 $authAnonymously()。

#### 管理用户

$wilddogAuth服务还提供了一套用于管理 email/password 账户的方法，包括创建和删除用户，更爱账户的 email或password并发送密码的充值邮件。

#### 检索验证状态

一旦用户通过验证之后，就可以使用 $getAuth() 方法来获取客户端当前的认证状态。包括用户的uid（这是所有用户的唯一用户标识）以及用于认证的提供商，其他变量包含每个特定的提供商，并包含提供商的特定链接。

除了 $getAuth() 方法，还有一个异步的的方法 $onAuth() ，它在每次用户认证状态发生变化的时候触发，此方法通常比 $getAuth() 方法方便，因为它提供了一个单一的、一直的空间来处理用户认证状态的更新，包括用户登录、注销或 session 到期。

这些概念放在一起，我们可以创建基于用户的当前验证状态的动态内容的登录表单：

HTML :
```html
<script src="http://apps.bdimg.com/libs/angular.js/1.4.6/angular.min.js"></script>
<script src="https://cdn.wilddog.com/sdk/js/current/wilddog.js"></script>
<script src="https://cdn.wilddog.com/libs/wild-angular/0.0.1/wild-angular.min.js"></script>

<div ng-app="sampleApp" ng-controller="SampleCtrl">
  <div ng-show="authData">
    <p>Hello, {{ authData.weixin.displayName }}</p>
    <button ng-click="auth.$unauth()">Logout</button>
  </div>
  <div ng-hide="authData">
    <p>欢迎，请登录</p>
    <button ng-click="auth.$authWithOAuthPopup('facebook')">微信账号登录</button>
  </div>
</div>
```

JavaScript : 
```js
var app = angular.module("sampleApp", ["wilddog"]);

app.factory("Auth", ["$wilddogAuth",
  function($wilddogAuth) {
    var ref = new Wilddog("https://appName.wilddogio.com");
    return $wilddogAuth(ref);
  }
]);

app.controller("SampleCtrl", ["$scope", "Auth",
  function($scope, Auth) {
    $scope.auth = Auth;

    // 每次用户状态发生变化，增加用户信息到scope
    $scope.auth.$onAuth(function(authData) {
      $scope.authData = authData;
    });
  }
]);
```
ng-show 和 ng-hide 指令动态地改变了基于身份验证状态的内容，通过检查，监听 authData 是否为空。登录和注销方法直接利用 ng-click 指令控制视图。

#### 基于用户的安全

验证用户只是保障应用程序安全的一块。在上线前，配置安全性和 Wilddog 安全规则是非常关键的，这些声明性规则规定何时以及何种数据可以被读或写。

在 Wilddog 和安全规则中，auth变量在认证之前值为 null，一旦用户认证通过，它将包含以下属性：

provider： 用户登录的方式（如"anonymous"或"weixin"）

uid：用户id，保证是独一无二的。

我们可以在规则表达式中使用auth变量，例如，我们可以授予每个人可以读取所有数据，但是只能写自己的数据，我们的规则是这样的：

```js
{
  "rules": {
    // public read access
    ".read": true,
    "users": {
      "$uid": {
        // write access only to your own data
        ".write": "$uid === auth.uid",
      }
    }
  }
}
```


#### 认证和路由

检查客户端的用户登录是否通过可能会很麻烦，并导致了我们的控制器会有很多的 if/else 逻辑，此外，使用身份验证的应用程序经常注销状态时，在检查状态完成前，初始页面加载时会有问题。我们可以利用 Angular routers 的 resolve() 方法来抽象化这些复杂的逻辑。

wild-angular 为 Angular routers 提供了两种辅助方法。第一个是 $waitForAuth() 返回一个 promise 对象，完成后包含当前的验证状态，当你现在路由渲染之前获取验证状态时，这个方法是非常有用的。第二个是 $requireAuth()，返回一个promise对象，当用户验证通过后返回数据，否则执行 reject 方法，在想呈现一个只有登录用户才能浏览的页面是，这个方法是非常有用的，你也可以在promise的reject方法中为未认证用户重定向到不同的页面，如登录页面。这两种方法都与 ngRoute 的 resolve() 方法正常协作。

```js
app.run(["$rootScope", "$location", function($rootScope, $location) {
$rootScope.$on("$routeChangeError", function(event, next, previous, error) {
  // 当用户认证失败时，我们可以捕获到此状态并重定向到home
  if (error === "AUTH_REQUIRED") {
    $location.path("/home");
  }
});
}]);
app.config(["$routeProvider", function($routeProvider) {
$routeProvider.when("/home", {
  // 其余的在ui-route 和 ngRoute是相同的
  controller: "HomeCtrl",
  templateUrl: "views/home.html",
  resolve: {
    // controller在$waitForAuth完成之前不会被load
    // Auth指向我们上面创建的$wilddogAuth Auth服务中
    "currentAuth": ["Auth", function(Auth) {
      // $waitForAuth 返回一个promise，所以resolve等待它完成
      return Auth.$waitForAuth();
    }]
  }
}).when("/account", {
  controller: "AccountCtrl",
  templateUrl: "views/account.html",
  resolve: {
    "currentAuth": ["Auth", function(Auth) {
      // $requireAuth 返回一个promise
      // 如果promise为成功则返回一个 $stateChangeError
      return Auth.$requireAuth();
    }]
  }
});
}]);
app.controller("HomeCtrl", ["currentAuth", function(currentAuth) {
    //现在的Auth将会包含验证信息或null
}]);
app.controller("AccountCtrl", ["currentAuth", function(currentAuth) {
    //现在的Auth将会包含验证信息或null
}]);
```
注意：使用 ng-annotate 或 grunt-ngmin 压缩代码时，在函数中的工具不能正常实现，因此，即使我们的controller、serveice并不一定需要数组符号来注入依赖，我们仍然需要使用一个数组，并明确说明我们的依赖关系，因为它们在函数中。


## 扩展Services

$wildddogObject 和 $wilddogArray服务都提供 $extend() 方法来从原有服务上创建新的服务，我们能够更改或添加方法到我们的同步对象或同步数组中，在我们了解这些之前，我们先了解一些 wild-angular中的命名约定。

#### 命名约定

$wilddogObject 和 $wilddogArray 的方法都是以 $、$$ 或 _ 作为前缀，根据以下约定：

* $前缀：这些方法都是 wild-angular API 的一部分公共方法，它们都可以使用 $extend() 方法重写，不能删除，也必须符合 API 规定的指定，因为在它们内部使用了其他方法。

* $$前缀：以 $$ 开头的方法被保护，它们都是由同步代码调用，并且不能被其他方法调用，但是它们在开发者使用对数据添加、更新、删除事件时它们可能是有用的，它们可以用 $extend() 方法重写，但必须符合 API 规定的指定。

* _前缀：以 _ 开头的方法和属性，一般为私有属性，它们是 wild-angular 的内部方法，不应该被改变或以任何形式依赖。在将来的版本中这些方法或属性可能会取消，不作另行通知，当在同步本地数据到数据库时，本地数据转换成 JSON 时，它们将会被忽略。

* $id：这个关键变量用于跟踪远程 wilddog key ，用于使用 $getRecord() 方法来查找 $wilddogArray 内的项，也可以在调用 $$added 时进行设置。

* $value：这个关键变量存储了远程数据的原始值，例如，如果在路径的远端值是 "foo" ，并且该路径被同步到本地的 $wilddogObject ，本地同步对象将拥有JSON数据{"$value" : "foo"}，同样，如果一个远程路径不存在，本地对象将拥有数据为 {"$value" : null} 。

一般情况下，存储在一个同步对象或同步数组中的数据将作为此对象的直接属性，我们约定任何带有这些字符前缀的属性或变量都不能同步到服务器，它们在同步JSON数据到数据库之前会被删除，开发人员在定义一些不需要提交到服务器的属性或方法时可以使用这些前缀。

#### 扩展 $wilddogObject

下面的 user 服务定义了一个本地 user 对象，并且添加了一个 getFullName() 方法。

```js
app.factory("User", ["$wilddogObject",
  function($wilddogObject) {
    // 在 $wilddogObject 之上新建一个服务
    var User = $wilddogObject.$extend({
      // 这些方法的原型存在，所以我们可以使用 `this` 来访问数据
      getFullName: function() {
        return this.firstName + " " + this.lastName;
      }
    });
    return function(userId) {
      var ref = new Wilddog("https://<YOUR-WILDDOG-APP>.wilddogio.com/users/").child(userId);
      // 新建一个 user 的实例
      return new User(ref);
    }
  }
]);
```

下列特殊的 $$ 方法在 wild-angualr 接收到服务端更改通知时会被调用，它们可以被重写以用于改变数据如何在本地存储、如何返回服务器。

* $$added(snapshot, prevChildKey)：在每次接收到服务器的 child_added 事件时会被调用，返回一个需要添加到数组的数据， $getRecord() 方法依赖 $$added 来设置每个 Wilddog key 的 $id。

* $$updated(snapshot)：在每次接收到数据库的 child_updated 事件都会触发，如果任何地方的数据进行了修改则返回true。使用 $getRecord()方法来查找绑定了更新的数组中的正确位置，如果返回false，那么代表没有变化发生或者这条数据不在数组之中。

* $$moved(snapshot, prevChildKey)：每次接收到 child_moved 事件时调用，如果数据被移动则返回true，实际的移动事件发生在 $$process 方法中。

* $$removed(snapshot)：在接收到 child_removed 事件时被调用，使用 $getRecord() 方法可以在数组中查找对用的数据，如果数据被删除则返回true。数组的实际拼接发生在 $$process 方法中， $$removed 的唯一责任是决定删除请求是否有效，如果数据是存在的。

* $$error(errorObject)：访问远程数据出现错误时调用，一般来说这些错误是不可恢复的（数据将不再被同步）。

下面的方法也是扩展 $wilddogArray 的一部分，也是用于响应保存数据到 wilddog 时的事件。

* $$defaults(Object)：一个 key/value 对，可以用来定义在服务端查找不到的数据的默认值（比如未定义数据）。默认情况下，在每次 $add()、$$added()、$$updated()方法调用时都会绑定这些数据。

* toJSON()：如果此方法存在于数组中的某个数据，那么它用于分析发送回服务器的数据，通过重写单个数据的 toJSON() 方法就可以操作那些数据被发送回 Wilddog 以及如何在保存之前进行处理。

* $$process(event, record, prevChildKey)：这是一个主要的内部方法，一般不要重写。它提取了各种事件类型之间的一些通用功能。它负责数组元素的所有插入、删除和拼接，并且 $$notify 来绑定事件触发。它在接收服务端事件（$$added、$$updated、$$moved、$$removed）时立即触发，前提是这些事件在返回 false 或 null 时不会取消。

* $$notify(event, recordKey)：这是一个主要的内部方法，一般不要重写，由 $watch 创建的监听器的通知事件触发时会触发此方法，也是在 $$process 内部调用。


## 其他

#### wild-angular最佳实践

wild-angular大大简化了绑定，并提取了大量的 angular 内部工作，例如如何在发生变化时通知编译器，然而，它并不是复制整个 wild-angular 客户端库的 API。

有大量的用例来简化SDK难度或直接使用它。本节将介绍一些最佳实践和技术，使用JavaScript客户端库直接从数据库中抓取数据。

这是最同意实现的一个例子，所以请仔细阅读注释

```js
app.controller("SampleCtrl", ["$scope", "$timeout", "$window", function($scope, $timeout, $window) {
  // 创建一个我们 wilddog 数据库的引用
  var ref = new $window.Wilddog("https://<YOUR-WILDDOG-APP>.wilddogio.com/foo");
  // 从数据库中读取数据到本地 scope 的变量中
  ref.on("value", function(snapshot) {
    // 由于这个事件会触发外面的 Angular 的 $watch 使用范围，我们需要通知 Angular
    // 每次更新都可以使用 $scope.$aplly 或 $timeout 来完成
    // 我们偏向于用 $timeout 因为 1.不会引发错误，2.确保 scope 所有层级的都会刷新(有必要使用一些指令来查看更改)
    $timeout(function() {
      $scope.data = snapshot.val();
    });
  });
}]);
```

同步这样简单的数据当然很简单，当我们开始操作同步的数组和处理绑定时，事情会变得有趣一点，相比零依赖的操作，我们还需要自己实现一个同步数组。


#### 最佳实践

当使用一般的 Wilddog 客户端库和 Angular时，一下几点是需要考虑的：

* $timeout中的事件 ：将所有的服务器通知放在 $timeout 中，以确保 Angular 编译器通知更改。

* 使用 $window.Firebase：这使得测试单元和端对端测试被客户端 Wilddog 监听并用模拟函数代替，也避免了全局对象污染警告。