import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi'

import './styles.css'

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {

    const [selectesFileURL, setSelectesFileURL] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];;
        const fileURL = URL.createObjectURL(file);

        setSelectesFileURL(fileURL);
        onFileUploaded(file);
    }, [onFileUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />
            {selectesFileURL ?
                <img src={selectesFileURL} alt="Point thumbnail" /> :
                isDragActive ?
                    <p><FiUpload />Solte a Imagem aqui...</p> :
                    <p><FiUpload /> Solte ou clique para selecionar a Imagem do Estabelecimento</p>
            }
        </div>
    )
}

export default Dropzone;