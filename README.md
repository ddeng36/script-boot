# Script Boot 

## Description 

## Feature

## Usage 
- @App: The Entrypoint of the application.
  1. Scan and load all files.
  2. Instantiate Main and then call main().
- @Bean: The annotation to mark a class as bean, then save this class to the bean factory.
- BeanFactory: The factory is a Map to store all beans. The bean in the factory would be the *last* class that called the @Bean annotation. 
  ```
  Map(2) {
    'ServerFactory' => [Function: getServer],
    'LogFactory' => [Function: createLog]
  }
  ```
- ExpressServer: Using Express.js to create a server, and import middlewares.
