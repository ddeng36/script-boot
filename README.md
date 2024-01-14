# Script Boot

## Description

## Feature

## Usage

- @ScriptBootApplication: The Entrypoint of the application.
  1. Scan and load all files.
  2. Instantiate Main and then call main().
- @Bean: The annotation to mark a class as bean, then save this class to the bean factory.
- BeanFactory: The factory is a Map to store all beans. The bean in the factory would be the _last_ class that called the @Bean annotation.
  ```
  Map(2) {
    'ServerFactory' => [Function: getServer],
    'LogFactory' => [Function: createLog]
  }
  ```
- @Autowired: The implementation of Dependency Injection and Inversion of Control. @Bean stores class in Factory, @Autowired gets class from Factory.

  1. To get related Bean from Factory Bean Mapper.
  2. instantiate the object, and inject it to value;

- RouterMapper: Mapping the route to related callback function.
  ```
  { get: { '/first': [Function: cbFunc] }, post: {}, all: {} }
  ```
- @GetMapping(val: string):
- @PostMapping(val: string):
- @RequestMapping(val: string):

- ExpressServer: Using Express.js to create a server, and import middlewares.
- Log: Using tracer to implements custom log.
- @OnClass: initialize the class and put the bean object to the BeanFactory.
- @Before: To do something before the method is called.
  1. get the bean object.
  2. get the current method of bean object.
  3. override the method, do something before the method is called, and then call the method.
- @After: To do something after this function is called.
- @Request, @Response, @RequestQuery, @RequestBody, @RequestForm, @Next
- Template Engine: Use Consolidate and Mustache as Template Engine to SSR.