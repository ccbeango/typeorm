"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CockroachDriver_1 = require("../driver/cockroachdb/CockroachDriver");
var SapDriver_1 = require("../driver/sap/SapDriver");
var QueryBuilder_1 = require("./QueryBuilder");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var PostgresDriver_1 = require("../driver/postgres/PostgresDriver");
var EntityMetadata_1 = require("../metadata/EntityMetadata");
var UpdateResult_1 = require("./result/UpdateResult");
var ReturningStatementNotSupportedError_1 = require("../error/ReturningStatementNotSupportedError");
var ReturningResultsEntityUpdator_1 = require("./ReturningResultsEntityUpdator");
var SqljsDriver_1 = require("../driver/sqljs/SqljsDriver");
var MysqlDriver_1 = require("../driver/mysql/MysqlDriver");
var BroadcasterResult_1 = require("../subscriber/BroadcasterResult");
var AbstractSqliteDriver_1 = require("../driver/sqlite-abstract/AbstractSqliteDriver");
var LimitOnUpdateNotSupportedError_1 = require("../error/LimitOnUpdateNotSupportedError");
var OracleDriver_1 = require("../driver/oracle/OracleDriver");
var UpdateValuesMissingError_1 = require("../error/UpdateValuesMissingError");
var EntityColumnNotFound_1 = require("../error/EntityColumnNotFound");
var AuroraDataApiDriver_1 = require("../driver/aurora-data-api/AuroraDataApiDriver");
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var UpdateQueryBuilder = /** @class */ (function (_super) {
    tslib_1.__extends(UpdateQueryBuilder, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function UpdateQueryBuilder(connectionOrQueryBuilder, queryRunner) {
        var _this = _super.call(this, connectionOrQueryBuilder, queryRunner) || this;
        _this.expressionMap.aliasNamePrefixingEnabled = false;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    UpdateQueryBuilder.prototype.getQuery = function () {
        var sql = this.createUpdateExpression();
        sql += this.createOrderByExpression();
        sql += this.createLimitExpression();
        return sql.trim();
    };
    /**
     * Executes sql generated by query builder and returns raw database results.
     */
    UpdateQueryBuilder.prototype.execute = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var queryRunner, transactionStartedByUs, broadcastResult, declareSql, selectOutputSql, returningResultsEntityUpdator, _a, updateSql, parameters, updateResult, statements, result, broadcastResult, error_1, rollbackError_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        queryRunner = this.obtainQueryRunner();
                        transactionStartedByUs = false;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 13, 18, 23]);
                        if (!(this.expressionMap.useTransaction === true && queryRunner.isTransactionActive === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 2:
                        _b.sent();
                        transactionStartedByUs = true;
                        _b.label = 3;
                    case 3:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 5];
                        broadcastResult = new BroadcasterResult_1.BroadcasterResult();
                        queryRunner.broadcaster.broadcastBeforeUpdateEvent(broadcastResult, this.expressionMap.mainAlias.metadata, this.expressionMap.valuesSet);
                        if (!(broadcastResult.promises.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(broadcastResult.promises)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        declareSql = null;
                        selectOutputSql = null;
                        returningResultsEntityUpdator = new ReturningResultsEntityUpdator_1.ReturningResultsEntityUpdator(queryRunner, this.expressionMap);
                        if (this.expressionMap.updateEntity === true &&
                            this.expressionMap.mainAlias.hasMetadata &&
                            this.expressionMap.whereEntities.length > 0) {
                            this.expressionMap.extraReturningColumns = returningResultsEntityUpdator.getUpdationReturningColumns();
                            if (this.expressionMap.extraReturningColumns.length > 0 && this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
                                declareSql = this.connection.driver.buildTableVariableDeclaration("@OutputTable", this.expressionMap.extraReturningColumns);
                                selectOutputSql = "SELECT * FROM @OutputTable";
                            }
                        }
                        _a = tslib_1.__read(this.getQueryAndParameters(), 2), updateSql = _a[0], parameters = _a[1];
                        updateResult = new UpdateResult_1.UpdateResult();
                        statements = [declareSql, updateSql, selectOutputSql];
                        return [4 /*yield*/, queryRunner.query(statements.filter(function (sql) { return sql != null; }).join(";\n\n"), parameters)];
                    case 6:
                        result = _b.sent();
                        if (this.connection.driver instanceof PostgresDriver_1.PostgresDriver) {
                            updateResult.raw = result[0];
                            updateResult.affected = result[1];
                        }
                        else {
                            updateResult.raw = result;
                        }
                        if (!(this.expressionMap.updateEntity === true &&
                            this.expressionMap.mainAlias.hasMetadata &&
                            this.expressionMap.whereEntities.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, returningResultsEntityUpdator.update(updateResult, this.expressionMap.whereEntities)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 10];
                        broadcastResult = new BroadcasterResult_1.BroadcasterResult();
                        queryRunner.broadcaster.broadcastAfterUpdateEvent(broadcastResult, this.expressionMap.mainAlias.metadata);
                        if (!(broadcastResult.promises.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, Promise.all(broadcastResult.promises)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        if (!transactionStartedByUs) return [3 /*break*/, 12];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [2 /*return*/, updateResult];
                    case 13:
                        error_1 = _b.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 17];
                        _b.label = 14;
                    case 14:
                        _b.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 15:
                        _b.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        rollbackError_1 = _b.sent();
                        return [3 /*break*/, 17];
                    case 17: throw error_1;
                    case 18:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 20];
                        return [4 /*yield*/, queryRunner.release()];
                    case 19:
                        _b.sent();
                        _b.label = 20;
                    case 20:
                        if (!(this.connection.driver instanceof SqljsDriver_1.SqljsDriver && !queryRunner.isTransactionActive)) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.connection.driver.autoSave()];
                    case 21:
                        _b.sent();
                        _b.label = 22;
                    case 22: return [7 /*endfinally*/];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Values needs to be updated.
     */
    UpdateQueryBuilder.prototype.set = function (values) {
        this.expressionMap.valuesSet = values;
        return this;
    };
    /**
     * Sets WHERE condition in the query builder.
     * If you had previously WHERE expression defined,
     * calling this function will override previously set WHERE conditions.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.where = function (where, parameters) {
        this.expressionMap.wheres = []; // don't move this block below since computeWhereParameter can add where expressions
        var condition = this.computeWhereParameter(where);
        if (condition)
            this.expressionMap.wheres = [{ type: "simple", condition: condition }];
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.andWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "and", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.orWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "or", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.whereInIds = function (ids) {
        return this.where(this.createWhereIdsExpression(ids));
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.andWhereInIds = function (ids) {
        return this.andWhere(this.createWhereIdsExpression(ids));
    };
    /**
     * Adds new OR WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.orWhereInIds = function (ids) {
        return this.orWhere(this.createWhereIdsExpression(ids));
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.returning = function (returning) {
        // not all databases support returning/output cause
        if (!this.connection.driver.isReturningSqlSupported())
            throw new ReturningStatementNotSupportedError_1.ReturningStatementNotSupportedError();
        this.expressionMap.returning = returning;
        return this;
    };
    /**
     * Sets ORDER BY condition in the query builder.
     * If you had previously ORDER BY expression defined,
     * calling this function will override previously set ORDER BY conditions.
     */
    UpdateQueryBuilder.prototype.orderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        var _a, _b;
        if (sort) {
            if (sort instanceof Object) {
                this.expressionMap.orderBys = sort;
            }
            else {
                if (nulls) {
                    this.expressionMap.orderBys = (_a = {}, _a[sort] = { order: order, nulls: nulls }, _a);
                }
                else {
                    this.expressionMap.orderBys = (_b = {}, _b[sort] = order, _b);
                }
            }
        }
        else {
            this.expressionMap.orderBys = {};
        }
        return this;
    };
    /**
     * Adds ORDER BY condition in the query builder.
     */
    UpdateQueryBuilder.prototype.addOrderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (nulls) {
            this.expressionMap.orderBys[sort] = { order: order, nulls: nulls };
        }
        else {
            this.expressionMap.orderBys[sort] = order;
        }
        return this;
    };
    /**
     * Sets LIMIT - maximum number of rows to be selected.
     */
    UpdateQueryBuilder.prototype.limit = function (limit) {
        this.expressionMap.limit = limit;
        return this;
    };
    /**
     * Indicates if entity must be updated after update operation.
     * This may produce extra query or use RETURNING / OUTPUT statement (depend on database).
     * Enabled by default.
     */
    UpdateQueryBuilder.prototype.whereEntity = function (entity) {
        var _this = this;
        if (!this.expressionMap.mainAlias.hasMetadata)
            throw new Error(".whereEntity method can only be used on queries which update real entity table.");
        this.expressionMap.wheres = [];
        var entities = Array.isArray(entity) ? entity : [entity];
        entities.forEach(function (entity) {
            var entityIdMap = _this.expressionMap.mainAlias.metadata.getEntityIdMap(entity);
            if (!entityIdMap)
                throw new Error("Provided entity does not have ids set, cannot perform operation.");
            _this.orWhereInIds(entityIdMap);
        });
        this.expressionMap.whereEntities = entities;
        return this;
    };
    /**
     * Indicates if entity must be updated after update operation.
     * This may produce extra query or use RETURNING / OUTPUT statement (depend on database).
     * Enabled by default.
     */
    UpdateQueryBuilder.prototype.updateEntity = function (enabled) {
        this.expressionMap.updateEntity = enabled;
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates UPDATE express used to perform insert query.
     */
    UpdateQueryBuilder.prototype.createUpdateExpression = function () {
        var _this = this;
        var valuesSet = this.getValueSet();
        var metadata = this.expressionMap.mainAlias.hasMetadata ? this.expressionMap.mainAlias.metadata : undefined;
        // prepare columns and values to be updated
        var updateColumnAndValues = [];
        var newParameters = {};
        var parametersCount = this.connection.driver instanceof MysqlDriver_1.MysqlDriver ||
            this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver ||
            this.connection.driver instanceof OracleDriver_1.OracleDriver ||
            this.connection.driver instanceof AbstractSqliteDriver_1.AbstractSqliteDriver ||
            this.connection.driver instanceof SapDriver_1.SapDriver
            ? 0 : Object.keys(this.expressionMap.nativeParameters).length;
        if (metadata) {
            EntityMetadata_1.EntityMetadata.createPropertyPath(metadata, valuesSet).forEach(function (propertyPath) {
                // todo: make this and other query builder to work with properly with tables without metadata
                var columns = metadata.findColumnsWithPropertyPath(propertyPath);
                if (columns.length <= 0) {
                    throw new EntityColumnNotFound_1.EntityColumnNotFound(propertyPath);
                }
                columns.forEach(function (column) {
                    if (!column.isUpdate) {
                        return;
                    }
                    var paramName = "upd_" + column.databaseName;
                    //
                    var value = column.getEntityValue(valuesSet);
                    if (column.referencedColumn && value instanceof Object) {
                        value = column.referencedColumn.getEntityValue(value);
                    }
                    else if (!(value instanceof Function)) {
                        value = _this.connection.driver.preparePersistentValue(value, column);
                    }
                    // todo: duplication zone
                    if (value instanceof Function) { // support for SQL expressions in update query
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = " + value());
                    }
                    else if (_this.connection.driver instanceof SapDriver_1.SapDriver && value === null) {
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = NULL");
                    }
                    else {
                        if (_this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
                            value = _this.connection.driver.parametrizeValue(column, value);
                            // } else if (value instanceof Array) {
                            //     value = new ArrayParameter(value);
                        }
                        if (_this.connection.driver instanceof MysqlDriver_1.MysqlDriver ||
                            _this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver ||
                            _this.connection.driver instanceof OracleDriver_1.OracleDriver ||
                            _this.connection.driver instanceof AbstractSqliteDriver_1.AbstractSqliteDriver ||
                            _this.connection.driver instanceof SapDriver_1.SapDriver) {
                            newParameters[paramName] = value;
                        }
                        else {
                            _this.expressionMap.nativeParameters[paramName] = value;
                        }
                        var expression = null;
                        if ((_this.connection.driver instanceof MysqlDriver_1.MysqlDriver || _this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver) && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            var useLegacy = _this.connection.driver.options.legacySpatialSupport;
                            var geomFromText = useLegacy ? "GeomFromText" : "ST_GeomFromText";
                            if (column.srid != null) {
                                expression = geomFromText + "(" + _this.connection.driver.createParameter(paramName, parametersCount) + ", " + column.srid + ")";
                            }
                            else {
                                expression = geomFromText + "(" + _this.connection.driver.createParameter(paramName, parametersCount) + ")";
                            }
                        }
                        else if (_this.connection.driver instanceof PostgresDriver_1.PostgresDriver && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            if (column.srid != null) {
                                expression = "ST_SetSRID(ST_GeomFromGeoJSON(" + _this.connection.driver.createParameter(paramName, parametersCount) + "), " + column.srid + ")::" + column.type;
                            }
                            else {
                                expression = "ST_GeomFromGeoJSON(" + _this.connection.driver.createParameter(paramName, parametersCount) + ")::" + column.type;
                            }
                        }
                        else {
                            expression = _this.connection.driver.createParameter(paramName, parametersCount);
                        }
                        updateColumnAndValues.push(_this.escape(column.databaseName) + " = " + expression);
                        parametersCount++;
                    }
                });
            });
            if (metadata.versionColumn)
                updateColumnAndValues.push(this.escape(metadata.versionColumn.databaseName) + " = " + this.escape(metadata.versionColumn.databaseName) + " + 1");
            if (metadata.updateDateColumn)
                updateColumnAndValues.push(this.escape(metadata.updateDateColumn.databaseName) + " = CURRENT_TIMESTAMP"); // todo: fix issue with CURRENT_TIMESTAMP(6) being used, can "DEFAULT" be used?!
        }
        else {
            Object.keys(valuesSet).map(function (key) {
                var value = valuesSet[key];
                // todo: duplication zone
                if (value instanceof Function) { // support for SQL expressions in update query
                    updateColumnAndValues.push(_this.escape(key) + " = " + value());
                }
                else if (_this.connection.driver instanceof SapDriver_1.SapDriver && value === null) {
                    updateColumnAndValues.push(_this.escape(key) + " = NULL");
                }
                else {
                    // we need to store array values in a special class to make sure parameter replacement will work correctly
                    // if (value instanceof Array)
                    //     value = new ArrayParameter(value);
                    if (_this.connection.driver instanceof MysqlDriver_1.MysqlDriver ||
                        _this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver ||
                        _this.connection.driver instanceof OracleDriver_1.OracleDriver ||
                        _this.connection.driver instanceof AbstractSqliteDriver_1.AbstractSqliteDriver ||
                        _this.connection.driver instanceof SapDriver_1.SapDriver) {
                        newParameters[key] = value;
                    }
                    else {
                        _this.expressionMap.nativeParameters[key] = value;
                    }
                    updateColumnAndValues.push(_this.escape(key) + " = " + _this.connection.driver.createParameter(key, parametersCount));
                    parametersCount++;
                }
            });
        }
        if (updateColumnAndValues.length <= 0) {
            throw new UpdateValuesMissingError_1.UpdateValuesMissingError();
        }
        // we re-write parameters this way because we want our "UPDATE ... SET" parameters to be first in the list of "nativeParameters"
        // because some drivers like mysql depend on order of parameters
        if (this.connection.driver instanceof MysqlDriver_1.MysqlDriver ||
            this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver ||
            this.connection.driver instanceof OracleDriver_1.OracleDriver ||
            this.connection.driver instanceof AbstractSqliteDriver_1.AbstractSqliteDriver ||
            this.connection.driver instanceof SapDriver_1.SapDriver) {
            this.expressionMap.nativeParameters = Object.assign(newParameters, this.expressionMap.nativeParameters);
        }
        // get a table name and all column database names
        var whereExpression = this.createWhereExpression();
        var returningExpression = this.createReturningExpression();
        // generate and return sql update query
        if (returningExpression && (this.connection.driver instanceof PostgresDriver_1.PostgresDriver || this.connection.driver instanceof OracleDriver_1.OracleDriver || this.connection.driver instanceof CockroachDriver_1.CockroachDriver)) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression + " RETURNING " + returningExpression;
        }
        else if (returningExpression && this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + " OUTPUT " + returningExpression + whereExpression;
        }
        else {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression; // todo: how do we replace aliases in where to nothing?
        }
    };
    /**
     * Creates "ORDER BY" part of SQL query.
     */
    UpdateQueryBuilder.prototype.createOrderByExpression = function () {
        var _this = this;
        var orderBys = this.expressionMap.orderBys;
        if (Object.keys(orderBys).length > 0)
            return " ORDER BY " + Object.keys(orderBys)
                .map(function (columnName) {
                if (typeof orderBys[columnName] === "string") {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName];
                }
                else {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName].order + " " + orderBys[columnName].nulls;
                }
            })
                .join(", ");
        return "";
    };
    /**
     * Creates "LIMIT" parts of SQL query.
     */
    UpdateQueryBuilder.prototype.createLimitExpression = function () {
        var limit = this.expressionMap.limit;
        if (limit) {
            if (this.connection.driver instanceof MysqlDriver_1.MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver_1.AuroraDataApiDriver) {
                return " LIMIT " + limit;
            }
            else {
                throw new LimitOnUpdateNotSupportedError_1.LimitOnUpdateNotSupportedError();
            }
        }
        return "";
    };
    /**
     * Gets array of values need to be inserted into the target table.
     */
    UpdateQueryBuilder.prototype.getValueSet = function () {
        if (this.expressionMap.valuesSet instanceof Object)
            return this.expressionMap.valuesSet;
        throw new UpdateValuesMissingError_1.UpdateValuesMissingError();
    };
    return UpdateQueryBuilder;
}(QueryBuilder_1.QueryBuilder));
exports.UpdateQueryBuilder = UpdateQueryBuilder;

//# sourceMappingURL=UpdateQueryBuilder.js.map
