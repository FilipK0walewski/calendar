import { Link } from "react-router-dom";
import { useSelector } from 'react-redux'

export const Home = () => {
    const username = useSelector((state) => state.common.username)
    const admin = useSelector((state) => state.common.admin)

    return (
        <>
            <h1 className="text-xl">Witaj {username}!</h1>
            <ul className="list-disc list-inside">
                <li><Link to='/calendar'>Kalendarz</Link></li>
                {admin === true ? <li><Link to='/types-of-services'>Zarządzanie rodzajami usług</Link></li> : null}
                <li><Link to='/finished-jobs'>Zakończone zlecenia</Link></li>
            </ul>
        </>
    )
}