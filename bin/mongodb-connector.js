/*
* La idea de esto es generar una interface estandar para consultas
*/

'use strict';
import mongoose from 'mongoose'

class MongodbConnector {
  constructor(schema, datasource) {

    // Note: Se crea conexion
    this.connection = mongoose.createConnection(datasource.url);

    // TODO: Generar schema de mongoose en base a esquema estandar recibido.
    // De momento se usa esquema mongoose estático.
    const dummySchema = new mongoose.Schema({
      title: { 
        type : String, 
        default : 'title no especificado' 
      }
    })

    // Note: Crear modelo mongoose para peticiones
    this.model = this.connection.model(schema.name, dummySchema);
  }

  async find(filter) {
    // TODO: definicion de filtro estandarizado
    const users = await this.model.find({})
    return Promise.resolve(users);
  }

  async save(modelito) {
    const users = await this.model.create(modelito)
    return Promise.resolve(users);
  }

  // // idea
  // update(propertiesToUpdate) {
  //   // this.model extend propertiesToUpdate
  //   this.model.update();
  // }
}

module.exports = MongodbConnector;