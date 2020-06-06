import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet'

import Dropzone from '../../components/Dropzone'
import api from '../../services/api';
import logo from '../../assets/logo.svg';

import './styles.css'

interface Item {
    id: number;
    titulo: string;
    imgURL: string;
}

interface IbgeUF {
    sigla: string;
}

interface IbgeCidade {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cidades, setCidades] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',

    });

    const [selectedFile, setSelectedFile] = useState<File>();
    const [selectedUf, setSelectedUf] = useState<string>('0');
    const [selectedCidade, setSelectedCidade] = useState<string>('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [inicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInicialPosition([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data);
        })
    }, []);

    useEffect(() => {
        axios.get<IbgeUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufSiglas = res.data.map(uf => uf.sigla);
            setUfs(ufSiglas);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') return;

        axios.get<IbgeCidade[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const cidades = res.data.map(cidade => cidade.nome);
            setCidades(cidades);
        });

    }, [selectedUf]);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>) {
        const cidade = event.target.value;

        setSelectedCidade(cidade);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        })
    }

    function handleSelectItem(id: number) {
        if (selectedItems.includes(id)) {
            const filtredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filtredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
        console.log(selectedItems);
        
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { nome, email, whatsapp } = formData;
        const uf = selectedUf;
        const cidade = selectedCidade;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        data.append('nome', nome);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('cidade', cidade);
        data.append('uf', uf);
        data.append('items', items.join(','));
        
        if(selectedFile){
            data.append('imagem', selectedFile);
        }
        
        
        await api.post('points', data);
        alert('Ponto de coleta criado!')

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> Ponto de Coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="nome">Nome da entidade</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[40.7059674, -73.9975568]} /*center={inicialPosition}*/ zoom={16} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select name="cidade" id="cidade" value={selectedCidade} onChange={handleSelectCidade}>
                                <option value="0">Selecione uma Cidade</option>
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.imgURL} alt={item.titulo} />
                                    <span>{item.titulo}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar Ponto de Coleta
                </button>
            </form>
        </div>
    );

};

export default CreatePoint;