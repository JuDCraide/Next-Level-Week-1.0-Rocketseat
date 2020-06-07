import express from 'express';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/pointsController'
import ItemsController from './controllers/ItemsController'

//Padrão funções dos controllers
// index -> listar
// show -> mostrar único
//create -> criar
//update -> atualizar
//delete -> excluir

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post(
    '/points',
    upload.single('imagem'),
    celebrate({
        body: Joi.object().keys({
            nome: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            cidade: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        })
    },{
        abortEarly:false,
    }),
    pointsController.create
);
 
export default routes;