import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <>
            <p>strona domowa</p>
            <Link to='/calendar'>kalendarz</Link>
        </>
    )
}