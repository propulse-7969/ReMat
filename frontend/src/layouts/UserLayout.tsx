import { Outlet } from "react-router-dom";
import NavBar from "../pages/components/NavBar";


const UserLayout = () => {
    return (
        <>
            <NavBar
                items={[
                    { title: 'Dashboard', link: '/user/dashboard' },
                    { title: 'Profile', link: '/user/profile' },
                    { title: 'Recycle', link: '/user/recycle' },
                    { title: 'Rewards', link: '/user/rewards' },
                    { title: 'Transactions', link: '/user/transactions' },
                    { title: 'Leaderboard', link: '/user/leaderboard' },
                ]}
            />
            <Outlet />
        </>
    )
}

export default UserLayout