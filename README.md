# backend en nest

``````
docker compose up -d
``````

activar el docker desktop

poner 
    MongooseModule.forRoot('mongodb://localhost:27017'),
    en app.module 
esto en caso de variable de entorno mas descripcion en el formato 
ConfigModule.forRoot()

copiar el ```.env.template``` y renombrarlo a ```.env```