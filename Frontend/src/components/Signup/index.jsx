import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './styles.module.css';


const Signup = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = ({currentTarget: input}) => {
        setData({...data, [input.name]: input.value});
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (data.password !== data.confirmPassword){
            setError("Passwords do not match");
            return;
        }

        //removes confirm password from the structure after checking if it matches (don't need to send to backend)
        const { confirmPassword, ...dataToSend } = data;

        try {
            const url = "http://127.0.0.1:8080/api/users";
            //const url = "https://focusfish-backend-orbital.onrender.com/api/users";
            const { data: res } = await axios.post(url, dataToSend);
            navigate("/login");
            console.log(res.message);
        } catch (error) {
            if ((error.response) && (error.response.status>=400) && (error.response.status<=500))
                setError(error.response.data.message)
        }
    }

    return (
        <div>
        <header>
            <h1>FocusFish <Link to="/login"><button className={styles.header_button}>Log in</button></Link></h1>
        </header>
            <div className = {styles.signup_container}>
            <div className = {styles.signup_from_container}>
                
                <div className = {styles.right}>
                    <form className={styles.form_container} onSubmit={handleSubmit} >
                        <h1>Create an Account</h1>
                        <input 
                            type = "text" 
                            placeholder='First Name'
                            name ='firstName'
                            onChange={handleChange}
                            value={data.firstName}
                            required
                            className={styles.input}
                        />
                        <input 
                            type = "text" 
                            placeholder='Last Name'
                            name ='lastName'
                            onChange={handleChange}
                            value={data.lastName}
                            required
                            className={styles.input}
                        />
                        <input 
                            type = "email" 
                            placeholder='Email'
                            name ='email'
                            onChange={handleChange}
                            value={data.email}
                            required
                            className={styles.input}
                        />
                        <input 
                            type = "password" 
                            placeholder='Password'
                            name ='password'
                            onChange={handleChange}
                            value={data.password}
                            required
                            className={styles.input}
                        />
                        <input
                                type="password"
                                placeholder="Confirm Password"  // New input field for confirm password
                                name="confirmPassword"
                                onChange={handleChange}
                                value={data.confirmPassword}
                                required
                                className={styles.input}
                        />
                        {error && <div className={styles.error_msg}>{error}</div>}
                        <button type="submit" className={styles.green_btn}>Sign Up!</button>
                    </form>
                </div>
                <div className = {styles.left}>
                    <h3> Have an account already? </h3>
                    <Link to="/login">
                    <button type='button' className={styles.white_btn}> Log in </button>
                    </Link>
                </div>
            </div>
        </div>
        </div>
    )
};

export default Signup;
