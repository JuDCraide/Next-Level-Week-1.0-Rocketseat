import React from 'react';

interface HeaderProps {
    title: string; //obrigatoria
    subtitle?: string; //opcional
}

const Header: React.FC<HeaderProps> = (props) => {
    return(
        <header>
            <h1>ECOLETA {props.title}</h1>
        </header>
    )
}
export default Header;