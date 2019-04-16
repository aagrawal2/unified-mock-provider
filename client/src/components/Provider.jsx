import React from 'react';
import {Dropdown, Button} from 'semantic-ui-react';
import BofaLogo from '../images/bofa.jpg';
import CitiLogo from '../images/citi.jpg';
import AmexLogo from '../images/amex.jpg';
import ComcastLogo from '../images/comcast.jpg';
import FirstTechLogo from '../images/firsttech.jpg';
import WellsFargoLogo from '../images/wellsfargo.jpg';

//import 'semantic-ui-css/semantic.min.css';
import '../scss/Provider.scss';

import provider from '../conf/provider.json';

//Load provider logos in the choose provider dropdown
(() => {
    provider.names.forEach(provider => {
        if (provider.value.toLowerCase().includes('bofa')) {
            provider.image = { avatar: true, src: BofaLogo };
        }
        else if (provider.value.toLowerCase().includes('citi')) {
            provider.image = { avatar: true, src: CitiLogo };
        }
        else if (provider.value.toLowerCase().includes('amex')) {
            provider.image = { avatar: true, src: AmexLogo };
        }
        else if (provider.value.toLowerCase().includes('comcast')) {
            provider.image = { avatar: true, src: ComcastLogo };
        }
        else if (provider.value.toLowerCase().includes('fcu')) {
            provider.image = { avatar: true, src: FirstTechLogo };
        }
        else if (provider.value.toLowerCase().includes('wf')) {
            provider.image = { avatar: true, src: WellsFargoLogo };
        }
    });
})();

const onChangeProvider = (props,data) => {
    const providerName = data.value;
    //render Accounts component
    props.setRenderAccounts(true, providerName);
};

const Provider = props => {
    
    const navigateBack = () => props.navigateBack()

    return (
        <div>
            <Button color="black" style={{ float: "right" }} icon="arrow alternate circle left" onClick={navigateBack} />
            <div className="provider">
                <Dropdown placeholder='Choose your provider' fluid search selection options={provider.names}
                    onChange={(e,data) => onChangeProvider(props,data)} />
            </div>
        </div>

    );
};

export default Provider;