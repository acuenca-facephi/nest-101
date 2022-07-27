# nest-101
Exercise to learn about NestJS, a Node framework.

## NestJS CLI
[***Documentation***](https://docs.nestjs.com/cli/overview)

### Installation
`npm i -g @nestjs/cli`

### Setup & manage projects
* `nest new {projectName} --strict`  
    The "*--strict*" flag is an optional choice if you want to turn on the TypeScript strict mode.
* `nest g resource {controllerName}`  
    Creates a CRUD controller with the [validation](https://docs.nestjs.com/techniques/validation) built-in.
* `npm run start:dev`  
    Launch the app
* `npm install --save @nestjs/swagger`  
    Install Swagger. Add the following code to **_main.ts_**
    ```
    const options = new DocumentBuilder()
        .setTitle('Nest 101 Transactions')
        .setDescription('Nest 101 Transactions exercise')
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    ```
