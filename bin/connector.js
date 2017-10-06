/*
*   Esto se encarga de crear los modelos conectados a su datasource en base a los schemas json.
*   Y guardarlos en app.
*/

import glob from 'glob';
import _ from 'lodash';
import mongodbConnector from 'mongodb-connector';
import datasources from '../config/datasources';

export async function initSources (app) {

  // Note: Obtener rutas de los archivos de schemas
  glob(`${__dirname}/../src/models/*.json`, {  }, (err, schemaRoutes) => {
    if (err) {
      throw err;
    }

    const models = {};
    const datasourceNames = [];
    const datasourceConnections = {};
    let schemaDatasource;

    schemaRoutes.forEach(async (schemaRoute) => {
      const modelSchema = require(schemaRoute);
      schemaDatasource = _.find(datasources, { 'name': modelSchema.datasource });

      // Note: Por cada datasource crea sólo una conexión
      if (datasourceNames.indexOf(modelSchema.datasource) === -1) {
        datasourceNames.push(modelSchema.datasource);

        if (schemaDatasource.store === 'mongodb') {
          datasourceConnections.mongodb = mongodbConnector.createConnection(schemaDatasource);
        }
      }

      // Note: Usamos el connector de mongo
      if (schemaDatasource.store === 'mongodb') {
        models[modelSchema.name] = new mongodbConnector.model(modelSchema, datasourceConnections.mongodb);
      }

    });

    for (const modelName in models) {
      models[modelName].models = models;
    }

    // Note: Al terminar de crear los modelos los guardamos en app
    app.models = models;
  });
}
