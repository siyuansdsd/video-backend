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
CLIENT_URL=
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
