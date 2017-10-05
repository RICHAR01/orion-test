/*
*   Esto se encarga de crear los modelos conectados a su datasource en base a los schemas json.
*   Y guardarlos en app.
*/

import glob from 'glob'
import { find } from 'lodash';
import mongodbConnector from './mongodb-connector';
import datasources from '../config/datasources'

export async function initSources (app) {

  // Note: Obtener rutas de los archivos de eschemas
  glob(`${__dirname}/../src/models/*.json`, {  }, (err, schemaRoutes) => {
    if (err) { throw err }

    const models = {};

    schemaRoutes.forEach(async (schemaRoute) => {
      const modelSchema = require(schemaRoute);

      // TODO: Mandar conexion creada en lugar de datasource data.

      // Note: Encontrar datasource del modelSchema
      const schemaDatasource = find(datasources, { 'name': modelSchema.datasource });

      // Note: Usamos el connector de mongo
      if (schemaDatasource.store === 'mongodb') {
        models[modelSchema.name] = new mongodbConnector(modelSchema, schemaDatasource);
      }

      // Note: Testeo de cada modelo recien creado
      /*
      const savedResponse = await models[modelSchema.name].save({ title: (new Date).getTime() });
      console.log('savedResponse:', savedResponse);

      const findResponse = await models[modelSchema.name].find();
      console.log('findResponse:', findResponse);
      */

    });

    for (let modelName in models) {
      models[modelName].models = models;
    }

    // Note: Al terminar de crear los modelos los guardamos en app
    app.models = models;
  });
}
