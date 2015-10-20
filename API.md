
# API文档


[![Build Status](https://travis-ci.org/WildDogTeam/wild-angular.svg?branch=master)](https://travis-ci.org/WildDogTeam/wild-angular)
[![Coverage Status](https://coveralls.io/repos/WildDogTeam/wild-angular/badge.svg?branch=master&service=github)](https://coveralls.io/github/WildDogTeam/wild-angular?branch=master)
[![Version](https://badge.fury.io/gh/WildDogTeam%2Fwild-angular.svg)](http://badge.fury.io/gh/WildDogTeam%2FWild-Angular)

## $wilddogObject

`$wilddogObject` 是一个 `Wilddog` 引用，在使用中，返回一个具有 `WildAngular` 特性的服务端 `Wilddog` 对象的引用，它是一个 `JavaScript Object` 对象。需要注意的是，这是一个异步操作，在数据没有返回之前是不能对数据进行任何操作的。你可以使用 `$Loaded()` 方法来获取数据加载完成的事件。

此服务会自动同步远端 `Wilddog` 的数据库变化，但是不会自动将本地的数据更改同步到远端数据库，所有的本地数据变化都需要手动更新本地的对象然后调用此对象的 `$save()` 方法来同步数据到数据库，或者可以直接使用 `$bindTo()` 方法(后面会有介绍)。

```js
app.controller("MyCtrl", ["$scope", "$wilddogObject",
  function($scope, $wilddogObject) {
     var ref = new Wilddog(URL);

     var obj = $wilddogObject(ref);

     // 使用 $loaded() 方法的异步操作来对获取的数据进行操作
     obj.$loaded().then(function() {
        console.log("loaded record:", obj.$id, obj.someOtherKeyInData);

       // 使用 angular 的 forEach() 方法来对获取到的数据进行遍历
       angular.forEach(obj, function(value, key) {
          console.log(key, value);
       });
     });

     // 将数据注册到 $scope 对象中，这样我们就能在 DOM 中利用此数据了
     $scope.data = obj;

     // 三向数据绑定，将获取到的远端数据与本地的 $scope 进行绑定
     obj.$bindTo($scope, "data");
  }
]);
```

#### $id

当前节点的节点名称，相当于 `obj.$ref().key()`。


#### $priority

获取当前节点在最近一次获取到的数据中的优先级，如果更改这个值然后使用 `$save()` 方法可以更新此节点在服务端的优先级。

<strong>注意：</strong> Angular 的 `$watch()` 方法会忽略带有 `$` 前缀的键，而在 `$bindTo()` 方法中，如果修改带有 `$` 前缀的数据，会使本次的修改与服务端的数据绑定失效，除非有不带有 `$` 前缀的字段被提交才会更新，最好的方法是在修改带有 `$` 符号的变量时避免使用 `$bindTo()` 方法，直接使用 `$save()` 方法。


#### $value

如果一个值在数据库里是一个基本类型 ( boolean , string , 或 number ) ，那么它将会被存储到 `$value` 下面，在更改 `$value` 的值之后再执行 `$save()` 方法也会直接更新服务端的数据。

需要注意的是：不管任何时候，只有有其他数据存在，那么此条信息都会被忽略。如果我们需要把一个对象更改为基本类型的数据，我们需要先删除其他的数据，然后再将此数据添加到需要更改的数据下面。还有更简单的做法：

```js
var obj = $wilddogObject(ref); // 从服务端获取到数据
$wilddogUtils.updateRec(obj, newPrimitiveValue); // updateRec 将会清除其他数据
```

<strong>注意：</strong> Angular 的 `$watch()` 方法会忽略带有 `$` 前缀的键，而在 `$bindTo()` 方法中，如果修改带有 `$` 前缀的数据，会使本次的修改与服务端的数据绑定失效，除非有不带有 `$` 前缀的字段被提交才会更新，最好的方法是在修改带有 `$` 符号的变量时避免使用 `$bindTo()` 方法，直接使用 `$save()` 方法。


#### $remove()

删除当前对象的本地和数据库的所有数据，返回一个 `promise` 对象,包含被删除的内容。

```js
var obj = $wilddogObject(ref);
obj.$remove().then(function(ref) {
  // 本地和数据库的数据已经被删除
}, function(error) {
  console.log("Error:", error);
});
```


#### $save()

当数据有更改时，调用 `$save()` 方法可以提交这些更改到数据库，返回一个 `promise` 对象，成功之后返回数据为此节点的 `Wilddog` 引用。

```js
var obj = $wilddogObject(ref);
obj.foo = "bar";
obj.$save().then(function(ref) {
  ref.key() === obj.$id; // true
}, function(error) {
  console.log("Error:", error);
});
```


#### $loaded()

当数据从数据库下载完成时触发此方法，返回一个 `promise` 对象，成功之后返回数据为 `$wilddogObject` 本身。

```js
var obj = $wilddogObject(ref);
obj.$loaded()
  .then(function(data) {
    console.log(data === obj); // true
  })
  .catch(function(error) {
    console.error("Error:", error);
  });
```

在 `$loaded()` 中， `resolve()` / `reject()` 可以简化为：

```js
var obj = $wilddogObject(ref);
obj.$loaded(
  function(data) {
    console.log(data === obj); // true
  },
  function(error) {
    console.error("Error:", error);
  }
);
```


#### $ref()

此方法返回生成当前对象的 `Wilddog` 引用。

```js
var obj = $wilddogObject(ref);
obj.$ref() === ref; // true
```


#### $bindTo(scope, varName)

在 `scope` 变量与数据库的数据之间建立三向数据绑定，当 `scope` 中的数据有更新时，会直接同步到数据库；同理，当数据库的数据有更新时， `scope` 也会实时接收到最新的数据，返回一个 `promise` 对象，成功之后返回数据为被提交或从数据库更新的数据。

JavaScript：

```js
var ref = new Wilddog(URL); // 假设这里的数据是 { foo: "bar" }
var obj = $wilddogObject(ref);

obj.$bindTo($scope, "data").then(function() {
  console.log($scope.data); // { foo: "bar" }
  $scope.data.foo = "baz";  // 这条数据将被提交到数据库
  ref.set({ foo: "baz" });  // 将会更新数据库以及 $scope.data
});
```
HTML:

```html
<input type="text" ng-model="data.foo" />
```
现在我们可以直接绑定在 HTML 中的对象，然后存储到数据库，安全与 `Wilddog` 规则表达式可以用来验证数据在服务端是否格式正确。
 
在一次绑定中只能绑定一个 `scope` 变量，如果第二次绑定相同的 `$wilddogObject` 实例，`promise` 对象会执行 `reject()` 方法，绑定也会失败。

<strong>注意：</strong> Angular 不会向任何 `$watch()` 报告带有 `$` 前缀的变量，简单的做法是将需要绑定 `$watch()` 但不用保存到服务器的数据用 `_` 前缀起名。

```js
var obj = $wilddogObject(ref);
obj.$bindTo($scope, "widget").then(function() {
  $scope.widget.$priority = 99;
  $scope.widget._updated = true;
})
```

如果一个 `scope` 的 `$destroy()` 方法被调用（当一个 `controller` 被销毁的时候会触发），这个对象也会自动解除与此 `scope` 的数据绑定，也可以通过 `unbind()` 方法来解除绑定，这个方法在 `promise` 对象的回调函数中。

```js
var obj = $wilddogObject(ref);
obj.$bindTo($scope, "data").then(function(unbind) {
  // unbind this later
  //unbind();
});
```


#### $watch(callback, context)

注册一个事件监听器，当数据有任何变化时都会收到通知，返回值是一个注销函数，如果调用此函数，将会停止此次监听。

```js
var obj = $firebaseObject(ref);
var unwatch = obj.$watch(function() {
  console.log("data changed!");
});

// 在不需要的时候，我们可以调用 unwatch 方法来挺尸对数据的监听
unwatch();
```


#### $destroy()

调用该方法会取消事件监听器并释放该对象所使用的内存(删除本地数据)。变化不再与数据库的数据绑定。



## $wilddogArray

`$wilddogArray` 是一个 `Wilddog` 引用，在使用中，返回一个具有 `WildAngular` 特性的服务端 `Wilddog` 对象的引用，它是一个 `JavaScript Array` 对象。需要注意的是，这是一个异步操作，在数据没有返回之前是不能对数据进行任何操作的。你可以使用 `$Loaded()` 方法来获取数据加载完成的事件。

此服务会自动同步远端 `Wilddog` 的数据库变化，但是不会自动将本地的数据更改同步到远端数据库，它是一个 `伪只读数组` ，适用于指令 `ng-repeat` 和接受数组参数的  `Angular filters`。

此数组在使用读属性和方法的时候不会有任何问题，但是需要避免直接操作此数组对象，如 `splice()` , `push()` , `shift()` , `unshift()` 还有 `reverse()` 这些方法将会造成本地数据与服务端数据不同步，可以用 `$add()` , `$remove()` , `$save()` 方法所提供的服务来操作数组，如果需要在 `ng-repeat` 中获取 `$wilddogArray` 中项目的 id ，可以使用此项目的 `$id` 。


JavaScript：
 ```js
app.controller("MyCtrl", ["$scope", "$wilddogArray",
  function($scope, $wilddogArray) {
    var list = $wilddogArray(new Firebase(URL));

    // add an item
    list.$add({ foo: "bar" }).then(...);

    // remove an item
    list.$remove(2).then(...);

    // make the list available in the DOM
    $scope.list = list;
  }
]);
```
HTML：
```html
<li ng-repeat="item in list | filter:name">{{ item | json }}</li>

```

`$wilddogArray`服务也可以接受一个 `query` 来选择同步一部分数据。

HTML：
```html
<li ng-repeat="item in list | filter:name">{{ item | json }}</li>
```
JavaScript：
```js
app.controller("MyCtrl", ["$scope", "$wilddogArray",
  function($scope, $wilddogArray) {
    var messagesRef = new Wilddog(URL).child("messages");
    var query = messagesRef.orderByChild("timestamp").limitToLast(10);

    var list = $wilddogArray(query);
  }
]);

<strong>注意：</strong>虽然数组元素自身不应被修改，但是它可以改变数组内的特定元素然后将这些改变同步到远程数据库：

JavaScript：
```js
var list = $wilddogArray(new Wilddog(URL));
list[2].foo = "bar";
list.$save(2);
```
HTML：
```html
<li ng-repeat="item in list">
  <input ng-model="item.foo" ng-change="list.$save(item)" />
</li>
```


#### $add(newData)

在数组中加入一个新的节点，同时同步到数据库和本地。

这个方法返回一个 `promise` 对象，完成之后返回新增的数据，

```js
var list = $wilddogArray(ref);
list.$add({ foo: "bar" }).then(function(ref) {
  var id = ref.key();
  console.log("added record with id " + id);
  list.$indexFor(id); // 返回 id 在 wilddogArray 对象中的位置
});
```


#### $remove(recordOrIndex)

从数据库和本地 Array 对象中删除一个节点，返回一个 `promise` 对象，在服务端完成删除操作后返回被删除的节点对象，此方法的参数可以是节点在数组中的索引或者节点的 `Wilddog` 引用。

```js
var list = $wilddogArray(ref);
var item = list[2];
list.$remove(item).then(function(ref) {
  ref.key() === item.$id; // true
});
```

#### $save(recordOrIndex)

数组自身虽然不能被改变，但是其中的节点可以单独更新并且同步到数据库，这个方法会将本地现有的改变同步到数据库，接受参数可以是节点在数组中的索引或者节点的引用。

返回一个 `promise` 对象，在数据完成服务端存储后返回更新节点的 `Wilddog` 引用。

```
$scope.list = $wilddogArray(ref);
<li ng-repeat="item in list">
  <input type="text" ng-model="item.title" ng-change="list.$save(item)" />
</li>

var list = $wilddogArray(ref);
list[2].foo = "bar";
list.$save(2).then(function(ref) {
  ref.key() === list[2].$id; // true
});
```


#### $getRecord(key)

返回数组中带有 key 值的节点，如果没有找到 key 对应的节点则返回 null ，该方法利用 `$indexFor(key)` 来查找相应的节点。

```js
var list = $wilddogArray(ref);
var rec = list.$getRecord("foo"); // record with $id === "foo" or null
```


#### $keyAt(recordOrIndex)

返回参数中的节点在数组中的 key 值，接受参数可以是节点在数组中的索引或者节点的引用。

```js
// 假设节点有 "alpha", "bravo" 和 "charlie"
var list = $wilddogArray(ref);
list.$keyAt(1); // bravo
list.$keyAt( list[1] ); // bravo
```


#### $indexFor(key)

是 `$keyAt()` 的逆操作，返回参数中节点在数组中的索引，如果数组中不存在此节点，返回 -1。

```js
// 假设节点有 "alpha", "bravo" 和  "charlie"
var list = $wilddogArray(ref);
list.$indexFor("alpha"); // 0
list.$indexFor("bravo"); // 1
list.$indexFor("zulu"); // -1
```


#### $loaded()

返回一个 `promise` 对象，当数据下载完成时返回 $wilddogArray 对象。

```js
var list = $wilddogArray(ref);
list.$loaded()
  .then(function(x) {
    x === list; // true
  })
  .catch(function(error) {
    console.log("Error:", error);
  });
```

 resolve 和 reject 方法可以简化为：

```js
var list = $wilddogArray(ref);
list.$loaded(
  function(x) {
    x === list; // true
  }, function(error) {
    console.error("Error:", error);
  });
```


#### $ref()

此方法返回生成当前对象的 `Wilddog` 引用。

```js
var list = $wilddogArray(ref);
sync === list.$ref(); // true
```


#### $watch(callback [, context])

每次数据库有数据的更新都会调用回调函数， callback 接收一个对象，参数如下

* `event` :  数据库的数据发生变化的事件（`child_added` ， `child_moved` ， `child_removed` ， `child_changed`）
* `key` : 发生变化的数据的 id
* `prevChild` : 如果是 `child_added` 或 `child_moved` 事件，包含上一个节点的名称，如果此节点是集合中的第一个节点就是null

```js
var list = $wilddogArray(ref);

list.$watch(function(event) {
  console.log(event);
});

// logs { event: "child_removed", key: "foo" }
list.$remove("foo");

// logs { event: "child_added", key: "<new _id>", prevId: "<prev_id>" }
list.$add({ hello: "world" });
```

一个常见的用例是定制一个同步的数组的排序。由于每次从数据库添加或更新数据，数据的排列顺序都会有改变，我们需要在每个事件之后重新进行排列，我们不必担心因为过度的重新排列会让 `Angular` 的编译进程变慢或者过度创建 DOM 更新，因为事件已经分批处理成为单一的 `$apply` 事件（在 `$digest` 进行脏检查之前我们先把它们收集成起来并分批绑定事件）：

```js
var list = $wilddogArray(ref);

// 为获取到的数据排序
list.sort(compare);

// 每次从服务端获取到数据都进行重排
list.$watch(function() { list.sort(compare); });

// 自定义排序规则 (根据 name 排序)
function compare(a, b) {
  return a.lastName.localeCompare(b.lastName);
}
```


#### $destroy()

停止事件监听并清空 array 对象的占用内存（清空本地副本），不再同步远程数据库。










































