import { SVGAttributes } from 'react';
import Logo  from '../../image/1.png';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img {...props} src={Logo} alt="logo" />
    );
}
