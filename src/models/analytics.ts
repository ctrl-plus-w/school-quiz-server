import { Optional, Sequelize, Model, DataTypes, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin } from 'sequelize';

import { Event } from './event';
import { User } from './user';

interface AnalyticsAttributes {
  id: number;
  startedAt: Date;
  endedAt: Date;
  score: number;
  maxScore: number;
}

export type AnalyticsCreationAttributes = Optional<AnalyticsAttributes, 'id' | 'endedAt' | 'score' | 'maxScore'>;

export class Analytic extends Model<AnalyticsAttributes, AnalyticsCreationAttributes> implements AnalyticsAttributes {
  public id!: number;
  public startedAt!: Date;
  public endedAt!: Date;
  public score!: number;
  public maxScore!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* User properties. */
  public setUser!: BelongsToSetAssociationMixin<User, number>;
  public getUser!: BelongsToGetAssociationMixin<User>;

  /* Event properties. */
  public setEvent!: BelongsToSetAssociationMixin<Event, number>;
  public getEvent!: BelongsToGetAssociationMixin<Event>;
}

export default (sequelize: Sequelize): typeof Analytic => {
  Analytic.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'analytic',
      tableName: 'Analytic',
    }
  );

  return Analytic;
};
