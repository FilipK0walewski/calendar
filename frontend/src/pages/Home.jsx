import { Link } from "react-router-dom";
import { useSelector } from 'react-redux'


export const Home = () => {
    const username = useSelector((state) => state.common.username)
    const admin = useSelector((state) => state.common.admin)

    return (
        <>
            <h1 className="text-xl">Witaj {username}!</h1>
            <ul className="list-disc list-inside">
                <li className="underline"><Link to='/calendar'>kalendarz</Link></li>
                {admin === true ? <li className="underline"><Link to='/types-of-services'>zarządzanie rodzajami usług</Link></li> : null}
            </ul>
        </>
    )
}