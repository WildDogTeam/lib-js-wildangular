
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

需要注意的是：不管任何时候，只要有其他数据存在，那么此条信息都会被忽略。如果我们需要把一个对象更改为基本类型的数据，我们需要先删除其他的数据，然后再将此数据添加到需要更改的数据下面。还有更简单的做法：

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
var obj = $wilddogObject(ref);
var unwatch = obj.$watch(function() {
  console.log("data changed!");
});

// 在不需要的时候，我们可以调用 unwatch 方法来停止对数据的监听
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
    var list = $wilddogArray(new wilddog(URL));

    // 增加一个节点
    list.$add({ foo: "bar" }).then(...);

    // 删除一个节点
    list.$remove(2).then(...);

    // 将数组的数据填充进 DOM 结构中
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
```
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

```js
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





## 扩展服务


有几种很有用的方法可以转化 `$wilddogObject` 和 `$wilddogArray` 下载或存储的数据。这些方法最好在对 `Angular` 十分了解的情况下使用。


#### $wilddogObject.$extend

你可以在 `wilddogObject` 之上构造一个新的服务，这项服务可以增加额外的方法或重写原有的方法。

```js
var ColorFactory = $wilddogObject.$extend({
  getMyFavoriteColor: function() {
    return this.favoriteColor + ", no green!";
  }
});

var factory = new ColorFactory(ref);
var favColor = factory.getMyFavoriteColor();
```
甚至可以改变以下私有方法来重写数据的存储和提交方式：

* $$updated : 在每次接收到数据库的 `value` 事件都会触发，发生任何变化都必须应用更新和返回 `true` ，调用时带有一个数据快照作为参数。
* $$error : 每次出错时传递一个错误信息，这些错误一般是不可恢复的。
* $$notify : 通过 `$watch()` 注册的一个方法，用来给每一个监听程序发送通知。
* toJSON : 如果某个对象提供了 `toJSON()` 方法，它将在数据保存到数据库之前调用 `JSON.srtingify()` 来解析 JSON 的内容。
* $$defaults : 如果在服务端没有查询到一条字段（未定义字段），那么它将为这条字段设置默认的 key / value 值。每次调用 `$$update` 时都会默认调用此方法，如果想要重写此方法，需要自己实现这种行为。


```js
// 为我们的对象添加一个计数器
var FactoryWithCounter = $wilddogObject.$extend({
  // 添加一个方法，这个方法返回我们的计时器
  getUpdateCount: function() { return this._counter; },

  // 每次服务端的更新到达，本地应用也会变化
  $$updated: function(snap) {
    // 绑定数据变化
    var changed = $wilddogObject.prototype.$$updated.apply(this, arguments);

    // 每次数据更新都给计数器一个增量
    if( !this._counter ) { this._counter = 0; }
    this._counter++;

    // 返回是否发生变化
    return changed;
  }
});
```


#### $wilddogArray.$extend

你可以在 `wilddogArray` 之上构造一个新的服务，这项服务可以增加额外的方法或重写原有的方法。

```js
app.factory("ArrayWithSum", function($wilddogArray) {
  return $wilddogArray.$extend({
    sum: function() {
      var total = 0;
      angular.forEach(this.$list, function(rec) {
        total += rec.x;
      });
      return total;
    }
  });
})
```

我们可以通过实例化来使用此服务：

```
var list = new ArrayWithSum(ref);
list.$loaded().then(function() {
  console.log("List has " + list.sum() + " items");
});
```
可以改变以下私有方法来重写数据的存储和提交方式：

* $$added : 每一次 `child_added` 事件触发都会调用此方法，参数中传入数据快照和上一节点。
* $$updated : 每一次 `child_changed` 事件触发都会调用此方法，参数中传入数据快照。
* $$moved : 每一次 `child_moved` 事件触发都会调用此方法，参数中传入数据快照和上一节点。
* $$removed : 每一次 `child_removed` 事件触发都会调用此方法，参数中传入数据快照。
* $$error : 每次出错时传递一个错误信息，这些错误一般是不可恢复的。
* $$getKey : 告诉 `Wildangular` 每一个字段的 ID （默认值返回 `this.$id`）。
* $$notify : 通过 `$watch()` 注册的一个方法，用来给每一个监听程序发送通知，这个方法一般不需要更改。
* $$process : 处理数据移出和移入数组，这个方法一般不需要更改。
* $$defaults : 如果在服务端没有查询到一条字段（未定义字段），那么它将为这条字段设置默认的 key / value 值。每次调用 `$$added` 或 `$$updated` 的时候，如果想要重写此方法，需要自己实现这种行为。


为了说明，我们创建一个用于创建控件实例的服务，并转换日期：

// 在我们的控件服务中返回一个对象
app.factory("Widget", function($wilddogUtils) {
  function Widget(snapshot) {
    // 存储字段 ID ，以便 WildAngular 能够识别
    this.$id = snapshot.key();

    // 数据应用
    this.update(snapshot);
  }

  Widget.prototype = {
    update: function(snapshot) {
      var oldData = angular.extend({}, this.data);

      // 将数据变化应用到 this.data 上，而不是直接应用到 `this` 上
      this.data = snapshot.val();

      // 为控件添加一个日期
      this._date = new Date(this.data.date);

      // 注意，不管有任何变化 angular.equals 都不会检查 $value 或 $priority（因为它排斥任何以 `$` 开头的数据）
      return !angular.equals(this.data, oldData);
    },

    getDate: function() {
      return this._date;
    },

    toJSON: function() {
      // 因为我们改变了我们的数据存储，我们需要告诉 WildAngular 怎么获取它的 JSON 版本
      //我们可以用 $wilddogUtils.toJSON() 来删除私有变量，将数据复制到正确的格式上，然后做验证
      return $wilddogUtils.toJSON(this.data);
    }
  };

  return Widget;
});

// 现在，我们用小部件来创建一个同步的数组服务
app.factory("WidgetFactory", function($wilddogArray, Widget) {
  return $wilddogArray.$extend({
    // 改变 `added` 的行为来返回部件对象
    $$added: function(snap) {
      // 在每次从服务端发来 `child_added` 事件我们都返回一个 Widget 实例，而不是直接创建一个普通的 JavaScript 对象
      return new Widget(snap);
    },

    // 调用 Widget.update() 来重写 update行为
    $$updated: function(snap) {
      // 正常情况下，我们需要返回 true / false ，否则 `$watch` 监听不会被触发
      // 幸运的是，我们的 Widget.prototype.update() 方法在有什么改变的时候都会返回一个布尔值
      return this.$getRecord(snap.key()).update(snap);
    }
  });
});


#### 通过一个类来扩展

除了只放一个 function 名单，我们还可以通过类的构造函数来继承 `$wilddogArray` 的方法，这个类的原型还是会被保存，并且将继承  `$wilddogArray`。

这是一个非常新的功能，除非你很确定需要用到它，否则不要使用。

这个类的构造函数将调用 `$wilddogArray` 的构造函数（即父类的构造函数）。

下面的服务添加了一个更新计数器，每次 `$$added()` 、 `$$updated` 被调用计数器都会增加：

```js
app.factory("ArrayWithCounter", function($wilddogArray, Widget) {
  // $wilddogArray 和 $wilddogObject 构造器都接受一个简单的参数 `Wilddog` ref
  function ArrayWithCounter(ref) {
    // 初始化
    this.counter = 0;

    // 调用父类的构造器
    return $wilddogArray.call(this, ref);
  }

  // 重新添加行为，返回一个 Widget
  ArrayWithCounter.prototype.$$added = function(snap) {
    return new Widget(snap);
  };

  // 调用Widget.update（）方法来重写 update 行为
  ArrayWithCounter.prototype.$$updated = function(snap) {
    var widget = this.$getRecord(snap.key());
    return widget.update();
  };

  // 扩展我们的构造函数到 `$extend`，它会自动提取原型方法并调用相应的构造函数
  return $wilddogArray.$extend(ArrayWithCounter);
});
```


#### 包装服务

在一般情况下，扩展原有的服务来创建新的服务会比使用这种技术更有用，但是它可以通过使用 Angular 的 `$decorate()` 方法来修改全局的 `$wilddogArray` 和 `$wilddogObject` 对象。

```js
app.config(function($provide) {
  $provide.decorator("$wilddogObject", function($delegate, $wilddogUtils) {
    var _super = $delegate.prototype.$$updated;

    // 重写所有 $wilddogObject 的实例，找到一个时间字段并将其转换为 Date 对象
    $delegate.prototype.$$updated = function(snap) {
      var changed = _super.call(this, snap);
      if( this.hasOwnProperty("date") ) {
        this._dateObj = new Date(this.date);
      }
      return changed;
    };

    // 为我们刚刚创建的日期对象添加一个方法
    $delegate.prototype.getDate = function() {
      return this._dateObj;
    };

    // 以 _ 开头的变量都会被 WildAngular 忽略，所以我们并不用考虑 toJSON 方法

    return $delegate;
  });
});
```





## 创建 WildAngular 服务


依靠扩展 WildAngular 的能力，我们可以用少量的代码来创建代表我们同步集合的服务，例如我们可以创建一个用户服务：

```js
// 创建一个 UserFactory，有一个 getFullName() 方法
app.factory("UserFactory", function($wilddogObject) {
  return $wilddogObject.$extend({
      getFullName: function() {
        // 连接姓氏和名字
        return this.first_name + " " + this.last_name;
      }
   });
});
```

创建一个新的实例：

```js
// 从我们的服务创建一个 User 对象
app.factory("User", function(UserFactory) {
  var ref = new Wilddog(URL+"/users/");
  return function(userid) {
    return new UserFactory(ref.child(userid));
  }
});
```

同样，我们可以通过创建一个 Message 对象来扩展 $wilddogArray 对象：

app.factory("Message", function($wilddogArray) {
  function Message(snap) {
    // 存储用户ID，WildAngular可以识别记录在这里，我们需要把它存储在一个自定义的位置，所以需要重写 $$getKey
    this.message_id = snap.key();
    this.message = snap.val();
  }
  Message.prototype = {
    update: function(snap) {
      // 存储一个字符串到 this.massage (而不是默认的 $value)
      if( snap.val() !== this.message ) {
        this.message = snap.val();
        return true;
      }
      return false;
    },
    toJSON: function() {
      // 告诉 WildAngular 需要存储的数据，在这里是一个字符串
      return this.message;
    }
  };

  return Message;
});

然后，我们可以用它来扩展 `$wilddogArray` 服务：

```js
app.factory("MessageFactory", function($wilddogArray, Message) {
  return $wilddogArray.$extend({
    // 重写 $createObject 行为，返回一个 Message 对象
    $$added: function(snap) {
      return new Message(snap);
    },

    // 调用 Message 上面的方法来重写 $$updated 行为
    $$updated: function(snap) {
      var msg = this.$getRecord(snap.key());
      return msg.update(snap);
    },

    // 我们的信息在一个特殊的位置存储了唯一ID，所以我们需要告诉 $wilddogArray 怎么找到每个字段的ID
    $$getKey: function(rec) {
      return rec.message_id;
    }
  });
});
```

最后，我们可以把所有信息放在一个同步列表中：

```js
app.factory("MessageList", function(MessageFactory) {
  return function(ref) {
    return new MessageFactory(ref);
  }
});
```





## 用户和认证


WildAngular包括用户认证和管理的 $wilddogAuth 服务支持。

var app = angular.module("app", ["wilddog"]);


### 身份验证服务构造器

$wilddogAuth服务需要 Wilddog 引用作为其唯一参数，需要注意的是，验证状态在整个应用中是全局的，不管你创建了多少 $wilddogAuth 对象。

```js
app.controller("MyAuthCtrl", ["$scope", "$wilddogAuth",
  function($scope, $wilddogAuth) {
    var ref = new Wilddog("https://<YOUR-WILDDOG-APP>.wilddogio.com");
    $scope.authObj = $wilddogAuth(ref);
  }
]);
```

由 $wilddogAuth 返回的认证对象包含几个方法，用来验证用户、应对变化的验证状态、验证状态和管理账户是 email/password 的用户。



#### $authWithCustomToken(authToken[, options])

验证使用自定义身份验证 token 的客户端。该函数有两个参数：一个认证 token 或一个 Wilddog Secret 和包含可选的客户端参数，如配置会话持久性的对象。

```js
$scope.authObj.$authWithCustomToken("<CUSTOM_AUTH_TOKEN>").then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
```

该方法返回一个 `promise` 对象，如果成功数据会包含身份验证 token 的 payload 的对象，如果失败，数据包含一个 Error 对象。

如果想了解更多关于生成自定义身份验证 token 的细节，请阅读我们的 [终端用户认证]: https://z.wilddog.com/web/guide/7 "auth"。


#### $authWithPassword(credentials[, options])

验证使用 email/pasword 的客户端。这个函数包含两个参数：包含用户账户的电子邮箱地址和密码属性，并包含可选的客户端参数，比如配置会话持久性的对象。

```js
$scope.authObj.$authWithPassword({
  email: "my@email.com",
  password: "mypassword"
}).then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
```

该方法返回一个 `promise` 对象，成功之后数据会包含有关登录用户的验证数据的对象，如果失败，包含一个 Error 对象。

如果想了解更多关于 email/password 验证的细节，请阅读我们的 [终端用户认证]: https://z.wilddog.com/web/guide/7 "auth"。


#### $authWithOAuthPopup(provider[, options])

使用一个弹出层来验证客户端。此方法包含两个参数：OAuth 提供用来验证的唯一字符串（如："weibo"），并包含可选的客户端参数，如配置会话持久性的对象。

```js
$scope.authObj.$authWithOAuthPopup("weibo").then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
```

该方法返回一个 `promise` 对象，成功之后数据会包含有关登录用户的身份验证数据的对象，如果失败，包含一个 Error 对象。

Wilddog 目前支持微信、微博和 QQ 的验证，如果想了解更多关于终端用户认证的细节，请阅读我们的 [终端用户认证]: https://z.wilddog.com/web/guide/7 "auth"。


## $authWithOAuthRedirect(provider[, options])

使用基于重定向的 OAuth 流来验证客户端。此方法包含两个参数：OAuth 提供用来验证的唯一字符串（如："weibo"），并包含可选的客户端参数，如配置会话持久性的对象。

```js
$scope.authObj.$authWithOAuthRedirect("weibo").then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
```

改方法返回一个 `promise` 对象，成功之后数据包含有关登录用户的身份验证数据对象，如果不成功，包含一个 Error 对象。

Wilddog 目前支持微信、微博和 QQ 的验证，如果想了解更多关于终端用户认证的细节，请阅读我们的 [终端用户认证]: https://z.wilddog.com/web/guide/7 "auth"。


#### $authWithOAuthToken(provider, credentials[, options])

验证使用 OAuth 访问 token 或凭证的客户端，此方法包含三个参数：OAuth 提供用来验证的唯一字符串（如："weibo"），一个字符串，如 OAuth2.0 的访问 token，或者一个 key/value 对象，如如一组 OAuth1.0 的凭据，菜以及包含可选的客户端参数，如配置会话持久性的对象。

 ```js
$scope.authObj.$authWithOAuthToken("weibo", "<ACCESS_TOKEN>").then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Authentication failed:", error);
});
 ```
该方法返回一个 `promise` 对象，成功之后数据包含有关登录用户的身份验证数据的对象，失败则返回包含 Error 信息的对象。

Wilddog 目前支持微信、微博和 QQ 的验证，如果想了解更多关于终端用户认证的细节，请阅读我们的 [终端用户认证]: https://z.wilddog.com/web/guide/7 "auth"。


#### $getAuth()

同步检索该客户端当前的验证状态。如果用户通过验证，返回含有 uid（唯一用户ID）、提供商（字符串）、auth（认证 token 的 payload），还有过期时间（使用 unix时间戳表示）等，返回值取决于用来验证的提供商，如果不通过，返回null。

```js
var authData = $scope.authObj.$getAuth();

if (authData) {
  console.log("Logged in as:", authData.uid);
} else {
  console.log("Logged out");
}
```


#### $onAuth(callback[, context])

监听客户端的用户登录状态变化，当登录状态发生改变就会触发回调函数。如果通过身份验证，回调函数的参数会是一个包含 uid（唯一用户ID）字段、提供商（字符串）、auth（身份验证 token 的 payload）以及到期时间（用 unix时间戳表示）等，返回值取决于用来验证的提供商，如果不通过，回调函数参数为空。

```js
$scope.authObj.$onAuth(function(authData) {
  if (authData) {
    console.log("Logged in as:", authData.uid);
  } else {
    console.log("Logged out");
  }
});
```
这个方法还有一个可选参数，如果写入第二个参数，在回调时可以使用此参数。

这个方法还会返回一个用来注销登录的函数，如果回调函数未注册，那么任何的用户认证状态的改变都不会触发回调。


#### $unauth()

注销客户端与 Wilddog 数据库的连接，这个方法没有任何参数和返回值，当注销事件触发时， `$onAuth` 的回调函数也将会被触发。

```html
<span ng-show="authData">
  {{ authData.name }} | <a href="#" ng-click="authObj.$unauth()">Logout</a>
</span>
```

#### $waitForAuth()

当满足当前认证状态时，返回一个 `promise` 对象，这个方法一般用于 Angular routers 的 resolve() 方法。


#### $requireAuth()

如果用户已经通过身份验证，它会在满足当前认证状态时返回一个 `promise` 对象，这个方法是为了在使用 Abgular routers 的 resolve() 时，不让未登录的用户看见只有登录用户才能看见的页面。


#### $createUser(credentials)

使用 email/password 组合创建一个新用户，返回一个 `promise` 对象，完成后数据包含了新建用户的用户信息的一个对象，目前，此对象只包含所创建用户的 uid。

```js
$scope.authObj.$createUser({
  email: "my@email.com",
  password: "mypassword"
}).then(function(userData) {
  console.log("User " + userData.uid + " created successfully!");

  return $scope.authObj.$authWithPassword({
    email: "my@email.com",
    password: "mypassword"
  });
}).then(function(authData) {
  console.log("Logged in as:", authData.uid);
}).catch(function(error) {
  console.error("Error: ", error);
});
```

需要注意的是，该方法只用于创建用户。如果想为新创建的用户登录，需要等到 promise 对象操作完成之后再调用 `$authWithPassword()` 方法。


#### $changeEmail(credentials)

改变使用 email/password 组合登录的现有用户的 email。该方法返回一个 `promise` 对象，当数据库的 email 被改变后执行后续操作。

```js
$scope.authObj.$changeEmail({
  oldEmail: "my@email.com",
  newEmail: "other@email.com",
  password: "mypassword"
}).then(function() {
  console.log("Email changed successfully!");
}).catch(function(error) {
  console.error("Error: ", error);
});
```


#### $removeUser(credentials)

删除一个使用 email/password 登录的用户，返回一个 `promise` 对象，当数据库中此用户被删除之后执行后续操作。

```js
$scope.authObj.$removeUser({
  email: "my@email.com",
  password: "mypassword"
}).then(function() {
  console.log("User removed successfully!");
}).catch(function(error) {
  console.error("Error: ", error);
});
```

<strong>注意：</strong>删除用户会使此用户从客户端下线，所以会触发已经注册的所有 onAuth() 的回调函数。


#### $resetPassword(credentials)

发送密码重置的邮件到账户所有者，邮件包含用于验证和更改用户密码的 token ，返回一个 `promise` 对象，当电子邮件通知成功发出后执行后续操作。



























