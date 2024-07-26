import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './styles.module.css';

const oceanFacts = [
    "The ocean covers more than 70% of the Earth's surface.",
    "Over 80% of the ocean is unexplored and unmapped.",
    "The world's longest mountain range is underwater.",
    "There are more historic artifacts under the sea than in all the world's museums.",
    "More than 90% of the planet's living space is in the ocean."
];

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [factIndex, setFactIndex] = useState(0);

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
           const url = "http://127.0.0.1:8080/api/auth";
           // const url = " https://focusfish-backend-orbital.onrender.com/api/auth";
            const { data: res } = await axios.post(url, data);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem("firstName", res.data.firstName);
            window.location = "/";
        } catch (error) {
            if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                setError(error.response.data.message);
            }
        }
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setFactIndex(prevIndex => (prevIndex + 1) % oceanFacts.length);
        }, 10000);

        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    return (
        <div>
            <header>
                <h1>FocusFish <Link to="/login"><button className={styles.header_button}>Log in</button></Link></h1>
            </header>
            <div className={styles.login_container}>
                <div className={styles.login_from_container}>
                    <div className={styles.left}>
                        <form className={styles.form_container} onSubmit={handleSubmit}>
                            <h1>Login to Your Account</h1>
                            <input
                                type="email"
                                placeholder='Email'
                                name='email'
                                onChange={handleChange}
                                value={data.email}
                                required
                                className={styles.input}
                            />
                            <input
                                type="password"
                                placeholder='Password'
                                name='password'
                                onChange={handleChange}
                                value={data.password}
                                required
                                className={styles.input}
                            />
                            {error && <div className={styles.error_msg}>{error}</div>}
                            <button type="submit" className={styles.green_btn}>Login!</button>
                            {/* <p>OR</p>
                            <button className={styles.google_btn} onClick={handleGoogleSignup}>
                                Sign up with Google
                            </button> */}
                        </form>
                    </div>
                    <div className={styles.right}>
                        <h3> Don't have an account already? </h3>
                        <Link to="/signup">
                            <button type='button' className={styles.white_btn}> Sign Up </button>
                        </Link>
                    </div>
                    <div className={styles.ocean_facts}>
                        {oceanFacts[factIndex]}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
