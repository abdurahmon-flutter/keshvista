import React from 'react';
import './style.css';
import ntf from "./assets/nft.jpg";
import logo from "../assets/logo.png";
import { useEffect, useState } from 'react';
import { ENDPOINT } from '../utils';
const Landing = () => {
    const [formData, setFormData] = useState({
        name: '',
        leaningCenterName: '',
        phoneNumber: '',
        message: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Check if 'isLoggedIn' is false in local storage
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        if (loggedInStatus) {
            window.location.href = '/';
        }
    }, []);

    const handleToggleMenu = () => {
        const navMenu = document.querySelector("#navMenu");
        navMenu.classList.toggle("active");
    };

    const handleScrollToSection = (sectionClass) => {
        document.querySelector(sectionClass).scrollIntoView({ behavior: 'smooth' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const submitForm = async () => {
        setIsSubmitting(true);
        setSuccessMessage('Yuborilmoqda'); // Change button text

        try {
            const response = await fetch(`${ENDPOINT}/request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            console.log('Success:', data);
            setSuccessMessage('Yuborganingiz uchun raxmat!🙋');
            setFormData({ name: '', leaningCenterName: '', phoneNumber: '', message: '' });
        } catch (error) {
            alert('There was a problem with your request.');
            console.error('Error:', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="main">
            {/* Navbar */}
            <div className="navbar">
                <a href="/" className="logo">Keshvista</a>
                <div className="nav-links">
                    <span className="item selected">Uy</span>
                    <span id="scroll" className="item" onClick={() => handleScrollToSection('.get-started')}>Boshlash</span>
                </div>
                <div className="nav-buttons" id="navMenu">
                    <a href="tel:+998940359387">
                        <button className="nav-btn selected">Bog'lanish</button>
                    </a>
                    <a href="../login/">
                        <button className="nav-btn">Kirish</button>
                    </a>
                </div>

                <button className="toggler">
                    <i className='bx bx-menu'></i>
                </button>
            </div>
            {/* End of Navbar */}

            {/* Top Container */}
            <div className="top-container">
                <div className="info-box">
                    <p className="header">
                        O'quv markazingizni boshqarish muomo emas
                    </p>
                    <p className="info-text">
                        Shunchaki Keshvista ga sorov qoldiring va murakkab tizimlashtirilgan o'quv markazingizga 1 oylik tekin ega bo'ling. Unutmang biz uchun ta'lim sifati birinchi o'rinda
                    </p>
                    <div className="info-buttons">
                        <button id="re-button"  onClick={() => handleScrollToSection('.footer')} className="info-btn selected">So'rov qoldirish</button>
                        <a href="/login/">
                            <button className="info-btn nav-btn">Kirish</button>
                        </a>
                    </div>
                </div>
                <div className="nft-box">
                    <img src={ntf} className="nft-pic" alt="NFT" />
                    <div className="nft-content">
                        <div className="info">
                            <img src={logo} className="info-img" alt="Keshvista Logo" />
                            <h4>Keshvista</h4>
                        </div>
                        <div className="likes">
                            Multi-Platform
                        </div>
                    </div>
                </div>
            </div>

            <div className="get-started">
                <p className="header">Birinchi tasurot</p>
                <p className="info-text">Yirik oquv markazlarni oson boshqarish platformasi</p>
                <div className="items-box">
                    <div className="item-container">
                        <div className="item">
                            <i className='bx bx-check-shield'></i>
                        </div>
                        <p>Xavfsiz</p>
                    </div>
                    <div className="item-container">
                        <div className="item">
                            <i className='bx bx-wallet-alt'></i>
                        </div>
                        <p>Moliyaviy Erkinlik</p>
                    </div>
                    <div className="item-container">
                        <div className="item">
                            <i className='bx bx-money'></i>
                        </div>
                        <p>Suv tekin narxlar</p>
                    </div>
                    <div className="item-container">
                        <div className="item">
                            <i className='bx bx-rocket'></i>
                        </div>
                        <p>Juda tez ilovalar</p>
                    </div>
                </div>
            </div>
            

            <div className="footer">
                <div className="footer-header">
                    Agar siz xavfsiz va sifatli avtomatlashtirishni xohlasangiz so'rov qoldiring
                </div>
                <br />
                <form id="requestForm" className="form" onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
                    <input type="text" name="name" className="glass-input" placeholder="Ismingiz.." value={formData.name} onChange={handleFormChange} />
                    <input type="text" name="leaningCenterName" className="glass-input" placeholder="O'quv markazingiz nomi.." value={formData.leaningCenterName} onChange={handleFormChange} />
                    <input type="text" name="phoneNumber" className="glass-input" placeholder="Telefon raqamingiz" value={formData.phoneNumber} onChange={handleFormChange} />
                    <input type="text" name="message" className="glass-input" placeholder="Izoh.." value={formData.message} onChange={handleFormChange} />
                    <button type="submit" className="form-request-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Yuborilmoqda' : 'Yuborish'}
                    </button>
                </form>
                {successMessage && <div className="success">{successMessage}</div>}
            </div>

            {/* Footer */}
            
            {/* End of Footer */}
            <div className="copyright">
                <p>Copyright 2024, KESHVISTA ORIGIN.</p>
            </div>
        </div>
    );
}

export default Landing