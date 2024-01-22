# Script Boot

## Description

## Feature

## Usage

- @ScriptBootApplication: The Entrypoint of the application.
  1. Scan and load all files.
  2. Instantiate Main and then call main().

- @Bean: The annotation to mark a class as bean, then save this class to the bean factory.
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

- @Autowired: The implementation of Dependency Injection and Inversion of Control. @Bean stores class in Factory immediately, @Autowired set getter to property, which gets class from Factory later when the property is called.
  1. Get the type (Factory class) of the property by Reflect.getMetadata().
  2. Set the getter function to this property by Object.defineProperty().
  3. When the property is called, get bean from Factory.

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

- ExpressServer: Using Express.js to create a server, and import middlewares.

- Log: Using tracer to implements custom log.

- @OnClass: put object to the BeanFactory.objectMapper.

- @Before / @After: To do something before/after the method is called, which is so called AOP(Aspect Oriented Programming).
  1. get the bean object.
  2. get the current method of bean object.
  3. override the method, do something before the method is called, and then call the method.

- @Request, @Response, @RequestQuery, @RequestBody, @RequestForm, @Next
  1. get and directly return the value.

- Template Engine: Use Consolidate and Mustache as Template Engine to SSR.

- @Value: Just like @Autowired, but it inject string config to param, and fetches the config from .env file rather than from Factory.
  1. get the value from config.
  2. 2. set the value to the property, which will return the value from config when the property is called.

- @Upload: Upload file to the server.

- @Jwt: Using jsonwebtoken to create jwt token.

- 404 & 500 pages 

- Global Authentication

- @Select, @Insert, @Update, @Delete: Using sql to operate database.

- SQL Injection: don't trust any input text, which may cause injection problem. Use sql-template to escape the input text.