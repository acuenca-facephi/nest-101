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
