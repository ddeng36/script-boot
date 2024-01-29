# Script Boot

## Description

## Feature

## Usage


TODO
Instance Management, Database Operation, Router Management, Service, Test & Publication

TODO
How to use reflect-metadata
```
  ts-node tutorial-decorator.ts
```
How to use event-emitter
```
  ts-node tutorial-eventEmitter.ts
```
- @RedisSubscriber: Subscribe to Redis channel.
- @SocketIO: enable Socket.IO between client and server.

- @ScriptBootApplication: The Entrypoint of the application.
  1. Scan and load all files.
  2. Instantiate Main and then call main().

- @Bean: The annotation to mark a Factory class as Bean, then put this Bean into BeanFactoryMapper
  1. Get the return type of the method in class.
  2. new the object of the return type.
  3. save the object to the bean factory.

- BeanFactory: The factory is a Map to store all beans. The bean in the factory would be the _last_ class that called the @Bean annotation.
  ```
  Map(3) {
    'AuthenticationFactory' => {
      target: AuthenticationFactory {},
      propertyKey: 'getAuthentication',
      factory: DefaultAuthentication {}
    },
    'ServerFactory' => {
      target: ServerFactory {},
      propertyKey: 'getServer',
      factory: ExpressServer { middlewareList: [], app: [Function] }
    },
    'LogFactory' => { target: {}, propertyKey: 'createLog', factory: LogDefault {} }
  }
  ```

- @Inject: **Only for Factory Bean**, **Design pattern: Singleton**, **Without parameters**. The implementation of Dependency Injection and Inversion of Control. @Bean stores class in Factory immediately, @Inject set getter to property, which gets class from Factory later when the property is called.
  1. Get the type (Factory class) of the property by Reflect.getMetadata().
  2. Set the getter function to this property by Object.defineProperty().
  3. When the property is called, get bean from Factory.
- @Autowird/@Resource: **Directly new a object with parameters**,**Design pattern: Singleton**. The implementation of Dependency Injection and Inversion of Control.

- RouterMapper: Mapping the route to related callback function.
```
  {
    get: {
    '/first': {
      path: '/first',
      name: 'FirstPage#index',
      invoker: [Function: invoker]
    }
  },
  post: {
    '/request/body': {
      path: '/request/body',
      name: 'TestRequest#testBody',
      invoker: [Function: invoker]
    }
  },
  all: {}
}
```

- @GetMapping(path: string) / @PostMapping(path: string) / @RequestMapping(path: string): call relative cb function according to the path.
  1. These 3 decorator will call same function -> mapperFunction.
  2. get the original function and save it in cb.
  3. put cb into routerMapper according to the method and path.
  4. setRouter() will bind every callback function(invoker, a kind of middleware) and middlewares in routerMapper to the app.

- ExpressServer: Using Express.js to create a server, and import middlewares.

- Log: Using tracer to implements custom log.

- @OnClass/@Controller: put object to the BeanFactory.objectMapper.

- @Before / @After: To do something before/after the method is called, which is so called AOP(Aspect Oriented Programming) and Proxy Pattern. If a method has @Before and @After , then the @Before is the proxy of this method, and @After is the proxy of @Before.
  1. get the bean object.
  2. get the current method of bean object.
  3. override the method, do something before/after the method is called, and then call the original method.

- @Request, @Response, @RequestQuery, @RequestBody, @RequestForm, @Next
  1. store the value in routerParamMap
  2. mapperFunction() will bind the value of decorator on the param of cb function.
- RouterParamMap: a map to store the value of request.
```
  routerParams <- { "FirstPage,index,0" : (req, res, next) => req}
```

- Template Engine: Use Consolidate and Mustache as Template Engine to SSR.

- @Value: Just like @Autowired, but it inject string config to param, and fetches the config from .env file rather than from Factory.
  1. get the value from config.
  2. 2. set the value to the property, which will return the value from config when the property is called.

- @Upload: Upload file to the server.

- @Jwt: Using jsonwebtoken to create jwt token.JWT and Upload will set callback function in routerMiddleware, while setRouter() will bind the callback function to app.

- 404 & 500 pages 

- Global Authentication

- @Select, @Insert, @Update, @Delete: Using sql to operate database.
  1. Turn the function it'self into a sqlQuery function by setting descriptor.value.
  2. Call the sqlQuery function to replace the sql template with the param.
  3. Execute the sql query and return the result.

- SQL Injection: don't trust any input text, which may cause injection problem. Use sql-template to escape the input text.
```
  Not OK - concat string: sql = "Select * from `check_user` where `name` = '" + req.query.name + "' and `password` = '" + req.query.password + "'";
  OK - parameter binding: @Insert("Insert into `user` (id, name) values (#{id}, #{name})")
```
- @ResultType: set the result type of sql query.
  1. set the result type of sql query and new dto into resultTypeMap.(In @Select, we have to create a new object by Object.create() to avoid the same reference, even if we have new object in @ResultType.)
  2. when selecting data, use the result type to transform the result.
- resultTypeMap: a map to store the result type of sql query.
Insert, Update, Delete could affect the database, so the result of Select in the cache may not be the latest data. We should flush the cache when we insert, update or delete data.
```
  Map => 
    "TestDatabase,findUsers", {id: undefined, name: undefined}
```
- tableVersionMap: Improve the flush cache function.We can save table name and version in tableVersionMap. Every time we insert, update or delete data, the version of table will be increased by 1. So when selecting data, we can check the version of table and compare it with the version in tableVersionMap. If they are not equal, then flush.
```
  Map(1) { 'user' => 2 }
```
@Cache: To cache the result of sql query. We could use this Decorator to cache the result of sql query, or we can directly use the cache in service by calling setCache() and getCache().

ORM: Object Relational Mapping, map the object to table. Developers don't need to write sql query. It's different from @Select, because it's not a sql query.

Data Source: Single Master, Mater-Slave, Master-MultiSlaves. Master is responsible for write, Slaves are responsible for read. Master will sync data to Slaves.
Connection Pool: When connection to db is created, it will be put into the pool. When we need to use db, we can get a connection from the pool and then execute sql query. If connection pool don't have enough connection, it will create a new one. The whole process decrease the time of connection.

- @RabbitListener: get the channel and listen to the messages.