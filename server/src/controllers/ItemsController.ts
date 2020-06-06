import { Request, Response, response } from 'express';
import knex from '../database/connection';

export default class ItemsController {
    async index(req: Request, res: Response) {
        const items = await knex('items').select('*');

        const serealizaedItems = items.map(item => {
            return {
                id: item.id,
                titulo: item.titulo,
                imgURL: `http://10.0.0.103:3333/uploads/${item.imagem}`,
            }
        })

        return res.json(serealizaedItems);
    }
}