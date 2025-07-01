import { Routes, Route } from "react-router-dom"
import NotFound from "./NotFound"
import Landing from "../pages/public/Landing"
import Login from "../pages/public/Login"
import Register from "../pages/public/Register"

const Public = ({ setRefreshHeader }) => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setRefreshHeader={setRefreshHeader} />} />
            <Route path="/register" element={<Register setRefreshHeader={setRefreshHeader} />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    )
}

export default Public