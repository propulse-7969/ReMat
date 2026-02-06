import { Outlet } from "react-router-dom";
//import NavBar from "../pages/components/NavBar";
import PillNav from "../pages/components/PillNav";
import Grainient from "../pages/components/Granient";
import logo from "../../public/tab-logo.png"
import Footer from "../pages/components/Footer";


const UserLayout = () => {
    const items = [
                    { label: 'Dashboard', href: '/user/dashboard' },
                    { label: 'Profile', href: '/user/profile' },
                    { label: 'Recycle', href: '/user/recycle' },
                    { label: 'Rewards', href: '/user/rewards' },
                    { label: 'Transactions', href: '/user/transactions' },
                    { label: 'Leaderboard', href: '/user/leaderboard' },
                ];
    return (
        <div className="relative min-h-screen w-full">
            {/* Grainient Background */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Grainient
                    color1="#555555"
                    color2="#24641b"
                    color3="#142d91"
                    timeSpeed={0.25}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={2}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.1}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.5}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
            </div>

            {/* Navbar */}
            <div className="relative w-full flex items-center justify-center">
                <PillNav
                    logo={logo}
                    logoAlt="Company Logo"
                    items={items}
                    activeHref="/"
                    className="custom-nav"
                    ease="power2.easeOut"
                    baseColor="#000000"
                    pillColor="#ffffff"
                    hoveredPillTextColor="#ffffff"
                    pillTextColor="#000000"
                    // theme="light"
                    initialLoadAnimation={false}
                />
            </div>

            {/* Content */}
            <div className="relative mx-4 pt-24">
                <Outlet />
                <Footer />
            </div>
            
        </div>
    )
}

export default UserLayout