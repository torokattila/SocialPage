import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function Registration() {
    const initialValues = {
        username: '',
        password: ''
    };

    const history = useHistory();

    const validationSchema = Yup.object().shape({
        username: Yup.string()
                    .min(3, "The username must be at least 3 characters long!")
                    .max(15, "The username must be maximum 15 characters long!")
                    .required("You must provide a username!"),
        password: Yup.string()
                    .min(4, "The password must be at least 4 characters long!")
                    .max(20, "The password must be maximum 20 characters long!")
                    .required("You must provide a password!")
    });

    const onSubmit = (data) => {
        axios.post('http://localhost: 3001/registeruser', data).then((response) => {
            console.log(response);
            history.push('/login')
        });
    }
    return (
        <div>
            
        </div>
    )
}

export default Registration;
