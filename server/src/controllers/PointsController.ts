import { Request, Response } from 'express';
import knex from '../database/connection';

export default class PointsController {

    async index(req: Request, res: Response) {

        const { cidade, uf, items } = req.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.p_id')
            .whereIn('point_items.i_id', parsedItems)
            .where('cidade', String(cidade))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                imgURL: `http://10.0.0.103:3333/uploads/${point.imagem}`
            }
        });

        return res.json(serializedPoints);
    }

    async create(req: Request, res: Response) {

        const {
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf,
            items,
        } = req.body;

        const trx = await knex.transaction();

        const point = {
            imagem: req.file.filename,
            nome,
            email,
            whatsapp,
            latitude,
            longitude,
            cidade,
            uf,
        }

        const ids = await trx('points').insert(point);

        const p_id = ids[0];

        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((i_id: number) => {
                return {
                    i_id,
                    p_id,
                }
            });

        await trx('point_items').insert(pointItems);

        trx.commit();

        return res.json({
            id: p_id,
            ...point,
        });
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return res.status(400).json({ message: 'Point not found.' });
        }

        const serializedPoint = {
            ...point,
            imgURL: `http://10.0.0.103:3333/uploads/${point.imagem}`
        };

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.i_id')
            .where('point_items.p_id', id)
            .select('items.titulo')

        return res.json({ point: serializedPoint, items });
    }
}