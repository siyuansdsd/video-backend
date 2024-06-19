# Video Backend Project

## Technologies Used

This is backend build in following technics:

- [TypeScript](https://github.com/microsoft/TypeScript)

- [Express](https://github.com/expressjs/express)

- [PostgreSQL](https://github.com/postgres/postgres)

- [AWS_SDK](https://github.com/aws/aws-sdk)

- [TypeORM](https://github.com/typeorm/typeorm)

- [fluent_ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

- [JWT]

- [bcryptjs]

- [Docker]

- [RESTful]

## Getting Started

1. Before start, you should have:
   1.Already installed docker on your machine
   2.Already had an AWS account

2. Clone the repository to your local machine.

3. Install the project dependencies by running:

```bash
$ npm install
```

4. Create an env file, and it should contained:
   you can copy from [.env.example]('/.env.example')

```txt
JWT_SECRET=
JWT_REFRESH_SECRETE=
JWT_EMAIL_SECRET=
EMAIL_ADDRESS=
EMAIL_PASSWORD=
EMIAL_HOST=
CLIENT_URL=http://localhost:4200
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

5. Setup DB
   You should run:

```bash
$ npm run init:db
```

you will see that video-postgres Started

6. Start Backend

you should run:

```bash
$ npm run start:dev
```

## Unit Test

1. Start test

if you want see coverage, please run this command:

```bash
$ npm run test:cov
```

elif you just want to run test:

```bash
$ npm run test
```

2. Current unit test Quality(Coverage)

If your test result is not the same as the following one, please contact me, I will help
you find the reasons caused the differences.

```txt
=============================== Coverage summary ===============================
Statements   : 98.84% ( 341/345 )
Branches     : 92.85% ( 39/42 )
Functions    : 97.59% ( 81/83 )
Lines        : 98.71% ( 308/312 )
================================================================================
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   98.84 |    92.85 |   97.59 |   98.71 |
 controllers/auth         |     100 |      100 |     100 |     100 |
  auth.controller.ts      |     100 |      100 |     100 |     100 |
 controllers/video_file   |     100 |      100 |     100 |     100 |
  videoFile.controller.ts |     100 |      100 |     100 |     100 |
 service/auth             |     100 |      100 |     100 |     100 |
  auth.service.ts         |     100 |      100 |     100 |     100 |
 service/aws              |     100 |       80 |     100 |     100 |
  aws.service.ts          |     100 |       80 |     100 |     100 | 53
 service/email            |     100 |      100 |     100 |     100 |
  email.service.ts        |     100 |      100 |     100 |     100 |
 service/user             |     100 |      100 |     100 |     100 |
  user.service.ts         |     100 |      100 |     100 |     100 |
 service/video_file       |   92.59 |        0 |    87.5 |   92.15 |
  videoFile.service.ts    |   92.59 |        0 |    87.5 |   92.15 | 40,61,68,73
--------------------------|---------|----------|---------|---------|-------------------
```
