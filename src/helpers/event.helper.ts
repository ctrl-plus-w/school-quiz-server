import { Op, WhereOptions } from 'sequelize';

export const getEventDateConditions = (start: Date, end: Date): WhereOptions => ({
  [Op.or]: [
    // Get every events that ends between the datetimes
    { end: { [Op.gte]: start, [Op.lte]: end } },
    // Get every events that starts between the datetimes
    { start: { [Op.gte]: start, [Op.lte]: end } },
    // Get every events that start between and ends after the datetimes
    { start: { [Op.lte]: start }, end: { [Op.gte]: end } },
    // Get every events that start after and ends before the datetimes
    { start: { [Op.gte]: start }, end: { [Op.lte]: end } },
  ],
});
