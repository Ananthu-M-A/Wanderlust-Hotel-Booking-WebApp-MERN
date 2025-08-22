import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import { useLocation } from "react-router-dom";
import Footer from "../components/footer/Footer";
import SearchBar from "../components/search/SearchBar";
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    const { pathname } = useLocation();
    const [showComponent, setShowComponent] = useState(true);
    useEffect(() => {
        if (pathname.startsWith("/search")) {
            setShowComponent(true);
        } else {
            setShowComponent(false);
        }
    }, [pathname]);
    return (
        <>
            <Helmet>
                <title>Wanderlust Hotel Booking</title>
                <meta name="description" content="Book hotels, restaurants, and more with Wanderlust." />
            </Helmet>
            <div className='flex flex-col min-h-screen'>
                <Header />
                {showComponent && <div className="bg-img bg-cover bg-center min-h-screen">
                    <SearchBar />
                </div>}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="container mx-auto py-10 flex-1"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
                <Footer />
            </div>
        </>
    )
};

export default Layout;
