import Knex from "knex";


export async function seed(knex: Knex) {
    await knex('items').insert([
        { titulo: 'Lâmpadas', imagem: 'lampadas.svg' },
        { titulo: 'Pilhas e Baterias', imagem: 'baterias.svg' },
        { titulo: 'Papéis e Papelão', imagem: 'papeis-papelao.svg' },
        { titulo: 'Resíduos Eletrônicos', imagem: 'eletronicos.svg' },
        { titulo: 'Resíduos Orgânicos', imagem: 'organicos.svg' },
        { titulo: 'Óleo de Cozinha', imagem: 'oleo.svg' }, 
    ])
}