/*
* La idea de esto es generar una interface estandar para consultas
*/
// TODO: Agregar valor default a modelos con fn
// Todo: se puede hacer dinamico el id falsamente asi como esta el _id -> id
// TODO: if (spec === 'between') {
//       query[k] = { $gte: cond[0], $lte: cond[1] };
      // } else if (spec === 'like') {
      //   query[k] = { $regex: new RegExp(cond, options) };
      // } else if (spec === 'nlike') {
      //   query[k] = { $not: new RegExp(cond, options) };
      // } else if (spec === 'neq') {
      //   query[k] = { $ne: cond };
      // } else if (spec === 'regexp') {
      //   if (cond.global)
      //     console.warn('MongoDB regex syntax does not respect the `g` flag');

      //   query[k] = { $regex: cond };

'use strict';
import mongoose from 'mongoose'

class MongodbConnector {
  constructor(schemaStandar, datasource) {
    console.log('schemaStandar.name:', schemaStandar.name);
    const connection = this.createConnection(datasource);
    const modelSchema = this.generateModelSchema(schemaStandar.properties);
    this.model = connection.model(schemaStandar.name, modelSchema);
  }

  createConnection(datasource) {
    return mongoose.createConnection(datasource.url || this.generateMongoDBURL(datasource));
  }

  generateMongoDBURL(options) {
    options.hostname = (options.hostname || options.host || '127.0.0.1');
    options.port = (options.port || 27017);
    options.database = (options.database || options.db || 'test');
    var username = options.username || options.user;
    if (username && options.password) {
      return 'mongodb://' + username + ':' + options.password + '@' + options.hostname + ':' + options.port + '/' + options.database;
    } else {
      return 'mongodb://' + options.hostname + ':' + options.port + '/' + options.database;
    }
  }

  generateModelSchema(schema) {
    let mongooseSchema = {};
    let propertyType;
    let propertyRequired;

    for (let property in schema) {
      switch(schema[property].type.toLowerCase()) {
        case 'string':
          propertyType = String;
          break;
        case 'number':
          propertyType = Number;
          break;
        case 'date':
          propertyType = Date;
          break;
        case 'boolean':
          propertyType = Boolean;
          break;
        case 'array':
          propertyType = Array;
          break;
        case 'object':
          propertyType = Object;
          break;
        default: 
          console.log('Not supported property type');
          return;
      }

      propertyRequired = schema[property].required ? true : false;

      mongooseSchema[property] = { type: propertyType , required: propertyRequired };
      if (schema[property].default) {
        mongooseSchema[property].default = schema[property].default;
      }
    }

    const modelSchema = new mongoose.Schema(mongooseSchema, { versionKey: false });

    this.setTransform(modelSchema);

    return modelSchema;
  }

  setTransform(mongooseSchema) {
    let transform;
    if (mongooseSchema.options.toJSON && mongooseSchema.options.toJSON.transform) {
      transform = mongooseSchema.options.toJSON.transform;
    }

    //Set toJSON handler
    mongooseSchema.options.toJSON = {
      transform(doc, ret) {

        if (ret._id && typeof ret._id === 'object' && ret._id.toString) {
          if (typeof ret.id === 'undefined') {
            ret.id = ret._id.toString();
          }
          delete ret._id;
        }

        //Call custom transform if present
        if (transform) {
          return transform(doc, ret);
        }
      },
    };


    transform = null;
    if (mongooseSchema.options.toObject && mongooseSchema.options.toObject.transform) {
      transform = mongooseSchema.options.toObject.transform;
    }

    //Set toObject handler
    mongooseSchema.options.toObject = {
      transform(doc, ret) {

        if (ret._id && typeof ret._id === 'object' && ret._id.toString) {
          if (typeof ret.id === 'undefined') {
            ret.id = ret._id.toString();
          }
          delete ret._id;
        }

        //Call custom transform if present
        if (transform) {
          return transform(doc, ret);
        }
      },
    };
  }

  renameProperties(sourceObj, replaceList, destObj) {
    destObj = destObj || {};

    Object.keys(sourceObj).forEach((key) => {
        
      if (sourceObj[key] instanceof Array) {

        if (replaceList[key]) {
          var newName = replaceList[key];
          destObj[newName] = [];
          this.renameProperties(sourceObj[key], replaceList, destObj[newName]);
        } else if (!replaceList[key]) {
          destObj[key] = [];
          this.renameProperties(sourceObj[key], replaceList, destObj[key]);
        }
          
      } else if (typeof sourceObj[key] === 'object') {
        if (replaceList[key]) {
          var newName = replaceList[key];
          destObj[newName] = {};
          this.renameProperties(sourceObj[key], replaceList, destObj[newName]);
        } else if (!replaceList[key]) {
          destObj[key] = {};
          this.renameProperties(sourceObj[key], replaceList, destObj[key]);
        }
          
      } else {
        if (replaceList[key]) {
          var newName = replaceList[key];
          destObj[newName] = sourceObj[key];
        } else if (!replaceList[key]) {
          destObj[key] = sourceObj[key];
        }
      }

    });
      
    return destObj;
  }

  transformFilter(filter) {
    const replaceList = {
      id: '_id', // for mongodb
      and: '$and',
      or: '$or',
      gt: '$gt',
      gt: '$gt',
      lt: '$lt',
      lte: '$lte',
      inq: '$in',
      nin: '$nin',
      neq: '$ne',
      regexp: '$regex',
      regexOpt: '$options'
    };
    return this.renameProperties(filter, replaceList)
  }

  buildQuery(type, filter, where, id) {
    if (filter) filter = this.transformFilter(filter || {});
    if (where) where = this.transformFilter(where || {});

    let findQuery = this.model;

    switch (type) {
      case('count'): 
        findQuery = findQuery.count(where);
        break;
      case('find'): 
        findQuery = findQuery.find(filter ? filter.where : undefined);
        break;
      case('findOne'):    
        findQuery = findQuery.findOne(filter ? filter.where : undefined);
        break;
      case('findById'):    
        findQuery = findQuery.findById(id);
        break;
      default: 
        console.log('Not supported query type');
        return;
    }

    if (['find','findOne', 'findById'].indexOf(type) !== -1 
        && filter) {
      if (filter.order && filter.order.field && filter.order.criteria) {
        const order = {}
        order[filter.order.field] = filter.order.criteria;
        findQuery = findQuery.sort(order);
      }
      if (filter.skip) findQuery = findQuery.skip(filter.skip);
      if (filter.limit) findQuery = findQuery.limit(filter.limit);
      if (filter.fields) findQuery = findQuery.select(filter.fields);
    }

    return findQuery;

  }

  // Interface methods

  async count(where) {
    const countQuery = this.buildQuery('count', null, where);
    const count = await countQuery.exec();
    return Promise.resolve(count);
  }

  async find(filter) {
    const findQuery = this.buildQuery('find', filter);
    const results = await findQuery.exec();
    return Promise.resolve(results);
  }

  async findOne(filter) {
    const findQuery = this.buildQuery('findOne', filter);
    const results = await findQuery.exec();
    return Promise.resolve(results);
  }

  async findById(id, filter) {
    const findQuery = this.buildQuery('findById', filter, null, id);
    const results = await findQuery.exec();
    return Promise.resolve(results);
  }

  async create(modelito) {
    const users = await this.model.create(modelito)
    return Promise.resolve(users);
  }

  async destroyAll(where) {
    where = this.transformFilter(where);
    const deleteResponse = await this.model.deleteMany(where);
    const response = { count: deleteResponse.toJSON().n };
    return Promise.resolve(response);
  }

  async destroyById(id) {
    const deleteResponse = await this.model.findByIdAndRemove(id);
    return Promise.resolve(deleteResponse);
  }

  async updateAll(where, params) {
    where = this.transformFilter(where);
    const responseUpdate = await this.model.updateMany(where, params);
    const response = { count: responseUpdate.n };
    return Promise.resolve(response);
  }

  // // idea
  // update(propertiesToUpdate) {
  //   // this.model extend propertiesToUpdate
  //   this.model.update();
  // }
}

module.exports = MongodbConnector;