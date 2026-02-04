import { Link } from 'react-router-dom'
import './NavBar.css'

type NavItem = { title: string; link: string };

type Props = { items?: NavItem[] };

const NavBar = (props: Props) => {
    const { items } = props;
    const navItems: NavItem[] =
        items ?? [
            { title: 'Dummy1', link: '#' },
            { title: 'Dummy2', link: '#' },
            { title: 'Dummy3', link: '#' },
        ];

    return (
        <div>
            <nav>
                <h2>Title</h2>
                <ul>
                    {navItems.map((it, idx) => (
                        <li key={idx}>
                            <Link to={it.link}>{it.title}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default NavBar
